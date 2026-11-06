# AI Governance — Security Policy & Defense in Depth

This document sets the mandatory security requirements for all code written for Dizz Baked Goods.

## 1. Input Validation & Schema Enforcement
- Every API endpoint receiving body, query, or params must validate using strict **Zod** schemas.
- Extra unknown fields must be stripped (`.strict()` or default Zod parsing).
- Field length constraints must be applied:
  - `name`: 2 to 100 characters, trimmed.
  - `whatsapp`: E.164 normalized format (`^+62[0-9]{8,13}$`).
  - `notes` / `address`: 0 to 500 characters max.
  - `quantity`: Positive integer, minimum 1, maximum 50 loaves per item.

## 2. Injection Mitigations
- **Formula Injection (CWE-1236)**:
  - Any string exported to CSV or Excel must pass through `sanitizeForSpreadsheet()`.
  - Leading characters `=`, `+`, `-`, `@`, `\t`, `\r` get prepended with `'`.
- **Command & Script Injection**:
  - Image files are converted to `.webp` via binary buffer in `sharp`—no external CLI commands (e.g. `convert` or `ffmpeg`) may be spawned with shell execution.

## 3. Rate Limiting & Resource Exhaustion Defense
- `express-rate-limit` must guard public write endpoints:
  - Order creation: Maximum 10 requests per 15 minutes per IP.
  - Receipt upload / payment confirmation: Maximum 15 requests per 15 minutes per IP.
- File upload buffer cap: Strict 5 MB maximum memory limit per upload.
- Unpaid order TTL: 30-minute expiry to free allocated 2-digit unique codes.

## 4. Secret & Credential Management
- No production secrets or merchant QRIS keys in source code.
- `.env` files must be gitignored; only `.env.example` with dummy/test vectors may be committed.
- Dev fallback Static QRIS strings must be clearly labeled test-only mocks.

## 5. Transport Hardening
- Express must use `helmet` with secure defaults.
- CORS must explicitly validate origins against configured `ALLOWED_ORIGINS` (including web frontend and `capacitor://localhost` / `https://localhost` for Android).
