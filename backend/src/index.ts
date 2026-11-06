import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env.js';
import { CatalogService } from './services/catalogService.js';
import { QrisService } from './services/qrisService.js';
import { UniqueCodeService } from './services/uniqueCodeService.js';
import { ReceiptService } from './services/receiptService.js';
import { StorageService } from './services/storageService.js';
import { createV1Router } from './routes/v1/index.js';
import { errorHandler } from './middleware/errorHandler.js';

async function bootstrap() {
  const app = express();

  // 1. Core Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps (no origin) or configured origins
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 2. Instantiate Authoritative Services
  console.log('🍞 Initializing Dizz Baked Goods Services...');

  const qrisService = new QrisService(env.STATIC_QRIS_PAYLOAD);
  console.log('✅ Static QRIS payload validated with CRC-16 check.');

  const catalogService = new CatalogService();
  const uniqueCodeService = new UniqueCodeService(env.ORDER_EXPIRY_MINUTES);
  const receiptService = new ReceiptService(env.STORAGE_DIR);
  await receiptService.init();

  const storageService = new StorageService(env.STORAGE_DIR);
  await storageService.init();
  console.log('✅ Flat-file storage (ExcelJS + CSV + Ledger) ready.');

  // 3. Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'dizz-baked-goods-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Mount API v1
  app.use(
    '/api/v1',
    createV1Router(
      catalogService,
      qrisService,
      uniqueCodeService,
      receiptService,
      storageService
    )
  );

  // 5. Centralized Error Handler
  app.use(errorHandler);

  // 6. Start Listening
  app.listen(env.PORT, () => {
    console.log(`🚀 Dizz Baked Goods API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
