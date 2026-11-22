const express = require('express');
const router = express.Router();
const {
  autoGeneratePatientCase,
  advanceSimulationStep,
  rerouteSimulationReferral,
  getSimulationStatus,
} = require('../controllers/simulationController');

router.post('/auto-patient', autoGeneratePatientCase);
router.post('/advance/:id', advanceSimulationStep);
router.post('/reroute/:id', rerouteSimulationReferral);
router.get('/status', getSimulationStatus);

module.exports = router;
