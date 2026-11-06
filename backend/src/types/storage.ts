import { Order, OrderStatus, ReceiptData } from './domain.js';

export interface OrderFilter {
  status?: OrderStatus;
  batchId?: string;
  fulfillmentDate?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Authoritative persistence contract for Dizz Baked Goods orders.
 * Decoupled from physical storage engine to allow zero-refactor migration from
 * Phase 1 flat-files (Excel/CSV) to Phase 3 relational database (PostgreSQL/SQLite).
 */
export interface IOrderRepository {
  createPendingOrder(order: Order): Promise<void>;
  getOrderByToken(token: string): Promise<Order | null>;
  getOrderByCode(code: string): Promise<Order | null>;
  confirmPayment(token: string, receiptData: ReceiptData): Promise<Order>;

  // Forward-compatible hooks for Phase 2 Admin & Phase 5 Webhooks
  listOrders(filter?: OrderFilter): Promise<Order[]>;
  updateOrderStatus(orderCode: string, status: OrderStatus, actor?: string): Promise<Order>;
  exportToExcel(filter?: OrderFilter): Promise<Buffer>;
}
