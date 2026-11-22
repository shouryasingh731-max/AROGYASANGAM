const Referral = require('../models/Referral');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const { rankHospitals, MANDATORY_DISCLAIMER } = require('../services/hospitalMatchingService');

/**
 * @desc    Search and rank suitable hospitals based on patient requirements
 * @route   POST /api/matching/hospitals or POST /api/matching/facilities
 * @access  Public (or Doctor / Frontline Worker Private)
 */
const matchHospitals = async (req, res, next) => {
  try {
    const {
      requiredBed = 'ICU',
      requiredFacilities = [],
      requiredDiagnostics = [],
      requiredMedicines = [],
      requiredSpecialist = 'Cardiologist',
      userLocation = [80.9462, 26.8467], // default to central Lucknow
      emergencyLevel = 'Critical',
      facilityTypeFilter = null,
    } = req.body;

    // Retrieve all active hospitals / facilities
    const hospitals = await Hospital.find({});

    const matchOutcome = rankHospitals(hospitals, {
      requiredBed,
      requiredFacilities,
      requiredDiagnostics,
      requiredMedicines,
      requiredSpecialist,
      userLocation,
      emergencyLevel,
      facilityTypeFilter,
    });

    res.status(200).json({
      success: true,
      count: matchOutcome.results.length,
      requirements: {
        requiredBed,
        requiredFacilities,
        requiredDiagnostics,
        requiredMedicines,
        requiredSpecialist,
        emergencyLevel,
      },
      escalationRecommendation: matchOutcome.escalationRecommendation,
      disclaimer: matchOutcome.disclaimer,
      data: matchOutcome.results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new patient referral (by Doctor or Frontline Health Worker)
 * @route   POST /api/referrals
 * @access  Private (Doctor or Frontline Health Worker)
 */
const createReferral = async (req, res, next) => {
  try {
    const {
      emergencyLevel = 'Normal',
      requiredBed = 'ICU',
      requiredFacilities = [],
      requiredDiagnostics = [],
      requiredMedicines = [],
      requiredSpecialist = 'Cardiologist',
      notes = '',
      sourceFacility,
      documents = [],
    } = req.body;

    const patientReference = req.body.patientReference || req.body.patientName || req.body.patientId || 'Demo Patient';
    const patientAge = req.body.patientAge || req.body.age || 45;
    const patientGender = req.body.patientGender || req.body.gender || 'Male';
    const patientId = req.body.patientId || `DEMO-PT-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedHospitalId = req.body.selectedHospitalId || req.body.hospitalId || req.body.targetFacility;

    if (!selectedHospitalId) {
      return res.status(400).json({ success: false, message: 'Please select a receiving facility for the referral' });
    }

    const hospital = await Hospital.findById(selectedHospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Selected healthcare facility not found' });
    }

    // Generate unique referral ID
    const count = await Referral.countDocuments();
    const referralId = `REF-${String(count + 1001).padStart(4, '0')}`;

    // Compute snapshot recommendation score for selected hospital
    const allHospitals = await Hospital.find({});
    const matchOutcome = rankHospitals(allHospitals, {
      requiredBed,
      requiredFacilities,
      requiredDiagnostics,
      requiredMedicines,
      requiredSpecialist,
      emergencyLevel,
    });

    const recommendedList = matchOutcome.results.slice(0, 5).map((item) => ({
      hospitalId: item.hospital._id,
      name: item.hospital.name,
      score: item.matchScore,
      breakdown: item.breakdown,
      explanations: item.explanations,
      missing: item.missing,
    }));

    // Default mock documents if user attached dummy documents
    const docList = documents.length > 0 ? documents : [
      { name: 'Initial_Triage_Summary.pdf', fileType: 'PDF', size: '1.4 MB', uploadedAt: new Date() },
      { name: 'Patient_Vital_Signs.pdf', fileType: 'PDF', size: '640 KB', uploadedAt: new Date() },
    ];

    const sourceData = sourceFacility || {
      name: req.user.hospitalName || 'Mohanlalganj Community PHC',
      facilityType: req.user.facilityType || 'PHC',
      district: 'Lucknow',
    };

    const targetData = {
      hospitalId: hospital._id,
      name: hospital.name,
      facilityType: hospital.facilityType || hospital.hospitalType || 'Specialized Hospital',
      district: hospital.district || 'Lucknow',
    };

    const isCritical = emergencyLevel === 'Critical';
    const initialStatus = 'Pending';

    const referral = await Referral.create({
      referralId,
      doctorId: req.user._id,
      createdBy: req.user._id,
      creatorRole: req.user.role === 'frontline_health_worker' ? 'frontline_health_worker' : 'doctor',
      patientReference: req.body.patientId || patientReference || `DEMO-PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAge: Number(patientAge) || 45,
      patientGender: patientGender || 'Male',
      emergencyLevel,
      requiredBed,
      requiredFacilities,
      requiredDiagnostics,
      requiredMedicines,
      requiredSpecialist,
      sourceFacility: sourceData,
      targetFacility: targetData,
      escalationTier: targetData.facilityType,
      notes,
      documents: docList,
      recommendedHospitals: recommendedList,
      selectedHospital: hospital._id,
      status: initialStatus,
      timeline: [
        {
          status: 'Created',
          updatedBy: req.user._id,
          note: `Referral initiated by ${req.user.name} (${req.user.role === 'frontline_health_worker' ? 'Frontline Health Worker' : 'Medical Officer'}) at ${sourceData.name}`,
          timestamp: new Date(),
        },
        {
          status: 'Pending',
          updatedBy: req.user._id,
          note: `Dispatched to ${hospital.name} (${targetData.facilityType}) for triage acceptance review`,
          timestamp: new Date(),
        },
      ],
    });

    // Update or create lightweight Patient continuity record
    try {
      let patient = await Patient.findOne({ patientId: referral.patientReference });
      const historyEntry = {
        referralId: referral.referralId,
        referralRef: referral._id,
        sourceFacilityName: sourceData.name,
        sourceFacilityType: sourceData.facilityType,
        targetFacilityName: hospital.name,
        targetFacilityType: targetData.facilityType,
        emergencyLevel: referral.emergencyLevel,
        reason: notes || `${requiredBed} transfer request`,
        status: initialStatus,
        timestamp: new Date(),
      };

      if (patient) {
        patient.referralHistory.push(historyEntry);
        patient.activeReferralId = referral._id;
        patient.currentFacility = {
          facilityId: hospital._id,
          name: hospital.name,
          facilityType: targetData.facilityType,
        };
        await patient.save();
      } else {
        await Patient.create({
          patientId: referral.patientReference,
          name: req.body.patientName || `Patient ${referral.patientReference}`,
          age: referral.patientAge,
          gender: referral.patientGender,
          currentFacility: {
            facilityId: hospital._id,
            name: hospital.name,
            facilityType: targetData.facilityType,
          },
          initialFacility: {
            name: sourceData.name,
            facilityType: sourceData.facilityType,
          },
          referralHistory: [historyEntry],
          activeReferralId: referral._id,
        });
      }
    } catch (patErr) {
      console.error('Patient continuity sync error (non-fatal):', patErr);
    }

    // Send notification to receiving hospital
    if (hospital.adminUserId) {
      const notifType = isCritical ? 'critical_alert' : 'referral_new';
      const notifTitle = isCritical
        ? `🚨 CRITICAL EMERGENCY REFERRAL: ${referralId}`
        : `New Referral: ${referralId}`;

      const notifMessage = isCritical
        ? `PRIORITY ALERT: ${req.user.name} dispatched CRITICAL patient ${referral.patientReference} requiring ${requiredBed} and ${requiredSpecialist} to ${hospital.name}. Immediate review required.`
        : `${req.user.name} submitted referral ${referralId} requiring ${requiredBed} and ${requiredSpecialist}.`;

      await Notification.create({
        recipientId: hospital.adminUserId,
        recipientRole: 'hospital',
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        referralId: referral._id,
      });
    }

    res.status(201).json({
      success: true,
      message: isCritical
        ? 'CRITICAL referral dispatched with priority notification to receiving facility'
        : 'Referral created and dispatched to facility successfully',
      data: referral,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all referrals created by current doctor or frontline health worker
 * @route   GET /api/referrals/doctor or GET /api/referrals/my
 * @access  Private (Doctor, Frontline Health Worker)
 */
const getDoctorReferrals = async (req, res, next) => {
  try {
    const { status, emergencyLevel } = req.query;
    const filter = {
      $or: [
        { doctorId: req.user._id },
        { createdBy: req.user._id },
      ],
    };

    if (status) filter.status = status;
    if (emergencyLevel) filter.emergencyLevel = emergencyLevel;

    const referrals = await Referral.find(filter)
      .populate('selectedHospital', 'name phone address city district verified facilityType hospitalType beds facilities diagnostics specialists emergencyCapability')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all referrals sent to current hospital / facility
 * @route   GET /api/referrals/hospital
 * @access  Private (Hospital)
 */
const getHospitalReferrals = async (req, res, next) => {
  try {
    if (!req.user.hospitalId && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'User is not linked to a hospital or healthcare facility' });
    }

    const { status, emergencyLevel } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.selectedHospital = req.user.hospitalId;
    }

    if (status) filter.status = status;
    if (emergencyLevel) filter.emergencyLevel = emergencyLevel;

    const referrals = await Referral.find(filter)
      .populate('doctorId', 'name email phone professionalId specialization hospitalName frontlineDesignation facilityType role')
      .populate('createdBy', 'name email phone professionalId specialization hospitalName frontlineDesignation role')
      .populate('selectedHospital', 'name city district address verified phone facilityType hospitalType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single referral details with timeline & alternative matches
 * @route   GET /api/referrals/:id
 * @access  Private
 */
const getReferralById = async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('doctorId', 'name email phone professionalId specialization hospitalName frontlineDesignation facilityType role')
      .populate('createdBy', 'name email phone professionalId specialization hospitalName frontlineDesignation role')
      .populate('selectedHospital')
      .populate('timeline.updatedBy', 'name role');

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    // Access control: Doctor/Frontline Worker owner, Selected Hospital staff, or Admin
    const isOwner =
      (referral.doctorId && referral.doctorId._id.toString() === req.user._id.toString()) ||
      (referral.createdBy && referral.createdBy._id.toString() === req.user._id.toString());

    const isHospitalAssigned =
      req.user.role === 'hospital' &&
      req.user.hospitalId &&
      referral.selectedHospital &&
      req.user.hospitalId.toString() === referral.selectedHospital._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHospitalAssigned && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this referral record' });
    }

    let alternativeMatches = [];

    // If referral is rejected or requested, compute alternative hospital recommendations
    if (referral.status === 'Rejected') {
      const allHospitals = await Hospital.find({ _id: { $ne: referral.selectedHospital?._id } });
      const altOutcome = rankHospitals(allHospitals, {
        requiredBed: referral.requiredBed,
        requiredFacilities: referral.requiredFacilities,
        requiredDiagnostics: referral.requiredDiagnostics,
        requiredSpecialist: referral.requiredSpecialist,
        emergencyLevel: referral.emergencyLevel,
      });
      alternativeMatches = altOutcome.results.slice(0, 4);
    }

    res.status(200).json({
      success: true,
      data: referral,
      alternativeMatches,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update referral status (Accept, Reject, Transfer, Completed, Cancelled)
 * @route   PUT /api/referrals/:id/status
 * @access  Private (Hospital staff, Doctor, Frontline Worker, or Admin)
 */
const updateReferralStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason = '', note = '' } = req.body;

    const referral = await Referral.findById(req.params.id)
      .populate('selectedHospital')
      .populate('doctorId');

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    const validStatuses = ['Accepted', 'Rejected', 'Transfer', 'Completed', 'Cancelled', 'Pending', 'Sent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    referral.status = status;
    if (status === 'Rejected') {
      referral.rejectionReason = rejectionReason || 'Capacity reached or specialist currently unavailable.';
    }

    const statusNote = note || (status === 'Accepted'
      ? `Accepted by ${referral.selectedHospital?.name || 'receiving facility'}. Bed and medical team reserved.`
      : status === 'Rejected'
      ? `Declined: ${referral.rejectionReason}`
      : status === 'Transfer'
      ? `Patient in active ambulance transit to ${referral.selectedHospital?.name || 'receiving facility'}.`
      : status === 'Completed'
      ? `Patient admission and intake completed at ${referral.selectedHospital?.name || 'receiving facility'}.`
      : `Status changed to ${status}`);

    referral.timeline.push({
      status,
      updatedBy: req.user._id,
      note: statusNote,
      timestamp: new Date(),
    });

    await referral.save();

    // Update patient continuity history
    try {
      const patient = await Patient.findOne({ patientId: referral.patientReference });
      if (patient) {
        const lastEntry = patient.referralHistory.find((h) => h.referralId === referral.referralId);
        if (lastEntry) {
          lastEntry.status = status;
        } else {
          patient.referralHistory.push({
            referralId: referral.referralId,
            referralRef: referral._id,
            sourceFacilityName: referral.sourceFacility?.name || 'Originating Facility',
            sourceFacilityType: referral.sourceFacility?.facilityType || 'PHC',
            targetFacilityName: referral.selectedHospital?.name || 'Receiving Facility',
            targetFacilityType: referral.selectedHospital?.facilityType || 'District Hospital',
            emergencyLevel: referral.emergencyLevel,
            reason: referral.notes || 'Healthcare transfer',
            status,
            timestamp: new Date(),
          });
        }
        await patient.save();
      }
    } catch (patErr) {
      console.error('Patient continuity status update error:', patErr);
    }

    // Notify referring doctor or frontline health worker
    const recipientUser = referral.doctorId || referral.createdBy;
    if (recipientUser) {
      const notifTitle = status === 'Accepted'
        ? `Referral Accepted: ${referral.referralId}`
        : status === 'Rejected'
        ? `Referral Declined: ${referral.referralId}`
        : `Referral Status: ${status}`;

      const notifMsg = status === 'Accepted'
        ? `${referral.selectedHospital?.name} has accepted referral ${referral.referralId}. You may coordinate patient transfer immediately.`
        : status === 'Rejected'
        ? `${referral.selectedHospital?.name} was unable to accept referral ${referral.referralId}. Reason: ${referral.rejectionReason}. Check recommended alternative facilities.`
        : `Referral ${referral.referralId} progressed to ${status}.`;

      const notifType = status === 'Accepted'
        ? 'referral_accepted'
        : status === 'Rejected'
        ? 'referral_rejected'
        : 'referral_status';

      await Notification.create({
        recipientId: recipientUser._id,
        recipientRole: referral.creatorRole === 'frontline_health_worker' ? 'frontline_health_worker' : 'doctor',
        type: notifType,
        title: notifTitle,
        message: notifMsg,
        referralId: referral._id,
      });
    }

    // Compute alternative recommendations if rejected
    let alternativeMatches = [];
    if (status === 'Rejected') {
      const allHospitals = await Hospital.find({ _id: { $ne: referral.selectedHospital?._id } });
      const altOutcome = rankHospitals(allHospitals, {
        requiredBed: referral.requiredBed,
        requiredFacilities: referral.requiredFacilities,
        requiredDiagnostics: referral.requiredDiagnostics,
        requiredSpecialist: referral.requiredSpecialist,
        emergencyLevel: referral.emergencyLevel,
      });
      alternativeMatches = altOutcome.results.slice(0, 4);
    }

    res.status(200).json({
      success: true,
      message: `Referral status updated to ${status}`,
      data: referral,
      alternativeMatches,
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchHospitals,
  createReferral,
  getDoctorReferrals,
  getHospitalReferrals,
  getReferralById,
  updateReferralStatus,
};
