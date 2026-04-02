const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
// IMPORTANT: specific routes BEFORE param routes to avoid /read-all matching /:id
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
