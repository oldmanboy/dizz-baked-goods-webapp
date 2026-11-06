import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CatalogService } from '../../services/catalogService.js';
import { QrisService } from '../../services/qrisService.js';
import { UniqueCodeService } from '../../services/uniqueCodeService.js';
import { ReceiptService } from '../../services/receiptService.js';
import { IOrderRepository } from '../../types/storage.js';
import { createOrderSchema } from '../../schemas/orderSchemas.js';
import { orderCreationLimiter, receiptUploadLimiter } from '../../middleware/rateLimiter.js';
import { uploadReceipt } from '../../middleware/upload.js';
import { Order } from '../../types/domain.js';

export function createOrderRouter(
  catalogService: CatalogService,
  qrisService: QrisService,
  uniqueCodeService: UniqueCodeService,
  receiptService: ReceiptService,
  storageService: IOrderRepository
): Router {
  const router = Router();

  /**
   * POST /api/v1/orders
   * Creates a new pending Pre-Order, allocates a 2-digit verification code, and returns Dynamic QRIS.
   */
  router.post('/', orderCreationLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createOrderSchema.parse(req.body);

      // 1. Calculate authoritative prices & verify PO cutoff
      const { items, subtotal, batchId } = await catalogService.calculateAuthoritativeOrder(
        input.items,
        input.fulfillment.date
      );

      // 2. Generate Human-Readable Order Code: DBG-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `DBG-${dateStr}-${randomSuffix}`;
      const orderToken = uuidv4();

      // 3. Allocate unique 2-digit verification code (+01..+99)
      const { code: uniqueCode, expiresAt } = uniqueCodeService.allocateCode(subtotal, orderCode);
      const totalAmount = subtotal + uniqueCode;

      // 4. Generate Dynamic QRIS payload and QR PNG Data URL
      const qrisRawPayload = qrisService.generateDynamicQris(totalAmount);
      const qrisQrDataUrl = await qrisService.generateQrDataUrl(qrisRawPayload);

      // 5. Construct Order Entity
      const order: Order = {
        id: uuidv4(),
        orderCode,
        orderToken,
        status: 'AWAITING_PAYMENT',
        source: input.source,
        customer: input.customer,
        fulfillment: {
          type: input.fulfillment.type,
          date: input.fulfillment.date,
          batchId,
        },
        payment: {
          method: 'qris_static_to_dynamic',
          subtotal,
          uniqueCode,
          totalAmount,
          qrisRawPayload,
          qrisQrDataUrl,
        },
        items,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // 6. Persist to storage repository
      await storageService.createPendingOrder(order);

      // Return payment instructions to client
      res.status(201).json({
        orderCode: order.orderCode,
        orderToken: order.orderToken,
        status: order.status,
        fulfillment: order.fulfillment,
        customerName: order.customer.name,
        payment: {
          subtotal: order.payment.subtotal,
          uniqueCode: order.payment.uniqueCode,
          totalAmount: order.payment.totalAmount,
          qrisQrDataUrl: order.payment.qrisQrDataUrl,
        },
        items: order.items,
        expiresAt: order.expiresAt,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/orders/:token
   * Retrieves order status for reload-safe payment and confirmation screens.
   */
  router.get('/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await storageService.getOrderByToken(req.params.token);
      if (!order) {
        res.status(404).json({ error: 'Order not found or link has expired.' });
        return;
      }

      res.json({
        orderCode: order.orderCode,
        orderToken: order.orderToken,
        status: order.status,
        fulfillment: order.fulfillment,
        customer: {
          name: order.customer.name,
          whatsapp: order.customer.whatsapp,
        },
        payment: {
          subtotal: order.payment.subtotal,
          uniqueCode: order.payment.uniqueCode,
          totalAmount: order.payment.totalAmount,
          qrisQrDataUrl: order.payment.qrisQrDataUrl,
          receiptUploadedAt: order.payment.receiptUploadedAt,
        },
        items: order.items,
        expiresAt: order.expiresAt,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/orders/:token/confirm-payment
   * Customer submits payment proof receipt image.
   * Validates magic bytes, strips EXIF, converts to WebP, updates status, and appends to Excel/CSV.
   */
  router.post(
    '/:token/confirm-payment',
    receiptUploadLimiter,
    uploadReceipt.single('receipt'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = req.params;
        const file = req.file;

        if (!file) {
          res.status(400).json({ error: 'Payment receipt image file is required.' });
          return;
        }

        const existingOrder = await storageService.getOrderByToken(token);
        if (!existingOrder) {
          res.status(404).json({ error: 'Order not found.' });
          return;
        }

        if (existingOrder.status !== 'AWAITING_PAYMENT') {
          res.status(400).json({
            error: `Order is already in "${existingOrder.status}" state. Receipt already submitted.`,
          });
          return;
        }

        // 1. Transcode and sanitize receipt image via Sharp
        const receiptData = await receiptService.sanitizeAndSaveReceipt(
          file.buffer,
          existingOrder.orderCode
        );

        // 2. Commit confirmation to IOrderRepository (appends to CSV + ExcelJS)
        const updatedOrder = await storageService.confirmPayment(token, receiptData);

        // 3. Release unique code from reservation map
        uniqueCodeService.releaseCode(updatedOrder.orderCode);

        res.json({
          message: 'Payment confirmation received! The baker will verify your transfer shortly.',
          orderCode: updatedOrder.orderCode,
          status: updatedOrder.status,
          totalPaid: updatedOrder.payment.totalAmount,
          receiptUploadedAt: updatedOrder.payment.receiptUploadedAt,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
