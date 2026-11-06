import { Router, Request, Response, NextFunction } from 'express';
import { CatalogService } from '../../services/catalogService.js';

export function createCatalogRouter(catalogService: CatalogService): Router {
  const router = Router();

  /**
   * GET /api/v1/catalog
   * Returns active PO batch details, available fulfillment dates, and full bread catalog.
   */
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const catalog = await catalogService.getCatalog();
      res.json(catalog);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
