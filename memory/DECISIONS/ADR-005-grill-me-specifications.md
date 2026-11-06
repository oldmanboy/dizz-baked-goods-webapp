# ADR-005: Phase 1 (MVP) Architectural Alignments & Grill-Me Decisions

## Status
Accepted

## Context
Following the `/grill-me` design interview on `docs/implementation_plan.md`, the core engineering boundaries and business logic decisions for Phase 1 (MVP) have been established and aligned with the user.

## Decisions

1. **QRIS Configuration & Fallback Mode**:
   - The application will automatically run in Demo/Sandbox mode with a verified sample QRIS string and a storefront warning banner if no production `STATIC_QRIS_PAYLOAD` is provided in `.env`.

2. **Unique Verification Code Range**:
   - Uses 2-digit verification codes (`+01` to `+99`) with an authoritative 30-minute auto-expiry TTL, recycling abandoned codes automatically.

3. **Confirmation & Baker Communication**:
   - Web confirmation card displaying real-time status (`PAID_PENDING_VERIFICATION`) with a 1-tap "Send Order Summary to Baker on WhatsApp" button (`wa.me` deep link) containing prefilled order details.

4. **Excel Storage Organization**:
   - A single master rolling workbook (`backend/storage/orders.xlsx`) featuring auto-filter dropdowns across both sheets (`Paid Orders` and `Bake Prep Line Items`) for easy batch and bake-date filtering.

5. **Batch Quota & Stock Management**:
   - Hybrid inventory approach: optional `stockQuota` per product per bake date in `catalog.json` (marks "Sold Out" when exhausted), defaulting to open ordering until the batch cutoff date.

6. **Delivery Pricing Model**:
   - Flat-rate delivery fee (e.g. Rp 25.000, configured in `catalog.json`) added to the subtotal and included in the Dynamic QRIS amount when Courier Delivery is selected; Rp 0 for Self-Pickup.

7. **Customer Order Tracking**:
   - Native Indonesian `+62` phone input with E.164 normalization, paired with a simple "Track My Order" modal in the header using the human-readable Order Code (e.g., `DBG-20261108-0024`).

8. **Receipt Security & Privacy**:
   - Protected endpoint (`/api/v1/orders/:token/receipt`) that verifies the order token before serving payment screenshots, preventing public scraping of customer bank details.

9. **Test Suite Scope**:
   - Vitest unit and integration suite covering QRIS EMVCo TLV parsing, formula injection sanitization, mutex concurrent writes, and REST endpoints under a single `npm test` command.
