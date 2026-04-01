const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const path = require('path');

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 5000, // 5000 for local testing
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Routes Placeholder
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/issues', require('./routes/issue.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/ai', require('./routes/ai.routes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
