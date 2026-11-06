# AI Constitution — Non-Negotiable System Invariants

This constitution defines the **fundamental laws** that all AI agents operating on the Dizz Baked Goods codebase must uphold. No agent instruction, prompt, or user override may violate these rules unless explicitly modified through an authorized governance amendment.

---

### Article I: Authoritative Financial Integrity
1. **Zero Client Price Trust**: The backend must never accept a price, subtotal, or total amount calculated by the frontend. The backend alone must calculate prices using authoritative values in `backend/data/catalog.json`.
2. **Deterministic Amount Mutation**: The Dynamic QRIS amount (Tag 54) must exactly equal `authoritative_subtotal + unique_code`. Rounding, floating-point math, or currency truncation is prohibited; calculations must use whole integer Indonesian Rupiah (IDR).
3. **QRIS Checksum Invariant**: Every mutated QRIS payload must have its Tag 63 CRC-16/CCITT-FALSE checksum recalculated and validated before being presented to the customer.

---

### Article II: File Storage & Concurrency Protection
1. **Mutex Serialization**: All write operations targeting shared flat files (`orders.xlsx`, `orders.csv`, `orders_ledger.json`) must acquire an asynchronous mutex (`async-mutex`) to prevent concurrent process interleaving, corrupted ZIP archives, or partial CSV rows.
2. **Zero Lost Orders**: If Microsoft Excel or Google Drive places a temporary OS lock (`EBUSY`/`EPERM`) on `orders.xlsx`, the system must append immediately to `orders.csv` and the JSON ledger, flag the sync as pending, and retry in the background. An order confirmation must never fail due to an Excel lock.
3. **Decoupled Persistence**: All storage calls must flow through the `IOrderRepository` interface to guarantee forward compatibility with Phase 3 relational databases (SQLite/PostgreSQL).

---

### Article III: Zero-Trust Input Sanitization
1. **Formula Injection (DDE) Prevention**: Any user-supplied string written into Excel or CSV cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` must be escaped with a single quote prefix (`'`) and typed as explicit string cells.
2. **Receipt File Hardening**: Uploaded receipt images must have their magic bytes inspected (JPEG, PNG, WEBP). They must be transcoded using `sharp` to strip all EXIF metadata, GPS coordinates, and polyglot payloads, and saved to a non-public directory.
3. **IDOR Mitigation**: Public order tracking and payment endpoints must never expose or accept sequential database IDs (`/orders/123`). Access must require an unguessable 128-bit cryptographic token (`/orders/:token`).

---

### Article IV: Privacy & PII Safeguards
1. **No Sensitive Data in Git**: Customer phone numbers, addresses, names, uploaded receipts, and merchant static QRIS payloads must never be committed to Git.
2. **Log Redaction**: Production application logs must mask or truncate customer WhatsApp numbers (`+62812****5678`) and never print full payment tokens.

---

### Article V: Android & Platform Agnosticism
1. **Decoupled API Boundaries**: The frontend must remain a clean SPA decoupled from the backend, communicating exclusively over typed REST endpoints with explicit base URLs (`VITE_API_BASE_URL`), preserving immediate compatibility with CapacitorJS Android packaging.
