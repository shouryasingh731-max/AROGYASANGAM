const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'arogyasangam_secure_jwt_secret_key_2026_healthcare', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (Doctor or Hospital)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'doctor',
      phone,
      professionalId,
      // Frontline Health Worker specific fields
      frontlineDesignation,
      facilityType = 'PHC',
      // Hospital specific fields if role === 'hospital'
      hospitalName,
      address,
      city = 'Lucknow',
      state = 'Uttar Pradesh',
      hospitalType = 'Multispeciality',
      coordinates,
    } = req.body;

    // Validate email existence
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    let hospitalId = null;

    // If registering as a Hospital, create the Hospital document first in 'Pending Verification'
    if (role === 'hospital') {
      const existingHospital = await Hospital.findOne({ email: email.toLowerCase() });
      if (existingHospital) {
        return res.status(400).json({ success: false, message: 'A hospital with this email already exists' });
      }

      const defaultCoords = coordinates && coordinates.length === 2 ? coordinates : [80.9462, 26.8467];

      const hospitalDoc = await Hospital.create({
        name: hospitalName || name,
        email: email.toLowerCase(),
        phone: phone || 'N/A',
        address: address || 'Medical Enclave, Lucknow',
        city,
        state,
        hospitalType,
        facilityType: hospitalType || 'Multispeciality Hospital',
        location: {
          type: 'Point',
          coordinates: defaultCoords,
        },
        verified: false,
        verificationStatus: 'Pending Verification',
      });

      hospitalId = hospitalDoc._id;
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      professionalId,
      specialization: role === 'doctor' ? (specialization || 'General Physician') : undefined,
      frontlineDesignation: role === 'frontline_health_worker' ? (frontlineDesignation || 'ASHA / ANM Health Worker') : undefined,
      facilityType: role === 'frontline_health_worker' ? (facilityType || 'PHC') : undefined,
      hospitalName: role === 'hospital' ? (hospitalName || name) : (hospitalName || 'Mohanlalganj Community PHC'),
      hospitalId,
    });

    if (hospitalId) {
      await Hospital.findByIdAndUpdate(hospitalId, { adminUserId: user._id });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        professionalId: user.professionalId,
        specialization: user.specialization,
        frontlineDesignation: user.frontlineDesignation,
        facilityType: user.facilityType,
        hospitalId: user.hospitalId,
        hospitalName: user.hospitalName,
        token: generateToken(user._id),
      },
      message: role === 'hospital'
        ? 'Healthcare facility registered successfully! Account is pending administrative verification.'
        : role === 'frontline_health_worker'
        ? 'Frontline Health Worker registered successfully!'
        : 'Doctor registered successfully!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('hospitalId');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        professionalId: user.professionalId,
        specialization: user.specialization,
        frontlineDesignation: user.frontlineDesignation,
        facilityType: user.facilityType,
        hospitalId: user.hospitalId ? user.hospitalId._id : null,
        hospital: user.hospitalId || null,
        hospitalName: user.hospitalName || (user.hospitalId ? user.hospitalId.name : null),
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('hospitalId');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
