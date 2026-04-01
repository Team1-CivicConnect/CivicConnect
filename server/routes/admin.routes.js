const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/issues', adminController.getIssues);
router.patch('/issues/:id/status', adminController.updateIssueStatus);
router.patch('/issues/:id/assign', adminController.assignIssue);
router.get('/issues/export', adminController.exportIssues);
router.get('/heatmap', adminController.getHeatmap);
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);

module.exports = router;
