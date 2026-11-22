const Hospital = require('../models/Hospital');
const {
  getResourceFreshness,
  calculateHaversineDistance,
  FACILITY_TIERS,
  MANDATORY_DISCLAIMER,
} = require('../services/hospitalMatchingService');

/**
 * @desc    Get all registered healthcare facilities / hospitals
 * @route   GET /api/facilities or GET /api/hospitals
 * @access  Public
 */
const getHospitals = async (req, res, next) => {
  try {
    const { verifiedOnly, city, district, facilityType, search, emergencyOnly } = req.query;
    const filter = {};

    if (verifiedOnly === 'true') {
      filter.verified = true;
    }

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (district) {
      filter.district = new RegExp(district, 'i');
    }

    if (facilityType && facilityType !== 'All') {
      filter.$or = [
        { facilityType: facilityType },
        { hospitalType: facilityType },
      ];
    }

    if (emergencyOnly === 'true') {
      filter['emergencyCapability.operation24x7'] = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { facilityType: searchRegex },
        { hospitalType: searchRegex },
        { address: searchRegex },
        { district: searchRegex },
        { city: searchRegex },
      ];
    }

    const hospitals = await Hospital.find(filter).sort({ verified: -1, name: 1 });

    const enriched = hospitals.map((h) => {
      const fType = h.facilityType || h.hospitalType || 'Multispeciality Hospital';
      const tier = FACILITY_TIERS[fType] || { level: 4, label: fType };
      const freshness = getResourceFreshness(h.lastResourceUpdate || h.updatedAt);
      return {
        ...h.toObject(),
        facilityName: h.name,
        facilityType: fType,
        tierLevel: tier.level,
        tierLabel: tier.label,
        resourceFreshness: freshness,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single facility by ID
 * @route   GET /api/facilities/:id or GET /api/hospitals/:id
 * @access  Public
 */
const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const fType = hospital.facilityType || hospital.hospitalType || 'Multispeciality Hospital';
    const tier = FACILITY_TIERS[fType] || { level: 4, label: fType };
    const latestDate = hospital.lastResourceUpdate || hospital.beds?.icu?.lastUpdated || hospital.updatedAt;
    const icuFreshness = getResourceFreshness(latestDate);

    res.status(200).json({
      success: true,
      data: {
        ...hospital.toObject(),
        facilityName: hospital.name,
        facilityType: fType,
        tierLevel: tier.level,
        tierLabel: tier.label,
        icuFreshness,
        disclaimer: MANDATORY_DISCLAIMER,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find facilities nearby given lat/lng coordinates
 * @route   GET /api/facilities/nearby
 * @access  Public
 */
const getNearbyFacilities = async (req, res, next) => {
  try {
    const lng = parseFloat(req.query.lng) || 80.9462;
    const lat = parseFloat(req.query.lat) || 26.8467;
    const maxDistanceKm = parseFloat(req.query.maxDistance) || 50;
    const facilityType = req.query.facilityType;

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceKm * 1000, // convert km to meters
        },
      },
    };

    if (facilityType && facilityType !== 'All') {
      query.$or = [{ facilityType }, { hospitalType: facilityType }];
    }

    const facilities = await Hospital.find(query).limit(20);

    const dataWithDistance = facilities.map((f) => {
      const coords = f.location?.coordinates || [lng, lat];
      const distanceKm = calculateHaversineDistance(lng, lat, coords[0], coords[1]);
      const fType = f.facilityType || f.hospitalType || 'Multispeciality Hospital';
      const tier = FACILITY_TIERS[fType] || { level: 4, label: fType };
      const freshness = getResourceFreshness(f.lastResourceUpdate || f.updatedAt);

      return {
        ...f.toObject(),
        facilityName: f.name,
        facilityType: fType,
        tierLevel: tier.level,
        tierLabel: tier.label,
        distanceKm,
        resourceFreshness: freshness,
      };
    });

    res.status(200).json({
      success: true,
      count: dataWithDistance.length,
      origin: { lng, lat },
      maxDistanceKm,
      data: dataWithDistance,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Multi-criteria Healthcare Facility Search
 * @route   GET /api/facilities/search
 * @access  Public
 */
const searchFacilities = async (req, res, next) => {
  try {
    const {
      facilityType,
      bed,
      specialist,
      diagnostic,
      equipment,
      medicine,
      emergencyOnly,
      verifiedOnly,
      district,
      userLng = 80.9462,
      userLat = 26.8467,
      maxDistanceKm = 50,
    } = req.query;

    const filter = {};

    if (verifiedOnly === 'true') {
      filter.verified = true;
    }

    if (district) {
      filter.district = new RegExp(district, 'i');
    }

    if (facilityType && facilityType !== 'All') {
      filter.$or = [{ facilityType }, { hospitalType: facilityType }];
    }

    if (emergencyOnly === 'true') {
      filter['emergencyCapability.operation24x7'] = true;
    }

    // Bed availability filter
    if (bed) {
      const bedField = `beds.${bed.toLowerCase()}.available`;
      filter[bedField] = { $gt: 0 };
    }

    // Specialist availability filter
    if (specialist) {
      const specField = `specialists.${specialist.toLowerCase()}.status`;
      filter[specField] = { $in: ['Available', 'Accepting Referrals'] };
    }

    // Diagnostic availability filter
    if (diagnostic) {
      const diagField = `diagnostics.${diagnostic.toLowerCase()}.available`;
      filter[diagField] = true;
    }

    // Equipment availability filter
    if (equipment) {
      const equipField = `facilities.${equipment.toLowerCase()}.available`;
      filter[equipField] = true;
    }

    // Medicine availability filter
    if (medicine) {
      filter.medicines = {
        $elemMatch: {
          name: new RegExp(medicine, 'i'),
          status: 'Available',
        },
      };
    }

    const facilities = await Hospital.find(filter);

    // Compute distance and freshness
    const results = facilities
      .map((f) => {
        const coords = f.location?.coordinates || [userLng, userLat];
        const distanceKm = calculateHaversineDistance(
          parseFloat(userLng),
          parseFloat(userLat),
          coords[0],
          coords[1]
        );
        const fType = f.facilityType || f.hospitalType || 'Multispeciality Hospital';
        const tier = FACILITY_TIERS[fType] || { level: 4, label: fType };
        const freshness = getResourceFreshness(f.lastResourceUpdate || f.updatedAt);

        return {
          ...f.toObject(),
          facilityName: f.name,
          facilityType: fType,
          tierLevel: tier.level,
          tierLabel: tier.label,
          distanceKm,
          resourceFreshness: freshness,
        };
      })
      .filter((item) => item.distanceKm <= parseFloat(maxDistanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital bed availability
 * @route   PUT /api/facilities/:id/beds or PUT /api/hospitals/:id/beds
 * @access  Private (Facility admin only or Admin)
 */
const updateBeds = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility resources' });
    }

    const bedTypes = ['general', 'icu', 'nicu', 'picu', 'emergency'];
    const updates = req.body;

    bedTypes.forEach((bedKey) => {
      if (updates[bedKey]) {
        const total = Number(updates[bedKey].total !== undefined ? updates[bedKey].total : hospital.beds[bedKey].total);
        const occupied = Number(updates[bedKey].occupied !== undefined ? updates[bedKey].occupied : hospital.beds[bedKey].occupied);

        if (total < 0 || occupied < 0) {
          throw new Error(`Bed counts cannot be negative for ${bedKey} beds`);
        }
        if (occupied > total) {
          throw new Error(`Occupied beds (${occupied}) cannot exceed total beds (${total}) for ${bedKey}`);
        }

        hospital.beds[bedKey] = {
          total,
          occupied,
          available: total - occupied,
          lastUpdated: new Date(),
        };
      }
    });

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Bed capacities updated successfully',
      data: hospital.beds,
      lastResourceUpdate: hospital.lastResourceUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital facilities/equipment
 * @route   PUT /api/facilities/:id/facilities or PUT /api/hospitals/:id/facilities
 * @access  Private (Facility admin only or Admin)
 */
const updateFacilities = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility resources' });
    }

    const facilityKeys = [
      'icu', 'ventilator', 'operationTheatre', 'ctScan',
      'mri', 'xRay', 'bloodBank', 'dialysis', 'ecg'
    ];

    facilityKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        const item = req.body[key];
        hospital.facilities[key] = {
          available: Boolean(item.available),
          quantity: item.quantity !== undefined ? Math.max(0, Number(item.quantity)) : hospital.facilities[key]?.quantity || 1,
          lastUpdated: new Date(),
        };
      }
    });

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Medical equipment & facilities updated successfully',
      data: hospital.facilities,
      lastResourceUpdate: hospital.lastResourceUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update facility diagnostics
 * @route   PUT /api/facilities/:id/diagnostics
 * @access  Private (Facility admin only or Admin)
 */
const updateDiagnostics = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility resources' });
    }

    const diagnosticKeys = ['xRay', 'ctScan', 'mri', 'ultrasound', 'bloodTest', 'ecg', 'pathology', 'other'];

    diagnosticKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        const item = req.body[key];
        hospital.diagnostics[key] = {
          available: Boolean(item.available),
          quantity: item.quantity !== undefined ? Math.max(0, Number(item.quantity)) : hospital.diagnostics[key]?.quantity || 1,
          lastUpdated: new Date(),
        };
      }
    });

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Diagnostic test availability updated successfully',
      data: hospital.diagnostics,
      lastResourceUpdate: hospital.lastResourceUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update facility medicine availability
 * @route   PUT /api/facilities/:id/medicines
 * @access  Private (Facility admin only or Admin)
 */
const updateMedicines = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility resources' });
    }

    const { medicines } = req.body; // Array of { name, status, quantity }

    if (Array.isArray(medicines)) {
      hospital.medicines = medicines.map((m) => ({
        name: m.name,
        status: m.status === 'Unavailable' ? 'Unavailable' : 'Available',
        quantity: m.quantity || 'In Stock',
        lastUpdated: new Date(),
      }));
    }

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Medicine availability updated successfully',
      data: hospital.medicines,
      lastResourceUpdate: hospital.lastResourceUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital specialists
 * @route   PUT /api/facilities/:id/specialists
 * @access  Private (Facility admin only or Admin)
 */
const updateSpecialists = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility resources' });
    }

    const specialistKeys = ['cardiologist', 'neurologist', 'orthopedic', 'pediatrician', 'surgeon', 'other'];

    specialistKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        const item = req.body[key];
        hospital.specialists[key] = {
          status: item.status || 'Available',
          doctorCount: item.doctorCount !== undefined ? Math.max(0, Number(item.doctorCount)) : 1,
          lastUpdated: new Date(),
        };
      }
    });

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Specialist availability updated successfully',
      data: hospital.specialists,
      lastResourceUpdate: hospital.lastResourceUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital general profile
 * @route   PUT /api/facilities/:id or PUT /api/hospitals/:id
 * @access  Private (Facility admin only or Admin)
 */
const updateHospitalProfile = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (req.user.role !== 'admin' && (!req.user.hospitalId || req.user.hospitalId.toString() !== hospital._id.toString())) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this facility' });
    }

    const { name, phone, address, district, facilityType, hospitalType, coordinates, emergencyCapability } = req.body;

    if (name) hospital.name = name;
    if (phone) hospital.phone = phone;
    if (address) hospital.address = address;
    if (district) hospital.district = district;
    if (facilityType) hospital.facilityType = facilityType;
    if (hospitalType) hospital.hospitalType = hospitalType;
    if (emergencyCapability) hospital.emergencyCapability = { ...hospital.emergencyCapability, ...emergencyCapability };

    if (coordinates && coordinates.length === 2) {
      hospital.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    hospital.lastResourceUpdate = new Date();
    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Facility profile updated successfully',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get supported facility types and tiers
 * @route   GET /api/facilities/types
 * @access  Public
 */
const getFacilityTypes = async (req, res, next) => {
  try {
    const types = [
      { name: 'Sub-Centre', tier: 1, description: 'Village-level primary contact point for maternal & basic care' },
      { name: 'PHC', tier: 2, description: 'Primary Health Centre with outpatient, basic diagnostics and triage' },
      { name: 'Rural Hospital', tier: 3, description: 'Community Health Centre / Rural Hospital with secondary care' },
      { name: 'District Hospital', tier: 4, description: 'Comprehensive secondary & tertiary district hospital' },
      { name: 'Specialized Hospital', tier: 5, description: 'Apex tertiary center with advanced ICU, OT, and sub-specialties' },
      { name: 'Multispeciality Hospital', tier: 5, description: 'Full-spectrum multispeciality facility' },
      { name: 'Emergency Hospital', tier: 4, description: '24x7 trauma and emergency resuscitation center' },
    ];

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  getNearbyFacilities,
  searchFacilities,
  updateBeds,
  updateFacilities,
  updateDiagnostics,
  updateMedicines,
  updateSpecialists,
  updateHospitalProfile,
  getFacilityTypes,
};
