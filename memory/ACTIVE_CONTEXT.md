# Active Context & Working State

## Current Focus
- **Milestone**: Phase 1 (MVP) — Milestone 1 & 2 Execution
- **Status**: `/grill-me` interview successfully completed across all 9 architectural branches. All design decisions codified into `ADR-005`. Ready to implement the clarified features into the codebase.

## Key Design Decisions Agreed via /grill-me
1. **QRIS Demo Mode**: Auto-fallback to verified test QRIS with warning banner if `.env` payload is missing.
2. **Unique Code Allocation**: 2-digit codes (`+01` to `+99`) with 30-minute auto-expiry TTL.
3. **Confirmation UX**: Web confirmation card with live status + 1-tap "Send Order to Baker on WhatsApp" (`wa.me`).
4. **Excel Structure**: Master rolling `orders.xlsx` with auto-filters on both sheets (`Paid Orders` and `Bake Prep Line Items`).
5. **Stock Quota**: Hybrid model (optional `stockQuota` per bread; otherwise open until cutoff timestamp).
6. **Delivery Pricing**: Configurable flat-rate delivery fee added to checkout total and QRIS for courier delivery.
7. **Order Tracking**: Header modal for tracking orders by Order Code (`DBG-YYYYMMDD-XXXX`).
8. **Receipt Security**: Protected route (`/api/v1/orders/:token/receipt`) requiring order token.
9. **Testing Depth**: Vitest unit & integration suite for QRIS math, formula defense, mutex concurrency, and API routes.

## Immediate Next Actions
- Update `catalog.json` with delivery flat fee configuration (`deliveryFee: 25000`) and optional `stockQuota`.
- Update backend services (`catalogService`, `orderRoutes`, `storageService`) to incorporate delivery fee, order tracking endpoint, and protected receipt download.
- Wire frontend Header "Track My Order" modal and WhatsApp button in `OrderPaymentPage`.
- Commit and push changes to GitHub (`oldmanboy/dizz-baked-goods-webapp`).
