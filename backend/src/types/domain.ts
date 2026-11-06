export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'PAID_PENDING_VERIFICATION'
  | 'VERIFIED_PAID'
  | 'REJECTED'
  | 'EXPIRED';

export type FulfillmentType = 'pickup' | 'delivery';

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  whatsapp: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface FulfillmentInfo {
  type: FulfillmentType;
  date: string; // YYYY-MM-DD
  batchId: string;
}

export interface PaymentInfo {
  method: 'qris_static_to_dynamic' | 'qris_gateway' | 'qris_mutation_listener';
  subtotal: number;
  uniqueCode: number; // 1..99
  totalAmount: number; // subtotal + uniqueCode
  qrisRawPayload?: string;
  qrisQrDataUrl?: string;
  receiptPath?: string;
  receiptUploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Order {
  id: string; // Internal UUID
  orderCode: string; // DBG-YYYYMMDD-XXXX
  orderToken: string; // 128-bit unguessable guest token
  userId?: string | null; // Null in Phase 1, linked in Phase 4
  status: OrderStatus;
  source: 'web' | 'android';
  customer: CustomerInfo;
  fulfillment: FulfillmentInfo;
  payment: PaymentInfo;
  items: OrderItem[];
  createdAt: string;
  expiresAt: string;
}

export interface ReceiptData {
  filename: string;
  mimetype: string;
  sizeBytes: number;
  storedPath: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  allergens: string[];
  weightGrams: number;
  maxPerOrder: number;
  available: boolean;
}

export interface BatchInfo {
  batchId: string;
  title: string;
  description: string;
  orderCutoff: string;
  fulfillmentDates: Array<{
    date: string;
    label: string;
    availableFulfillments: FulfillmentType[];
  }>;
  fulfillmentDetails: {
    pickup: { location: string; timeWindow: string };
    delivery: { provider: string; timeWindow: string };
  };
}

export interface CatalogData {
  activeBatch: BatchInfo;
  categories: Array<{ id: string; name: string }>;
  products: Product[];
}
