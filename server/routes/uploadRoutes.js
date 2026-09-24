const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists safely
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.error("Warning: Could not create uploads directory. If you are on Vercel/Serverless, local uploads won't work.", err);
}

// Multer config: temporarily store in memory so we can convert it
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  }
});

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ success: false, message: err.message || 'Error during file upload.' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an image file.' });
      }

      const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const outputPath = path.join(uploadsDir, filename);

      try {
        // Convert to WebP using sharp
        await sharp(req.file.buffer)
          .webp({ quality: 80 })
          .toFile(outputPath);
      } catch (sharpError) {
        console.error('Sharp/FileSystem Error during image processing:', sharpError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to process image on server. Server file system might be read-only (like Vercel).',
          errorDetails: sharpError.message 
        });
      }

      // Return the URL that the frontend can use
      const imageUrl = `/uploads/${filename}`;
      
      return res.json({
        success: true,
        message: 'Image uploaded and converted to WebP successfully.',
        imageUrl
      });
    } catch (err) {
      console.error('Error in upload route logic:', err);
      return res.status(500).json({ success: false, message: 'Failed to process image.' });
    }
  });
});

module.exports = router;
