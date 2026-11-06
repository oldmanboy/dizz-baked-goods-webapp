import fs from 'fs/promises';
import path from 'path';
import { CatalogData, OrderItem, Product } from '../types/domain.js';

export class CatalogService {
  private catalogPath: string;
  private catalogData: CatalogData | null = null;

  constructor(catalogPath?: string) {
    this.catalogPath =
      catalogPath || path.resolve(process.cwd(), 'data', 'catalog.json');
  }

  public async getCatalog(): Promise<CatalogData> {
    if (!this.catalogData) {
      const raw = await fs.readFile(this.catalogPath, 'utf-8');
      this.catalogData = JSON.parse(raw) as CatalogData;
    }
    return this.catalogData;
  }

  public async reloadCatalog(): Promise<CatalogData> {
    this.catalogData = null;
    return this.getCatalog();
  }

  /**
   * Recalculates authoritative order items and subtotal from catalog.json.
   * Rejects client-supplied prices to prevent price manipulation.
   */
  public async calculateAuthoritativeOrder(
    requestedItems: Array<{ productId: string; quantity: number }>,
    fulfillmentDate: string
  ): Promise<{ items: OrderItem[]; subtotal: number; batchId: string }> {
    const catalog = await this.getCatalog();
    const batch = catalog.activeBatch;

    // 1. Verify PO Cutoff Time
    const cutoffDate = new Date(batch.orderCutoff);
    if (new Date() > cutoffDate) {
      throw new Error(
        `Pre-Order is closed for this batch. Cutoff was ${cutoffDate.toLocaleString('id-ID')}`
      );
    }

    // 2. Verify Fulfillment Date is valid for this batch
    const validDates = batch.fulfillmentDates.map((f) => f.date);
    if (!validDates.includes(fulfillmentDate)) {
      throw new Error(
        `Invalid fulfillment date: ${fulfillmentDate}. Available dates: ${validDates.join(', ')}`
      );
    }

    // 3. Map products and authoritative prices
    const productMap = new Map<string, Product>(
      catalog.products.map((p) => [p.id, p])
    );

    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const req of requestedItems) {
      const product = productMap.get(req.productId);
      if (!product) {
        throw new Error(`Product not found: ${req.productId}`);
      }
      if (!product.available) {
        throw new Error(`Product "${product.name}" is currently sold out.`);
      }
      if (req.quantity > product.maxPerOrder) {
        throw new Error(
          `Maximum ${product.maxPerOrder} loaves allowed for "${product.name}".`
        );
      }

      const lineTotal = product.price * req.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: req.quantity,
        lineTotal,
      });
    }

    return {
      items: validatedItems,
      subtotal,
      batchId: batch.batchId,
    };
  }
}
