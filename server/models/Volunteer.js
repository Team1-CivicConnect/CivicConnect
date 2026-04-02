const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, maxlength: 300 },
    skills: [String],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    signedUpAt: { type: Date, default: Date.now }
});

volunteerSchema.index({ issueId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
