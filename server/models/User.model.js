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

    // Reputation & Stats
    contributionScore: { type: Number, default: 0 },
    reputationTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    totalReports: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },

    // Account Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Email OTP Verification
    otp: { type: String },
    otpExpiry: { type: Date },

    // JWT Refresh Token
    refreshToken: { type: String },
}, { timestamps: true });

// Auto-calculate reputation tier based on contributionScore
userSchema.methods.recalculateTier = function () {
    const score = this.contributionScore;
    if (score >= 500) this.reputationTier = 'platinum';
    else if (score >= 200) this.reputationTier = 'gold';
    else if (score >= 75)  this.reputationTier = 'silver';
    else                   this.reputationTier = 'bronze';
};

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.otp;
        delete ret.otpExpiry;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
