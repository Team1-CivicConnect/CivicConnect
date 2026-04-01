const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
