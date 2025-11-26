const express = require('express');
const router = express.Router();
const climateTestController = require('../controllers/climateTestController');
const verifyToken = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all tests (role-based filtering in controller)
router.get('/', climateTestController.getAllTests);

// Create new test (admin only - verified in controller)
router.post('/', climateTestController.createTest);

// Update test (admin or assigned tester - verified in controller)
router.put('/:id', climateTestController.updateTest);

// Delete test (admin only - verified in controller)
router.delete('/:id', climateTestController.deleteTest);

// Add remark to test (assigned tester or admin - verified in controller)
router.post('/:id/remarks', climateTestController.addRemark);

module.exports = router;
