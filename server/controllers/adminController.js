const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');

/**
 * @desc    Get aggregate platform metrics for Admin Dashboard
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const verifiedHospitals = await Hospital.countDocuments({ verified: true });
    const pendingHospitals = await Hospital.countDocuments({ verificationStatus: 'Pending Verification' });

    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalFrontlineWorkers = await User.countDocuments({ role: 'frontline_health_worker' });

    const totalReferrals = await Referral.countDocuments();
    const activeReferrals = await Referral.countDocuments({ status: { $in: ['Created', 'Pending', 'Accepted', 'Transfer', 'Sent'] } });
    const criticalReferrals = await Referral.countDocuments({ emergencyLevel: 'Critical' });
    const completedReferrals = await Referral.countDocuments({ status: 'Completed' });

    // Aggregate facility tiers
    const tierAggregation = await Hospital.aggregate([
      { $group: { _id: '$facilityType', count: { $sum: 1 } } },
    ]);

    const facilityTypeBreakdown = {};
    tierAggregation.forEach((t) => {
      if (t._id) facilityTypeBreakdown[t._id] = t.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalFacilities: totalHospitals,
        verifiedHospitals,
        pendingHospitals,
        totalDoctors,
        totalFrontlineWorkers,
        totalReferrals,
        activeReferrals,
        criticalReferrals,
        completedReferrals,
        facilityTypeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all hospitals with verification status filter
 * @route   GET /api/admin/hospitals
 * @access  Private (Admin only)
 */
const getAdminHospitals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.verificationStatus = status;
    }

    const hospitals = await Hospital.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify, Approve or Reject hospital registration
 * @route   PUT /api/admin/hospitals/:id/verify
 * @access  Private (Admin only)
 */
const verifyHospital = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (action === 'approve') {
      hospital.verified = true;
      hospital.verificationStatus = 'Verified';
    } else if (action === 'reject') {
      hospital.verified = false;
      hospital.verificationStatus = 'Rejected';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject"' });
    }

    await hospital.save();

    // Send notification to hospital admin user
    if (hospital.adminUserId) {
      await Notification.create({
        recipientId: hospital.adminUserId,
        recipientRole: 'hospital',
        type: 'hospital_verification',
        title: action === 'approve' ? 'Hospital Verified Successfully' : 'Verification Update',
        message: action === 'approve'
          ? `Congratulations! ${hospital.name} has been verified by the health authority. Your verified badge is now active.`
          : `The administrative verification for ${hospital.name} was not approved. Please contact support with regulatory documentation.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Hospital ${hospital.name} marked as ${hospital.verificationStatus}`,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors list
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle doctor active/inactive status
 * @route   PUT /api/admin/doctors/:id/toggle
 * @access  Private (Admin only)
 */
const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.active = !doctor.active;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.name} is now ${doctor.active ? 'Active' : 'Deactivated'}`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all referrals across platform for monitoring
 * @route   GET /api/admin/referrals
 * @access  Private (Admin only)
 */
const getAllReferrals = async (req, res, next) => {
  try {
    const { status, emergencyLevel } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (emergencyLevel) filter.emergencyLevel = emergencyLevel;

    const referrals = await Referral.find(filter)
      .populate('doctorId', 'name email specialization')
      .populate('selectedHospital', 'name city verified')
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

module.exports = {
  getPlatformStats,
  getAdminHospitals,
  verifyHospital,
  getDoctors,
  toggleDoctorStatus,
  getAllReferrals,
};
