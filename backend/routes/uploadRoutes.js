const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `paw-${uniqueSuffix}${ext}`);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimeTypeMatch = allowedTypes.test(file.mimetype);
  const extMatch = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeTypeMatch && extMatch) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, JPG, PNG, WEBP, and GIF images are allowed!'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

// @route   POST /api/v1/upload
// @desc    Upload a single image
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
  });
});

// @route   POST /api/v1/upload/multiple
// @desc    Upload multiple pet photos
// @access  Private
router.post('/multiple', protect, upload.array('images', 6), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No image files uploaded',
    });
  }

  const urls = req.files.map((file) => `/uploads/${file.filename}`);

  res.status(201).json({
    success: true,
    message: `${urls.length} images uploaded successfully`,
    urls,
  });
});

module.exports = router;
