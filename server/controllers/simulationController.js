const Referral = require('../models/Referral');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { rankHospitals } = require('../services/hospitalMatchingService');

// Realistic clinical patient pool for automated triage simulation
const CLINICAL_SIM_CASES = [
  {
    condition: 'Acute STEMI (Heart Attack)',
    patientAge: 59,
    patientGender: 'Male',
    emergencyLevel: 'Critical',
    requiredBed: 'ICU',
    requiredSpecialist: 'Cardiologist',
    requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
    notes: 'Anterolateral STEMI with hypotension. Immediate primary PCI and ICU bed required.',
  },
  {
    condition: 'Severe Polytrauma (Motor Vehicle Accident)',
    patientAge: 34,
    patientGender: 'Female',
    emergencyLevel: 'Critical',
    requiredBed: 'Emergency',
    requiredSpecialist: 'Surgeon',
    requiredFacilities: ['Operation Theatre', 'CT Scan', 'Blood Bank', 'X-Ray'],
    notes: 'Grade IV splenic laceration with pelvic ring fracture. Immediate surgical exploration ready.',
  },
  {
    condition: 'Acute Ischemic Stroke in Thrombectomy Window',
    patientAge: 68,
    patientGender: 'Male',
    emergencyLevel: 'Critical',
    requiredBed: 'ICU',
    requiredSpecialist: 'Neurologist',
    requiredFacilities: ['CT Scan', 'MRI', 'ICU', 'Ventilator'],
    notes: 'Right MCA syndrome with onset 75 minutes ago. Mechanical thrombectomy evaluation needed.',
  },
  {
    condition: 'Acute Respiratory Failure / COPD Exacerbation',
    patientAge: 63,
    patientGender: 'Female',
    emergencyLevel: 'Urgent',
    requiredBed: 'ICU',
    requiredSpecialist: 'Cardiologist',
    requiredFacilities: ['Ventilator', 'ICU', 'ECG'],
    notes: 'Severe respiratory acidosis refractory to BiPAP. Invasive mechanical ventilation indicated.',
  },
  {
    condition: 'End-Stage Renal Disease with Severe Hyperkalemia',
    patientAge: 51,
    patientGender: 'Male',
    emergencyLevel: 'Urgent',
    requiredBed: 'General',
    requiredSpecialist: 'Other',
    requiredFacilities: ['Dialysis', 'ECG', 'Blood Bank'],
    notes: 'Serum potassium 7.2 mEq/L with peaked T waves. Emergent hemodialysis clearance needed.',
  },
];

/**
 * @desc    Auto-generate a new incoming patient and dispatch referral using smart matching
 * @route   POST /api/simulation/auto-patient
 * @access  Public / Simulation
 */
const autoGeneratePatientCase = async (req, res, next) => {
  try {
    // Pick random clinical case or user-requested index
    const caseTemplate =
      CLINICAL_SIM_CASES[Math.floor(Math.random() * CLINICAL_SIM_CASES.length)];

    const randomDoctor = (await User.findOne({ role: 'doctor' })) || {
      _id: null,
      name: 'Dr. Arjun Mehta',
    };

    // Query active hospitals from MongoDB
    const hospitals = await Hospital.find({});
    if (!hospitals.length) {
      return res.status(400).json({ success: false, message: 'No hospitals available in database to match.' });
    }

    // Run transparent matching algorithm
    const rankedMatches = rankHospitals(hospitals, {
      requiredBed: caseTemplate.requiredBed,
      requiredFacilities: caseTemplate.requiredFacilities,
      requiredSpecialist: caseTemplate.requiredSpecialist,
      emergencyLevel: caseTemplate.emergencyLevel,
      userLocation: [80.9462, 26.8467],
    });

    // Select top hospital
    const topMatch = rankedMatches[0];
    const selectedHospital = topMatch.hospital;

    // Generate referral ID
    const count = await Referral.countDocuments();
    const referralId = `REF-AUTO-${String(count + 2001).padStart(4, '0')}`;
    const patientReference = `PAT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;

    const recommendedList = rankedMatches.slice(0, 4).map((item) => ({
      hospitalId: item.hospital._id,
      name: item.hospital.name,
      score: item.matchScore,
      breakdown: item.breakdown,
      explanations: item.explanations,
      missing: item.missing,
    }));

    const referral = await Referral.create({
      referralId,
      doctorId: randomDoctor._id,
      patientReference,
      patientAge: caseTemplate.patientAge,
      patientGender: caseTemplate.patientGender,
      emergencyLevel: caseTemplate.emergencyLevel,
      requiredBed: caseTemplate.requiredBed,
      requiredFacilities: caseTemplate.requiredFacilities,
      requiredSpecialist: caseTemplate.requiredSpecialist,
      notes: `[Auto-Simulation]: ${caseTemplate.condition}. ${caseTemplate.notes}`,
      recommendedHospitals: recommendedList,
      selectedHospital: selectedHospital._id,
      status: 'Pending',
      timeline: [
        {
          status: 'Created',
          note: `Patient triage recorded: ${caseTemplate.condition}`,
          timestamp: new Date(),
        },
        {
          status: 'Pending',
          note: `Auto-dispatched to ${selectedHospital.name} (Match Score: ${topMatch.matchScore}%)`,
          timestamp: new Date(),
        },
      ],
      documents: [
        { name: 'Simulated_Triage_Vitals.pdf', fileType: 'PDF', size: '1.1 MB', uploadedAt: new Date() },
        { name: 'Telemetry_ECG_Strip.pdf', fileType: 'PDF', size: '540 KB', uploadedAt: new Date() },
      ],
    });

    // Create real notification for receiving hospital
    if (selectedHospital.adminUserId) {
      await Notification.create({
        recipientId: selectedHospital.adminUserId,
        recipientRole: 'hospital',
        type: 'referral_new',
        title: `⚡ Live Patient: ${referralId} (${caseTemplate.emergencyLevel})`,
        message: `${caseTemplate.condition} - Requires ${caseTemplate.requiredBed} bed and ${caseTemplate.requiredSpecialist}.`,
        referralId: referral._id,
      });
    }

    res.status(201).json({
      success: true,
      message: `Automated patient case ${referralId} created and dispatched to ${selectedHospital.name}`,
      data: {
        referral,
        caseTemplate,
        topHospital: selectedHospital,
        matchScore: topMatch.matchScore,
        explanations: topMatch.explanations,
        missing: topMatch.missing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Advance referral automatically to next stage (Pending -> Accepted -> Transfer -> Completed)
 * @route   POST /api/simulation/advance/:id
 * @access  Public / Simulation
 */
const advanceSimulationStep = async (req, res, next) => {
  try {
    const { targetStatus, note, reject = false } = req.body;
    const referral = await Referral.findById(req.params.id)
      .populate('selectedHospital')
      .populate('doctorId');

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    let nextStatus = targetStatus;

    if (!nextStatus) {
      // Auto sequence progression
      if (referral.status === 'Created' || referral.status === 'Pending') {
        nextStatus = reject ? 'Rejected' : 'Accepted';
      } else if (referral.status === 'Accepted') {
        nextStatus = 'Transfer';
      } else if (referral.status === 'Transfer') {
        nextStatus = 'Completed';
      } else {
        return res.status(200).json({
          success: true,
          message: `Referral ${referral.referralId} is already in final state: ${referral.status}`,
          data: referral,
        });
      }
    }

    referral.status = nextStatus;

    let stepNote = note;
    if (!stepNote) {
      if (nextStatus === 'Accepted') {
        stepNote = `Bed reserved at ${referral.selectedHospital?.name}. Trauma team on standby.`;
      } else if (nextStatus === 'Rejected') {
        referral.rejectionReason = 'Critical ICU capacity full. Immediate surge triage redirect triggered.';
        stepNote = `Declined by ${referral.selectedHospital?.name}: ICU beds currently at 100% occupancy.`;
      } else if (nextStatus === 'Transfer') {
        const ambUnit = `AMB-UP-32-${Math.floor(100 + Math.random() * 900)}`;
        stepNote = `Patient en-route via Advanced Cardiac Life Support Ambulance (${ambUnit}). ETA 12 mins.`;
      } else if (nextStatus === 'Completed') {
        stepNote = `Patient successfully arrived and admitted into ${referral.selectedHospital?.name} ${referral.requiredBed} Wing (Bed #${Math.floor(1 + Math.random() * 20)}).`;
      }
    }

    referral.timeline.push({
      status: nextStatus,
      note: stepNote,
      timestamp: new Date(),
    });

    await referral.save();

    // If status is Completed, deduct 1 available bed and add 1 occupied bed for selected hospital
    if (nextStatus === 'Completed' && referral.selectedHospital) {
      try {
        const hosp = await Hospital.findById(referral.selectedHospital._id || referral.selectedHospital);
        if (hosp && hosp.beds) {
          const bedKey = referral.requiredBed?.toLowerCase() || 'icu';
          if (hosp.beds[bedKey]) {
            if (hosp.beds[bedKey].available > 0) {
              hosp.beds[bedKey].available -= 1;
            }
            hosp.beds[bedKey].occupied += 1;
            hosp.beds.lastUpdated = new Date();
            await hosp.save();
          }
        }
      } catch (bedErr) {
        console.error('Error updating hospital bed count during simulation completion:', bedErr);
      }
    }

    // Create Notification for Doctor
    if (referral.doctorId) {
      await Notification.create({
        recipientId: referral.doctorId._id || referral.doctorId,
        recipientRole: 'doctor',
        type: nextStatus === 'Accepted' ? 'referral_accepted' : nextStatus === 'Rejected' ? 'referral_rejected' : 'referral_status',
        title: `Simulation Update: ${referral.referralId} → ${nextStatus}`,
        message: stepNote,
        referralId: referral._id,
      });
    }

    // If rejected, calculate alternative matches
    let alternativeMatches = [];
    if (nextStatus === 'Rejected') {
      const allHospitals = await Hospital.find({ _id: { $ne: referral.selectedHospital?._id } });
      alternativeMatches = rankHospitals(allHospitals, {
        requiredBed: referral.requiredBed,
        requiredFacilities: referral.requiredFacilities,
        requiredSpecialist: referral.requiredSpecialist,
        emergencyLevel: referral.emergencyLevel,
      }).slice(0, 3);
    }

    res.status(200).json({
      success: true,
      message: `Referral progressed to ${nextStatus}`,
      data: referral,
      nextStep: nextStatus === 'Accepted' ? 'Transfer' : nextStatus === 'Transfer' ? 'Completed' : null,
      alternativeMatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reroute a rejected simulation referral to a new alternative hospital
 * @route   POST /api/simulation/reroute/:id
 * @access  Public / Simulation
 */
const rerouteSimulationReferral = async (req, res, next) => {
  try {
    const { newHospitalId } = req.body;
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    const newHospital = await Hospital.findById(newHospitalId);
    if (!newHospital) {
      return res.status(404).json({ success: false, message: 'Target alternative hospital not found' });
    }

    referral.selectedHospital = newHospital._id;
    referral.status = 'Pending';
    referral.rejectionReason = '';
    referral.timeline.push({
      status: 'Pending',
      note: `Rerouted emergency referral to ${newHospital.name} after initial hospital capacity surge.`,
      timestamp: new Date(),
    });

    await referral.save();

    // Re-populate selected hospital
    await referral.populate('selectedHospital');

    res.status(200).json({
      success: true,
      message: `Referral successfully rerouted to ${newHospital.name}`,
      data: referral,
      nextStep: 'Accepted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active simulation snapshot (active cases, in-transit ambulances, recent events)
 * @route   GET /api/simulation/status
 * @access  Public / Simulation
 */
const getSimulationStatus = async (req, res, next) => {
  try {
    const activeReferrals = await Referral.find({
      status: { $in: ['Pending', 'Accepted', 'Transfer'] },
    })
      .populate('selectedHospital', 'name city verified')
      .populate('doctorId', 'name specialization')
      .sort({ updatedAt: -1 })
      .limit(6);

    const completedCount = await Referral.countDocuments({ status: 'Completed' });
    const inTransitCount = await Referral.countDocuments({ status: 'Transfer' });
    const acceptedCount = await Referral.countDocuments({ status: 'Accepted' });

    res.status(200).json({
      success: true,
      data: {
        activeReferrals,
        inTransitCount,
        acceptedCount,
        completedCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  autoGeneratePatientCase,
  advanceSimulationStep,
  rerouteSimulationReferral,
  getSimulationStatus,
};
