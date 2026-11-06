import multer from 'multer';

// Memory storage keeps the image buffer in memory so sharp and file-type can inspect magic bytes
// before any file touches disk.
const storage = multer.memoryStorage();

export const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Basic MIME check; authoritative verification occurs via magic bytes in receiptService
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a JPG, PNG, or WebP screenshot of your payment.'));
    }
  },
});
