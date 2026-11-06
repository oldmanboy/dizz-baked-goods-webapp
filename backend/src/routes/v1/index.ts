import { Router } from 'express';
import { CatalogService } from '../../services/catalogService.js';
import { QrisService } from '../../services/qrisService.js';
import { UniqueCodeService } from '../../services/uniqueCodeService.js';
import { ReceiptService } from '../../services/receiptService.js';
import { IOrderRepository } from '../../types/storage.js';
import { createCatalogRouter } from './catalogRoutes.js';
import { createOrderRouter } from './orderRoutes.js';

export function createV1Router(
  catalogService: CatalogService,
  qrisService: QrisService,
  uniqueCodeService: UniqueCodeService,
  receiptService: ReceiptService,
  storageService: IOrderRepository
): Router {
  const router = Router();

  router.use('/catalog', createCatalogRouter(catalogService));
  router.use(
    '/orders',
    createOrderRouter(
      catalogService,
      qrisService,
      uniqueCodeService,
      receiptService,
      storageService
    )
  );

  return router;
}
