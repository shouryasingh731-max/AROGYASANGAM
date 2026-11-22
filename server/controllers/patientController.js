const Patient = require('../models/Patient');
const Referral = require('../models/Referral');

/**
 * @desc    Get patient continuity record by patientId or MongoDB _id
 * @route   GET /api/patients/:id
 * @access  Private (Doctor, Frontline Worker, Hospital, Admin)
 */
const getPatientById = async (req, res, next) => {
  try {
    const queryId = req.params.id;
    let patient = await Patient.findOne({
      $or: [{ patientId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : null }],
    }).populate('activeReferralId');

    // If patient document not yet created for this reference ID, search existing referrals to synthesize continuity
    if (!patient) {
      const referrals = await Referral.find({ patientReference: queryId })
        .populate('selectedHospital', 'name facilityType city')
        .populate('doctorId', 'name role')
        .sort({ createdAt: 1 });

      if (referrals.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No patient continuity record found for reference ${queryId}`,
        });
      }

      const firstRef = referrals[0];
      const latestRef = referrals[referrals.length - 1];

      const historyTrail = referrals.map((r) => ({
        referralId: r.referralId,
        referralRef: r._id,
        sourceFacilityName: r.sourceFacility?.name || 'Originating Clinic',
        sourceFacilityType: r.sourceFacility?.facilityType || 'PHC',
        targetFacilityName: r.selectedHospital?.name || r.targetFacility?.name || 'Receiving Facility',
        targetFacilityType: r.selectedHospital?.facilityType || r.targetFacility?.facilityType || 'District Hospital',
        emergencyLevel: r.emergencyLevel,
        reason: r.notes || `${r.requiredBed} bed referral`,
        status: r.status,
        timestamp: r.createdAt,
      }));

      patient = {
        patientId: queryId,
        name: `Demo Patient (${queryId})`,
        age: latestRef.patientAge,
        gender: latestRef.patientGender,
        contact: '+91 98765 43210',
        abhaNumber: 'ABHA-91-8842-1029',
        bloodGroup: 'O+',
        currentFacility: {
          name: latestRef.selectedHospital?.name || 'Apex Trauma & Critical Care',
          facilityType: latestRef.selectedHospital?.facilityType || 'Specialized Hospital',
        },
        initialFacility: {
          name: firstRef.sourceFacility?.name || 'Mohanlalganj Community PHC',
          facilityType: firstRef.sourceFacility?.facilityType || 'PHC',
        },
        referralHistory: historyTrail,
        activeReferralId: latestRef._id,
        isSynthetic: true,
      };

      return res.status(200).json({
        success: true,
        data: patient,
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all referrals associated with a patient
 * @route   GET /api/patients/:id/referrals
 * @access  Private (Doctor, Frontline Worker, Hospital, Admin)
 */
const getPatientReferrals = async (req, res, next) => {
  try {
    const queryId = req.params.id;
    const referrals = await Referral.find({ patientReference: queryId })
      .populate('selectedHospital', 'name city verified facilityType')
      .populate('doctorId', 'name role professionalId specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update patient continuity record
 * @route   POST /api/patients
 * @access  Private (Doctor, Frontline Worker, Admin)
 */
const createOrUpdatePatient = async (req, res, next) => {
  try {
    const {
      patientId,
      name,
      age,
      gender,
      contact,
      abhaNumber,
      bloodGroup,
      currentFacility,
      initialFacility,
      notes,
    } = req.body;

    let patient = await Patient.findOne({ patientId });

    if (patient) {
      if (name) patient.name = name;
      if (age) patient.age = age;
      if (gender) patient.gender = gender;
      if (contact) patient.contact = contact;
      if (abhaNumber) patient.abhaNumber = abhaNumber;
      if (bloodGroup) patient.bloodGroup = bloodGroup;
      if (currentFacility) patient.currentFacility = currentFacility;
      if (notes) patient.notes = notes;
      await patient.save();
    } else {
      patient = await Patient.create({
        patientId: patientId || `PAT-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name || 'Demo Patient',
        age: age || 45,
        gender: gender || 'Male',
        contact: contact || '+91 98765 00000',
        abhaNumber: abhaNumber || 'ABHA-91-8842-1029',
        bloodGroup: bloodGroup || 'O+',
        currentFacility: currentFacility || { name: 'Mohanlalganj Community PHC', facilityType: 'PHC' },
        initialFacility: initialFacility || { name: 'Sub-Centre Gosainganj', facilityType: 'Sub-Centre' },
        notes: notes || '',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient continuity record saved successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientById,
  getPatientReferrals,
  createOrUpdatePatient,
};
