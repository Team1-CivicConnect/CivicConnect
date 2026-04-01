const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['status_change', 'comment', 'upvote', 'assigned', 'resolved'] },
    title: String,
    message: String,
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
