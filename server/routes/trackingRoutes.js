const express = require('express');
const router = express.Router();
const {
  getTracking,
  updateLocation,
  startSimulation,
  pauseSimulation,
  stepSimulation,
  resetSimulation,
} = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:referralId', protect, getTracking);
router.put('/:referralId/location', protect, updateLocation);
router.post('/:referralId/simulate/start', protect, startSimulation);
router.post('/:referralId/simulate/pause', protect, pauseSimulation);
router.post('/:referralId/simulate/step', protect, stepSimulation);
router.post('/:referralId/simulate/reset', protect, resetSimulation);

module.exports = router;
