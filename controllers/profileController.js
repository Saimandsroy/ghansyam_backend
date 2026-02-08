/**
 * Profile Controller
 * Handles profile get/update/image upload for Manager, Team, Writer roles
 */
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper for DB queries
const query = (text, params) => pool.query(text, params);

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
        }
    }
}).single('profile_image');

/**
 * Get profile for current user
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(
            `SELECT id, name, email, gender, mobile_number as mobile, profile_image, created_at as joined_date
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting profile:', error);
        next(error);
    }
};

/**
 * Update profile for current user
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, gender, mobile } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        await query(
            `UPDATE users SET name = $1, gender = $2, mobile_number = $3, updated_at = NOW()
             WHERE id = $4`,
            [name.trim(), gender || null, mobile || null, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        next(error);
    }
};

/**
 * Upload profile image for current user
 */
const uploadProfileImage = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const userId = req.user.id;
            const imagePath = req.file.path;

            await query(
                `UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2`,
                [imagePath, userId]
            );

            res.json({ message: 'Profile image uploaded successfully', path: imagePath });
        } catch (error) {
            console.error('Error uploading profile image:', error);
            next(error);
        }
    });
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfileImage
};
