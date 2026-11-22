const TransferTracking = require('../models/TransferTracking');
const Referral = require('../models/Referral');
const Hospital = require('../models/Hospital');
const {
  calculateDistanceKm,
  calculateBearing,
  getRouteWaypoints,
} = require('../services/routingService');

// Map to store active simulation intervals per referral ID
const activeSimulationTimers = new Map();

/**
 * Helper to emit Socket.IO events to the referral room
 */
const emitTrackingUpdate = (req, referralId, event, data) => {
  try {
    const io = req.app.get('io');
    if (io) {
      io.to(`referral:${referralId.toString()}`).emit(event, data);
    }
  } catch (err) {
    console.debug('Socket.IO emit error:', err.message);
  }
};

/**
 * @desc    Get tracking details for a referral
 * @route   GET /api/tracking/:referralId
 * @access  Private (Doctor, Receiving Hospital, Admin)
 */
const getTracking = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    // Find referral first
    const referral = await Referral.findOne({
      $or: [
        { _id: referralId.match(/^[0-9a-fA-F]{24}$/) ? referralId : null },
        { referralId: referralId },
      ],
    })
      .populate('selectedHospital')
      .populate('doctorId')
      .populate('createdBy');

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    // Access control: Clinician/owner, receiving hospital staff, or admin
    const isOwner =
      (referral.doctorId && (referral.doctorId._id || referral.doctorId).toString() === req.user._id.toString()) ||
      (referral.createdBy && (referral.createdBy._id || referral.createdBy).toString() === req.user._id.toString()) ||
      ['doctor', 'frontline_health_worker'].includes(req.user.role);

    const isHospital =
      req.user.role === 'hospital' &&
      req.user.hospitalId &&
      referral.selectedHospital &&
      (referral.selectedHospital._id || referral.selectedHospital).toString() === req.user.hospitalId.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHospital && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this tracking stream' });
    }

    let tracking = await TransferTracking.findOne({ referralId: referral._id });

    // If tracking not initialized yet, initialize it automatically
    if (!tracking) {
      tracking = await initializeTrackingRecord(referral);
    } else if (tracking.isSimulating && !activeSimulationTimers.has(tracking._id.toString())) {
      // Sync simulation state if server restarted
      tracking.isSimulating = false;
      await tracking.save();
    }

    res.status(200).json({
      success: true,
      data: tracking,
      referral: {
        _id: referral._id,
        referralId: referral.referralId,
        emergencyLevel: referral.emergencyLevel,
        requiredBed: referral.requiredBed,
        requiredSpecialist: referral.requiredSpecialist,
        requiredFacilities: referral.requiredFacilities,
        status: referral.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to initialize a TransferTracking document for a referral
 */
const initializeTrackingRecord = async (referral) => {
  // Determine receiving hospital
  const selectedHospId = referral.selectedHospital?._id || referral.selectedHospital;
  const receivingHosp = selectedHospId ? await Hospital.findById(selectedHospId) : null;
  const receivingCoords = receivingHosp?.location?.coordinates || [80.995, 26.865];

  // Determine referring hospital (from doctor's hospital or default Lucknow medical clinic)
  let referringName = 'Referring Triage Clinic (Hazratganj)';
  let referringCoords = [80.942, 26.852];
  let referringAddress = 'Mahatma Gandhi Marg, Hazratganj, Lucknow';

  if (referral.doctorId?.hospitalId) {
    const refHosp = await Hospital.findById(referral.doctorId.hospitalId);
    if (refHosp) {
      referringName = refHosp.name;
      referringCoords = refHosp.location?.coordinates || referringCoords;
      referringAddress = refHosp.address || referringAddress;
    }
  } else if (referral.doctorId?.hospitalName) {
    referringName = referral.doctorId.hospitalName;
  }

  // Calculate route and waypoints
  const routeData = await getRouteWaypoints(referringCoords, receivingCoords);

  const tracking = await TransferTracking.create({
    referralId: referral._id,
    referralCode: referral.referralId,
    ambulanceId: `AMB-UP-32-${Math.floor(100 + Math.random() * 900)}`,
    driverId: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
    driverName: 'Ramesh Singh (Paramedic Lead)',
    driverPhone: '+91 98765 43210',
    currentLocation: {
      type: 'Point',
      coordinates: referringCoords,
    },
    referringHospital: {
      hospitalId: referral.doctorId?.hospitalId || null,
      name: referringName,
      coordinates: referringCoords,
      address: referringAddress,
    },
    receivingHospital: {
      hospitalId: receivingHosp?._id || null,
      name: receivingHosp?.name || 'Destination Hospital',
      coordinates: receivingCoords,
      address: receivingHosp?.address || '',
    },
    status: referral.status === 'Transfer' ? 'En Route' : 'Assigned',
    distanceRemainingKm: routeData.totalDistanceKm,
    estimatedArrivalMinutes: routeData.estimatedMinutes,
    speedKmh: referral.status === 'Transfer' ? 62 : 0,
    headingDegrees: calculateBearing(referringCoords, routeData.waypoints[1] || receivingCoords),
    routeWaypoints: routeData.waypoints,
    currentWaypointIndex: 0,
    isSimulating: false,
    isDemo: true,
  });

  return tracking;
};

/**
 * @desc    Update live GPS coordinates for ambulance (manual GPS feed or driver app)
 * @route   PUT /api/tracking/:referralId/location
 * @access  Private (Driver / Authorized)
 */
const updateLocation = async (req, res, next) => {
  try {
    const { referralId } = req.params;
    const { latitude, longitude, speedKmh, status } = req.body;

    // Validate coordinates
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude coordinates',
      });
    }

    const tracking = await TransferTracking.findOne({
      $or: [
        { referralId: referralId.match(/^[0-9a-fA-F]{24}$/) ? referralId : null },
        { referralCode: referralId },
      ],
    });

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    const previousCoord = tracking.currentLocation.coordinates;
    const newCoord = [lon, lat];

    // Compute remaining distance to receiving hospital
    const destCoord = tracking.receivingHospital.coordinates;
    const distRemaining = calculateDistanceKm(newCoord, destCoord);
    const heading = calculateBearing(previousCoord, newCoord);

    const currentSpeed = speedKmh !== undefined ? Number(speedKmh) : tracking.speedKmh;
    const speedForEta = currentSpeed > 10 ? currentSpeed : 45; // fallback average 45 km/h
    const etaMinutes = Math.max(1, Math.round((distRemaining / speedForEta) * 60));

    // Determine status transitions based on proximity
    let newStatus = status || tracking.status;
    if (distRemaining <= 0.08) {
      newStatus = 'Arrived';
    } else if (distRemaining <= 1.2 && newStatus === 'En Route') {
      newStatus = 'Near Destination';
    } else if (newStatus === 'Assigned' && distRemaining < tracking.distanceRemainingKm) {
      newStatus = 'En Route';
    }

    tracking.currentLocation = {
      type: 'Point',
      coordinates: newCoord,
    };
    tracking.distanceRemainingKm = distRemaining;
    tracking.estimatedArrivalMinutes = distRemaining <= 0.08 ? 0 : etaMinutes;
    tracking.speedKmh = currentSpeed;
    tracking.headingDegrees = heading;
    tracking.status = newStatus;
    tracking.lastUpdated = new Date();

    await tracking.save();

    const payload = {
      referralId: tracking.referralId,
      referralCode: tracking.referralCode,
      latitude: lat,
      longitude: lon,
      distanceRemainingKm: tracking.distanceRemainingKm,
      estimatedArrivalMinutes: tracking.estimatedArrivalMinutes,
      speedKmh: tracking.speedKmh,
      headingDegrees: tracking.headingDegrees,
      status: tracking.status,
      lastUpdated: tracking.lastUpdated,
    };

    // Broadcast update via Socket.IO
    emitTrackingUpdate(req, tracking.referralId, 'ambulance:location:update', payload);

    res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to find or lazily initialize tracking for a referral
 */
const findOrInitTracking = async (referralId) => {
  let tracking = await TransferTracking.findOne({
    $or: [
      { referralId: referralId && referralId.match(/^[0-9a-fA-F]{24}$/) ? referralId : null },
      { referralCode: referralId },
    ],
  });

  if (!tracking) {
    const referral = await Referral.findOne({
      $or: [
        { _id: referralId && referralId.match(/^[0-9a-fA-F]{24}$/) ? referralId : null },
        { referralId: referralId },
      ],
    })
      .populate('selectedHospital')
      .populate('doctorId')
      .populate('createdBy');

    if (referral) {
      tracking = await initializeTrackingRecord(referral);
    }
  }

  return tracking;
};

/**
 * @desc    Start demo GPS simulation (moves ambulance along route waypoints)
 * @route   POST /api/tracking/:referralId/simulate/start
 * @access  Private
 */
const startSimulation = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    const tracking = await findOrInitTracking(referralId);

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    // Clear any existing simulation interval
    if (activeSimulationTimers.has(tracking._id.toString())) {
      clearInterval(activeSimulationTimers.get(tracking._id.toString()));
      activeSimulationTimers.delete(tracking._id.toString());
    }

    tracking.isSimulating = true;
    if (tracking.status === 'Assigned') {
      tracking.status = 'En Route';
    }
    await tracking.save();

    // Ensure referral status is also Transfer
    await Referral.findByIdAndUpdate(tracking.referralId, { status: 'Transfer' });

    const io = req.app.get('io');
    const waypoints = tracking.routeWaypoints || [];
    const destCoord = tracking.receivingHospital.coordinates;

    // Simulation loop running every 2.5 seconds
    const interval = setInterval(async () => {
      try {
        const currentDoc = await TransferTracking.findById(tracking._id);
        if (!currentDoc || !currentDoc.isSimulating) {
          clearInterval(interval);
          activeSimulationTimers.delete(tracking._id.toString());
          return;
        }

        let nextIdx = currentDoc.currentWaypointIndex + 1;

        if (nextIdx >= waypoints.length) {
          // Reached destination!
          clearInterval(interval);
          activeSimulationTimers.delete(tracking._id.toString());

          currentDoc.currentLocation = {
            type: 'Point',
            coordinates: destCoord,
          };
          currentDoc.distanceRemainingKm = 0;
          currentDoc.estimatedArrivalMinutes = 0;
          currentDoc.speedKmh = 0;
          currentDoc.status = 'Arrived';
          currentDoc.isSimulating = false;
          currentDoc.lastUpdated = new Date();
          await currentDoc.save();

          if (io) {
            io.to(`referral:${currentDoc.referralId.toString()}`).emit('ambulance:location:update', {
              referralId: currentDoc.referralId,
              referralCode: currentDoc.referralCode,
              latitude: destCoord[1],
              longitude: destCoord[0],
              distanceRemainingKm: 0,
              estimatedArrivalMinutes: 0,
              speedKmh: 0,
              headingDegrees: currentDoc.headingDegrees,
              status: 'Arrived',
              lastUpdated: currentDoc.lastUpdated,
            });
            io.to(`referral:${currentDoc.referralId.toString()}`).emit('ambulance:status:update', {
              status: 'Arrived',
              message: 'Ambulance docked at Emergency Bay. Transfer ready for clinical handoff.',
            });
          }
          return;
        }

        const nextCoord = waypoints[nextIdx];
        const prevCoord = currentDoc.currentLocation.coordinates;
        const distRemaining = calculateDistanceKm(nextCoord, destCoord);
        const heading = calculateBearing(prevCoord, nextCoord);

        // Realistic speeds between 55 and 75 km/h
        const speed = Math.floor(58 + Math.random() * 15);
        const etaMin = Math.max(1, Math.round((distRemaining / speed) * 60));

        let status = currentDoc.status;
        if (distRemaining <= 0.8) {
          status = 'Near Destination';
        } else {
          status = 'En Route';
        }

        currentDoc.currentWaypointIndex = nextIdx;
        currentDoc.currentLocation = {
          type: 'Point',
          coordinates: nextCoord,
        };
        currentDoc.distanceRemainingKm = distRemaining;
        currentDoc.estimatedArrivalMinutes = etaMin;
        currentDoc.speedKmh = speed;
        currentDoc.headingDegrees = heading;
        currentDoc.status = status;
        currentDoc.lastUpdated = new Date();
        await currentDoc.save();

        if (io) {
          io.to(`referral:${currentDoc.referralId.toString()}`).emit('ambulance:location:update', {
            referralId: currentDoc.referralId,
            referralCode: currentDoc.referralCode,
            latitude: nextCoord[1],
            longitude: nextCoord[0],
            distanceRemainingKm: distRemaining,
            estimatedArrivalMinutes: etaMin,
            speedKmh: speed,
            headingDegrees: heading,
            status: status,
            lastUpdated: currentDoc.lastUpdated,
          });
        }
      } catch (loopErr) {
        console.error('Error in simulation interval step:', loopErr);
      }
    }, 2500);

    activeSimulationTimers.set(tracking._id.toString(), interval);

    res.status(200).json({
      success: true,
      message: 'Demo GPS simulation started',
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pause demo simulation
 * @route   POST /api/tracking/:referralId/simulate/pause
 * @access  Private
 */
const pauseSimulation = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    const tracking = await TransferTracking.findOne({
      $or: [
        { referralId: referralId.match(/^[0-9a-fA-F]{24}$/) ? referralId : null },
        { referralCode: referralId },
      ],
    });

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    if (activeSimulationTimers.has(tracking._id.toString())) {
      clearInterval(activeSimulationTimers.get(tracking._id.toString()));
      activeSimulationTimers.delete(tracking._id.toString());
    }

    tracking.isSimulating = false;
    await tracking.save();

    emitTrackingUpdate(req, tracking.referralId, 'ambulance:status:update', {
      status: tracking.status,
      isSimulating: false,
      message: 'Simulation paused by user',
    });

    res.status(200).json({
      success: true,
      message: 'Demo simulation paused',
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Step demo simulation forward by 1 waypoint
 * @route   POST /api/tracking/:referralId/simulate/step
 * @access  Private
 */
const stepSimulation = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    const tracking = await findOrInitTracking(referralId);

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    const waypoints = tracking.routeWaypoints || [];
    const destCoord = tracking.receivingHospital.coordinates;

    let nextIdx = tracking.currentWaypointIndex + 1;
    if (nextIdx >= waypoints.length) {
      nextIdx = waypoints.length - 1;
    }

    const nextCoord = waypoints[nextIdx];
    const prevCoord = tracking.currentLocation.coordinates;
    const distRemaining = calculateDistanceKm(nextCoord, destCoord);
    const heading = calculateBearing(prevCoord, nextCoord);

    tracking.currentWaypointIndex = nextIdx;
    tracking.currentLocation = {
      type: 'Point',
      coordinates: nextCoord,
    };
    tracking.distanceRemainingKm = distRemaining;
    tracking.headingDegrees = heading;
    tracking.speedKmh = distRemaining <= 0.05 ? 0 : 65;
    tracking.estimatedArrivalMinutes = distRemaining <= 0.05 ? 0 : Math.max(1, Math.round(distRemaining * 1.5));
    tracking.status = distRemaining <= 0.05 ? 'Arrived' : distRemaining <= 1.0 ? 'Near Destination' : 'En Route';
    tracking.lastUpdated = new Date();

    await tracking.save();

    emitTrackingUpdate(req, tracking.referralId, 'ambulance:location:update', {
      referralId: tracking.referralId,
      referralCode: tracking.referralCode,
      latitude: nextCoord[1],
      longitude: nextCoord[0],
      distanceRemainingKm: distRemaining,
      estimatedArrivalMinutes: tracking.estimatedArrivalMinutes,
      speedKmh: tracking.speedKmh,
      headingDegrees: heading,
      status: tracking.status,
      lastUpdated: tracking.lastUpdated,
    });

    res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset simulation back to starting clinic
 * @route   POST /api/tracking/:referralId/simulate/reset
 * @access  Private
 */
const resetSimulation = async (req, res, next) => {
  try {
    const { referralId } = req.params;

    const tracking = await findOrInitTracking(referralId);

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    if (activeSimulationTimers.has(tracking._id.toString())) {
      clearInterval(activeSimulationTimers.get(tracking._id.toString()));
      activeSimulationTimers.delete(tracking._id.toString());
    }

    const startCoord = tracking.referringHospital.coordinates;
    const destCoord = tracking.receivingHospital.coordinates;
    const totalDist = calculateDistanceKm(startCoord, destCoord);

    tracking.currentWaypointIndex = 0;
    tracking.currentLocation = {
      type: 'Point',
      coordinates: startCoord,
    };
    tracking.distanceRemainingKm = totalDist;
    tracking.estimatedArrivalMinutes = Math.max(5, Math.round(totalDist * 1.6));
    tracking.speedKmh = 0;
    tracking.status = 'Assigned';
    tracking.isSimulating = false;
    tracking.lastUpdated = new Date();

    await tracking.save();

    emitTrackingUpdate(req, tracking.referralId, 'ambulance:location:update', {
      referralId: tracking.referralId,
      referralCode: tracking.referralCode,
      latitude: startCoord[1],
      longitude: startCoord[0],
      distanceRemainingKm: totalDist,
      estimatedArrivalMinutes: tracking.estimatedArrivalMinutes,
      speedKmh: 0,
      headingDegrees: 0,
      status: 'Assigned',
      lastUpdated: tracking.lastUpdated,
    });

    res.status(200).json({
      success: true,
      message: 'Simulation reset to starting clinic',
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTracking,
  updateLocation,
  startSimulation,
  pauseSimulation,
  stepSimulation,
  resetSimulation,
};
