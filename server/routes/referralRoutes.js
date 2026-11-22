const express = require('express');
const router = express.Router();
const {
  matchHospitals,
  createReferral,
  getDoctorReferrals,
  getHospitalReferrals,
  getReferralById,
  updateReferralStatus,
} = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Matching endpoint
router.post('/match', matchHospitals);

// Doctor & Frontline Health Worker routes
router.post('/', protect, authorize('doctor', 'frontline_health_worker', 'admin'), createReferral);
router.get('/doctor', protect, authorize('doctor', 'frontline_health_worker', 'admin'), getDoctorReferrals);
router.get('/my', protect, authorize('doctor', 'frontline_health_worker', 'admin'), getDoctorReferrals);

// Hospital specific routes
router.get('/hospital', protect, authorize('hospital', 'admin'), getHospitalReferrals);

// Shared referral details and status update
router.get('/:id', protect, getReferralById);
router.put('/:id/status', protect, authorize('hospital', 'doctor', 'frontline_health_worker', 'admin'), updateReferralStatus);

module.exports = router;
