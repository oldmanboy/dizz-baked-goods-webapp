import rateLimit from 'express-rate-limit';

export const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 order creations per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many orders created from this connection. Please wait a few minutes before trying again.',
  },
});

export const receiptUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 receipt upload attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many upload attempts. Please wait a moment before trying again.',
  },
});
