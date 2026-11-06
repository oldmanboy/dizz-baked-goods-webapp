# ADR-002: Dual-Storage Strategy (ExcelJS Multi-Sheet + Append-Only CSV with Async Mutex)

## Status
Accepted

## Context
The baker relies on Microsoft Excel on their local machine/Google Drive to review bake lists, total dough requirements, and customer fulfillment addresses. However, writing directly to an `.xlsx` file from concurrent web requests can corrupt the ZIP container or trigger OS file lock collisions (`EBUSY` when opened in Excel).

## Decision
We implement a dual-storage strategy managed through an in-process `Mutex`:
1. **Append-Only CSV (`orders.csv`)**: Synchronously appended upon order confirmation. Unbreakable flat-file audit log.
2. **Formatted Excel (`orders.xlsx` via `exceljs`)**: Rebuilt/updated atomically (`orders.tmp.xlsx` -> `orders.xlsx`) with two formatted worksheets:
   - Sheet 1: `Paid Orders` (Full customer and transaction summary)
   - Sheet 2: `Bake Prep Line Items` (Normalized per-bread row for pivot filtering)
3. **Lock Resilience**: If an `EBUSY` error occurs because the baker has `orders.xlsx` open in Excel, the order is safely committed to `orders.csv` + `orders_ledger.json`, flagged as pending, and retried asynchronously in the background.

## Consequences
- **Positive**: Baker enjoys rich formatted Excel sheets without needing database clients; zero lost orders even during concurrent checkouts or active file locks.
- **Negative**: Concurrency is throttled to serial file writes (acceptable for batch Pre-Orders; migrated to relational DB in Phase 3).
