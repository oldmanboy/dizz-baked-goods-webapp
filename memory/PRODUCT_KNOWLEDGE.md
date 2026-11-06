# Product Knowledge — Dizz Baked Goods

This document describes the business context, bakery operations, and domain concepts for Dizz Baked Goods.

---

## 1. Bakery Business Model: Artisanal Pre-Order (PO)
Dizz Baked Goods operates on a **batch Pre-Order model** rather than on-demand instant fulfillment:
- Bread varieties require long natural fermentation (24–36 hours for sourdoughs, overnight cold-proof for brioches).
- Baking occurs on specific scheduled bake days (e.g., Saturday and Sunday).
- Pre-Order batches open several days before bake day and close at an authoritative **Cutoff Date/Time** (e.g., Thursday 21:00 WIB).
- Customers select either:
  1. **Self-Pickup**: From the bakery studio at designated pickup time windows.
  2. **Courier Delivery**: Via local instant/same-day couriers (GoSend/GrabExpress) arranged during delivery hours.

---

## 2. Product Catalog & Categories
Core bakery offerings:
1. **Sourdough Loaves**:
   - *Country Sourdough Loaf*: Rustic artisan open crumb, 100% natural starter.
   - *Seed & Grain Sourdough*: Sunflower, pumpkin, and roasted sesame blend.
2. **Brioche & Soft Buns**:
   - *Cranberry Cream Cheese Brioche*: Enriched butter dough with tart cranberries.
   - *Garlic Butter Salt Bread*: Crispy crust, buttery salted core (Shio Pan style).
3. **Pastries & Sweet Bakes**:
   - *Dark Chocolate Babka*: Swirled Valrhona dark chocolate ganache.
   - *Cinnamon Morning Roll*: Cardamom-spiced cinnamon sugar roll.

---

## 3. Order Codes & Payment Verification Lifecycle
- **Order Code Format**: `DBG-YYYYMMDD-XXXX` (e.g., `DBG-20261108-0024`).
- **Unique Code System**:
  - A 2-digit unique code (`+01` to `+99`) is added to the subtotal.
  - This ensures that two customers ordering the exact same items (e.g. `Rp 85.000`) get distinct payment amounts (e.g. `Rp 85.012` vs. `Rp 85.037`).
  - The baker can instantly match bank mutations against orders without expensive gateway subscriptions (Zero MDR fee).
- **Order States**:
  - `AWAITING_PAYMENT`: Initial order created, QRIS generated, 30-min countdown running.
  - `PAID_PENDING_VERIFICATION`: Customer uploaded payment screenshot proof. Stored in Excel/CSV.
  - `VERIFIED_PAID`: Baker reviewed and verified payment in bank statement.
  - `REJECTED`: Invalid payment proof or mismatch.
  - `EXPIRED`: 30-min window elapsed without payment submission; unique code recycled.
