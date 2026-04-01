const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    isAdminComment: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
