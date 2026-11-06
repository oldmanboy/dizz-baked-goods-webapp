import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { Mutex } from 'async-mutex';
import ExcelJS from 'exceljs';
import { Order, OrderStatus, ReceiptData } from '../types/domain.js';
import { IOrderRepository, OrderFilter } from '../types/storage.js';
import { sanitizeForSpreadsheet } from '../schemas/orderSchemas.js';

export class StorageService implements IOrderRepository {
  private storageDir: string;
  private csvPath: string;
  private xlsxPath: string;
  private ledgerPath: string;
  private writeMutex = new Mutex();
  private pendingXlsxSync = false;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.csvPath = path.join(this.storageDir, 'orders.csv');
    this.xlsxPath = path.join(this.storageDir, 'orders.xlsx');
    this.ledgerPath = path.join(this.storageDir, 'orders_ledger.json');
  }

  public async init(): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });

    // Initialize CSV header if file doesn't exist
    if (!existsSync(this.csvPath)) {
      const csvHeader =
        'OrderCode,PaidAt,Status,BatchId,FulfillmentDate,FulfillmentType,CustomerName,WhatsApp,Address,Subtotal,UniqueCode,TotalPaid,ItemsSummary,ReceiptPath\n';
      await fs.writeFile(this.csvPath, csvHeader, 'utf-8');
    }

    // Initialize Ledger if file doesn't exist
    if (!existsSync(this.ledgerPath)) {
      await fs.writeFile(
        this.ledgerPath,
        JSON.stringify({ pending: {}, confirmed: {} }, null, 2),
        'utf-8'
      );
    }
  }

  private async readLedger(): Promise<{
    pending: Record<string, Order>;
    confirmed: Record<string, Order>;
  }> {
    await this.init();
    try {
      const content = await fs.readFile(this.ledgerPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { pending: {}, confirmed: {} };
    }
  }

  private async writeLedger(data: {
    pending: Record<string, Order>;
    confirmed: Record<string, Order>;
  }): Promise<void> {
    const tmp = `${this.ledgerPath}.tmp.${Date.now()}`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmp, this.ledgerPath);
  }

  public async createPendingOrder(order: Order): Promise<void> {
    await this.writeMutex.runExclusive(async () => {
      const ledger = await this.readLedger();
      ledger.pending[order.orderToken] = order;
      await this.writeLedger(ledger);
    });
  }

  public async getOrderByToken(token: string): Promise<Order | null> {
    const ledger = await this.readLedger();
    return ledger.pending[token] || ledger.confirmed[token] || null;
  }

  public async getOrderByCode(code: string): Promise<Order | null> {
    const ledger = await this.readLedger();
    const all = [...Object.values(ledger.pending), ...Object.values(ledger.confirmed)];
    return all.find((o) => o.orderCode === code) || null;
  }

  public async confirmPayment(token: string, receiptData: ReceiptData): Promise<Order> {
    return this.writeMutex.runExclusive(async () => {
      const ledger = await this.readLedger();
      const order = ledger.pending[token];

      if (!order) {
        throw new Error('Order not found or payment already processed.');
      }

      const nowIso = new Date().toISOString();
      order.status = 'PAID_PENDING_VERIFICATION';
      order.payment.receiptPath = receiptData.storedPath;
      order.payment.receiptUploadedAt = nowIso;

      // Move from pending to confirmed in ledger
      delete ledger.pending[token];
      ledger.confirmed[token] = order;
      await this.writeLedger(ledger);

      // 1. Immediately append to append-only CSV backup
      await this.appendOrderToCsv(order);

      // 2. Sync to formatted multi-sheet Excel
      await this.syncToExcel(Object.values(ledger.confirmed));

      return order;
    });
  }

  public async listOrders(filter?: OrderFilter): Promise<Order[]> {
    const ledger = await this.readLedger();
    let orders = Object.values(ledger.confirmed);

    if (filter?.status) {
      orders = orders.filter((o) => o.status === filter.status);
    }
    if (filter?.batchId) {
      orders = orders.filter((o) => o.fulfillment.batchId === filter.batchId);
    }
    if (filter?.fulfillmentDate) {
      orders = orders.filter((o) => o.fulfillment.date === filter.fulfillmentDate);
    }

    return orders;
  }

  public async updateOrderStatus(
    orderCode: string,
    status: OrderStatus,
    actor?: string
  ): Promise<Order> {
    return this.writeMutex.runExclusive(async () => {
      const ledger = await this.readLedger();
      const token = Object.keys(ledger.confirmed).find(
        (t) => ledger.confirmed[t].orderCode === orderCode
      );

      if (!token) {
        throw new Error(`Order ${orderCode} not found in confirmed records.`);
      }

      const order = ledger.confirmed[token];
      order.status = status;
      if (status === 'VERIFIED_PAID') {
        order.payment.verifiedAt = new Date().toISOString();
        order.payment.verifiedBy = actor || 'baker';
      }

      await this.writeLedger(ledger);
      await this.syncToExcel(Object.values(ledger.confirmed));
      return order;
    });
  }

  public async exportToExcel(filter?: OrderFilter): Promise<Buffer> {
    const orders = await this.listOrders(filter);
    const workbook = this.buildWorkbook(orders);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // --- Internal Persistence Helpers ---

  private async appendOrderToCsv(order: Order): Promise<void> {
    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.name}`)
      .join('; ');

    const row = [
      order.orderCode,
      order.payment.receiptUploadedAt || order.createdAt,
      order.status,
      order.fulfillment.batchId,
      order.fulfillment.date,
      order.fulfillment.type,
      `"${sanitizeForSpreadsheet(order.customer.name).replace(/"/g, '""')}"`,
      `"${order.customer.whatsapp}"`,
      `"${sanitizeForSpreadsheet(order.customer.address || '').replace(/"/g, '""')}"`,
      order.payment.subtotal,
      order.payment.uniqueCode,
      order.payment.totalAmount,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${order.payment.receiptPath || ''}"`,
    ].join(',');

    await fs.appendFile(this.csvPath, `${row}\n`, 'utf-8');
  }

  private buildWorkbook(orders: Order[]): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dizz Baked Goods Engine';
    workbook.created = new Date();

    // Sheet 1: Paid Orders Summary
    const ordersSheet = workbook.addWorksheet('Paid Orders', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ordersSheet.columns = [
      { header: 'Order Code', key: 'orderCode', width: 22 },
      { header: 'Paid At', key: 'paidAt', width: 20 },
      { header: 'Status', key: 'status', width: 24 },
      { header: 'PO Batch', key: 'batchId', width: 18 },
      { header: 'Bake Date', key: 'bakeDate', width: 14 },
      { header: 'Fulfillment', key: 'fulfillmentType', width: 14 },
      { header: 'Customer Name', key: 'customerName', width: 24 },
      { header: 'WhatsApp', key: 'whatsapp', width: 18 },
      { header: 'Address / Notes', key: 'addressNotes', width: 32 },
      { header: 'Items Summary', key: 'itemsSummary', width: 36 },
      { header: 'Subtotal (Rp)', key: 'subtotal', width: 16 },
      { header: 'Unique Code (Rp)', key: 'uniqueCode', width: 16 },
      { header: 'Total QRIS (Rp)', key: 'totalAmount', width: 16 },
      { header: 'Receipt File', key: 'receiptPath', width: 30 },
    ];

    // Style Header Row
    const headerRow = ordersSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5A2B' }, // Warm artisanal bakery brown
    };

    for (const o of orders) {
      ordersSheet.addRow({
        orderCode: o.orderCode,
        paidAt: o.payment.receiptUploadedAt || o.createdAt,
        status: o.status,
        batchId: o.fulfillment.batchId,
        bakeDate: o.fulfillment.date,
        fulfillmentType: o.fulfillment.type.toUpperCase(),
        customerName: sanitizeForSpreadsheet(o.customer.name),
        whatsapp: o.customer.whatsapp,
        addressNotes: sanitizeForSpreadsheet(
          [o.customer.address, o.customer.notes].filter(Boolean).join(' | ')
        ),
        itemsSummary: o.items.map((i) => `${i.quantity}x ${i.name}`).join('; '),
        subtotal: o.payment.subtotal,
        uniqueCode: o.payment.uniqueCode,
        totalAmount: o.payment.totalAmount,
        receiptPath: o.payment.receiptPath || '',
      });
    }

    // Sheet 2: Bake Prep Line Items (Normalized for easy loaf totals)
    const lineItemsSheet = workbook.addWorksheet('Bake Prep Line Items', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    lineItemsSheet.columns = [
      { header: 'Order Code', key: 'orderCode', width: 22 },
      { header: 'Bake Date', key: 'bakeDate', width: 14 },
      { header: 'Customer Name', key: 'customerName', width: 24 },
      { header: 'Product ID', key: 'productId', width: 22 },
      { header: 'Bread Item', key: 'breadName', width: 32 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit Price (Rp)', key: 'unitPrice', width: 16 },
      { header: 'Line Total (Rp)', key: 'lineTotal', width: 16 },
    ];

    const lineHeader = lineItemsSheet.getRow(1);
    lineHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    lineHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5A3825' },
    };

    for (const o of orders) {
      for (const item of o.items) {
        lineItemsSheet.addRow({
          orderCode: o.orderCode,
          bakeDate: o.fulfillment.date,
          customerName: sanitizeForSpreadsheet(o.customer.name),
          productId: item.productId,
          breadName: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        });
      }
    }

    return workbook;
  }

  private async syncToExcel(orders: Order[]): Promise<void> {
    const workbook = this.buildWorkbook(orders);
    const tmpPath = `${this.xlsxPath}.tmp.${Date.now()}`;

    try {
      await workbook.xlsx.writeFile(tmpPath);
      await fs.rename(tmpPath, this.xlsxPath);
      this.pendingXlsxSync = false;
    } catch (err: any) {
      // Catch Windows/Google Drive EBUSY file locks when open in Microsoft Excel
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        console.warn(
          '⚠️ [StorageService] orders.xlsx is locked by another process (e.g. Microsoft Excel). Order is safely committed to orders.csv and ledger; pending Excel sync scheduled.'
        );
        this.pendingXlsxSync = true;
        // Clean up tmp file
        try {
          await fs.unlink(tmpPath);
        } catch {}
      } else {
        throw err;
      }
    }
  }
}
