const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('../services/cloudinary.service');

// Use real Cloudinary storage only if real keys exist, else fallback to local disk for local testing
const useCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== '123';

const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!useCloudinary && !fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const storage = useCloudinary ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic-connect/issues',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
}) : localStorage;

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
