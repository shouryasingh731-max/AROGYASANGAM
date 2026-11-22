const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  getNearbyFacilities,
  searchFacilities,
  updateBeds,
  updateFacilities,
  updateDiagnostics,
  updateMedicines,
  updateSpecialists,
  updateHospitalProfile,
  getFacilityTypes,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/types', getFacilityTypes);
router.get('/nearby', getNearbyFacilities);
router.get('/search', searchFacilities);
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Protected facility resource modification routes
router.put('/:id/beds', protect, authorize('hospital', 'admin'), updateBeds);
router.put('/:id/facilities', protect, authorize('hospital', 'admin'), updateFacilities);
router.put('/:id/diagnostics', protect, authorize('hospital', 'admin'), updateDiagnostics);
router.put('/:id/medicines', protect, authorize('hospital', 'admin'), updateMedicines);
router.put('/:id/specialists', protect, authorize('hospital', 'admin'), updateSpecialists);
router.put('/:id', protect, authorize('hospital', 'admin'), updateHospitalProfile);

module.exports = router;
