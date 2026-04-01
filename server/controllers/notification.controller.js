const Notification = require('../models/Notification.model');

exports.getNotifications = async (req, res, next) => {
    try {
        const query = { userId: req.user.id };
        if (req.query.unread === 'true') {
            query.isRead = false;
        }
        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(notifications);
    } catch (err) {
        next(err);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user.id }, { isRead: true });
        res.status(200).json({ message: 'All marked as read' });
    } catch (err) {
        next(err);
    }
};
