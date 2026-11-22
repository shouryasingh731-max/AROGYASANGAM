const express = require('express');
const router = express.Router();
const {
  getPatientById,
  getPatientReferrals,
  createOrUpdatePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protected patient continuity routes
router.use(protect);

router.get('/:id', authorize('doctor', 'frontline_health_worker', 'hospital', 'admin'), getPatientById);
router.get('/:id/referrals', authorize('doctor', 'frontline_health_worker', 'hospital', 'admin'), getPatientReferrals);
router.post('/', authorize('doctor', 'frontline_health_worker', 'admin'), createOrUpdatePatient);

module.exports = router;
