const multer = require('multer');
const cloudinary = require('../services/cloudinary.service');
const fs = require('fs');
const path = require('path');

// Use real Cloudinary storage only if real keys exist, else fallback to local disk for local testing
const useCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== '123';

// ── Local disk fallback ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!useCloudinary && !fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// ── Custom Cloudinary v2 StorageEngine ─────────────────────────────────────────
// multer-storage-cloudinary@4 only supports the old cloudinary v1 SDK.
// This inline engine achieves the same result with cloudinary v2's upload_stream API.
const cloudinaryStorage = {
    _handleFile(req, file, cb) {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'civic-connect/issues',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
                if (error) return cb(error);
                cb(null, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    path: result.secure_url,      // accessible as req.file.path
                    size: result.bytes,
                    filename: result.public_id,   // accessible as req.file.filename
                    cloudinary: result            // full Cloudinary result object
                });
            }
        );
        file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, cb) {
        if (file.filename) {
            cloudinary.uploader.destroy(file.filename, cb);
        } else {
            cb(null);
        }
    }
};

// ── Export upload middleware ───────────────────────────────────────────────────
const upload = multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;
