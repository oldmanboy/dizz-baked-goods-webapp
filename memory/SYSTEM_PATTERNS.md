# System Patterns & Architectural Conventions

This document captures recurring architectural patterns and conventions implemented across Dizz Baked Goods.

---

## 1. Storage Abstraction Pattern (`IOrderRepository`)
To guarantee that transitioning to SQLite or PostgreSQL in Phase 3 requires zero controller or route refactoring, all order persistence operations must implement `IOrderRepository`:

```typescript
export interface IOrderRepository {
  createPendingOrder(order: Order): Promise<void>;
  getOrderByToken(token: string): Promise<Order | null>;
  getOrderByCode(code: string): Promise<Order | null>;
  confirmPayment(token: string, receiptData: ReceiptData): Promise<Order>;
  listOrders(filter?: OrderFilter): Promise<Order[]>;
  updateOrderStatus(orderCode: string, status: OrderStatus, actor?: string): Promise<Order>;
  exportToExcel(filter?: OrderFilter): Promise<Buffer>;
}
```

Implementation in `backend/src/services/storageService.ts` currently targets:
- `orders.csv` (append-only audit log)
- `orders.xlsx` (2 sheets: `Paid Orders` and `Bake Prep Line Items`)
- `orders_ledger.json` (runtime index and unique code tracker)

---

## 2. EMVCo TLV Parser & QRIS Checksum Engine
Indonesian QRIS follows EMVCo Merchant-Presented QR Specification:
- Tags are 2 characters (`00`–`99`).
- Lengths are 2 characters (`01`–`99`).
- Values are ASCII strings of specified length.
- Tag `01`: `11` -> `12` (Static to Dynamic mutation).
- Tag `54`: Transaction amount injected as string (`85024` -> `540585024`).
- Tag `63`: CRC-16/CCITT-FALSE calculated across entire payload ending in `"6304"`.

---

## 3. Spreadsheet Injection Defense Pattern
Any user-supplied value written into CSV or Excel files must be sanitized:
```typescript
export function sanitizeForSpreadsheet(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some(prefix => trimmed.startsWith(prefix))) {
    return `'${trimmed}`;
  }
  return trimmed;
}
```

---

## 4. Frontend Platform Abstraction Pattern (`utils/platform.ts`)
To prepare for Android packaging via CapacitorJS:
- Never call browser-specific APIs directly in business components.
- Wrap image downloads and photo picking in `platform.ts`:
  - `saveQrisImage(dataUrl: string, filename: string)` -> triggers `<a download>` on Web, or `@capacitor/filesystem` / MediaStore on Android.
  - `pickReceiptImage()` -> triggers `<input type="file">` on Web, or native Android Scoped Photo Picker.
- All API requests use explicit `VITE_API_BASE_URL` from environment.
