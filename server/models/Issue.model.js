const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    issueId: { type: String, unique: true },
    title: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 1000 },

    category: {
        type: String,
        enum: ['pothole', 'street_light', 'garbage', 'water_leak', 'fallen_tree',
            'encroachment', 'sewage', 'road_damage', 'noise', 'other'],
        required: true
    },
    aiCategory: { type: String },
    aiConfidence: { type: Number },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    priorityScore: { type: Number, default: 0 },
    priorityOverride: { type: Boolean, default: false },
    aiPriorityScore: { type: Number },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    isDuplicate: { type: Boolean, default: false },

    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
    },
    address: { type: String },
    ward: { type: String },
    area: { type: String },
    pincode: { type: String },

    photos: [{ url: String, publicId: String }],

    status: {
        type: String,
        enum: ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected', 'duplicate'],
        default: 'submitted'
    },
    statusHistory: [{
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String },
    resolvedAt: { type: Date },
    expectedResolutionDate: { type: Date },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    isPublic: { type: Boolean, default: true },
    tags: [String],
    volunteers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date
    }],
}, { timestamps: true });

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, category: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ upvoteCount: -1 });

module.exports = mongoose.model('Issue', issueSchema);
