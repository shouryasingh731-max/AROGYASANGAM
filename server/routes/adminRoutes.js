const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAdminHospitals,
  verifyHospital,
  getDoctors,
  toggleDoctorStatus,
  getAllReferrals,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/hospitals', getAdminHospitals);
router.put('/hospitals/:id/verify', verifyHospital);
router.get('/doctors', getDoctors);
router.put('/doctors/:id/toggle', toggleDoctorStatus);
router.get('/referrals', getAllReferrals);

module.exports = router;
