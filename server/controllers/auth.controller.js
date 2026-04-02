const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../services/email.service');

// ── Helpers ────────────────────────────────────────────────────────────────────
const generateTokens = (user) => {
    const payload = { id: user._id, role: user.role };
    const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Register ───────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, ward, area } = req.body;

        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp       = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const passwordHash = await bcrypt.hash(password, 12);

        if (user) {
            // Unverified user re-registering — update their record and resend OTP
            user.name         = name;
            user.passwordHash = passwordHash;
            user.phone        = phone;
            user.ward         = ward;
            user.area         = area;
            user.otp          = otp;
            user.otpExpiry    = otpExpiry;
        } else {
            user = new User({ name, email, passwordHash, phone, ward, area, otp, otpExpiry });
        }

        await user.save();

        // Send OTP email
        try {
            await sendOtpEmail(email, name, otp);
        } catch (emailErr) {
            console.error('OTP email failed:', emailErr.message);
            // Don't block registration if email fails; log OTP for dev
            console.log(`[DEV] OTP for ${email}: ${otp}`);
        }

        res.status(201).json({
            message: 'Account created. Please check your email for the verification code.',
            email   // return email so frontend can pre-fill verify page
        });
    } catch (error) {
        next(error);
    }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Account not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified. Please login.' });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp        = undefined;
        user.otpExpiry  = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        next(error);
    }
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Account not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified' });

        const otp       = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp       = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        try {
            await sendOtpEmail(email, user.name, otp);
        } catch (emailErr) {
            console.error('OTP resend email failed:', emailErr.message);
            console.log(`[DEV] Resend OTP for ${email}: ${otp}`);
        }

        res.status(200).json({ message: 'A new verification code has been sent to your email.' });
    } catch (error) {
        next(error);
    }
};

// ── Login ──────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please check your inbox for the OTP.',
                unverified: true,
                email
            });
        }

        if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

        const { accessToken, refreshToken } = generateTokens(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ accessToken, user });
    } catch (error) {
        next(error);
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies || {};
        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
exports.refresh = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ message: 'Refresh token required' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user    = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

// ── Get Current User ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, ward, area, avatar } = req.body;

        const allowedUpdates = {};
        if (name)   allowedUpdates.name   = name.trim();
        if (phone)  allowedUpdates.phone  = phone.trim();
        if (ward)   allowedUpdates.ward   = ward.trim();
        if (area)   allowedUpdates.area   = area.trim();
        if (avatar) allowedUpdates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        next(error);
    }
};

// ── Change Password ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};
