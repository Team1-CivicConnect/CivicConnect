const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    phone: { type: String },
    avatar: { type: String },
    ward: { type: String },
    area: { type: String },
    city: { type: String, default: 'Chennai' },
    contributionScore: { type: Number, default: 0 },
    totalReports: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshToken;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
