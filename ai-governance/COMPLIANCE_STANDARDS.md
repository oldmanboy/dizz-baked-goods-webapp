# AI Governance — Compliance & Standards

This document outlines regulatory and technical compliance requirements applicable to Dizz Baked Goods.

---

## 1. Indonesian QRIS & EMVCo Standards (ASPI / Bank Indonesia)
The Indonesian National Standard for Quick Response Code (QRIS) is governed by **Bank Indonesia (PADG No. 21/18/PADG/2019)** and follows the **EMVCo Merchant-Presented Mode Specification (v1.0)**:

### Mandatory TLV Tag Specifications
- **Tag 00 (Payload Format Indicator)**: Must be `"01"`.
- **Tag 01 (Point of Initiation Method)**:
  - Static QR: `"11"` (Customer must manually enter amount).
  - Dynamic QR: `"12"` (Banking/e-wallet app auto-fills amount and locks it).
  - *Mitigation*: Our engine mutates `"11"` to `"12"` during dynamic generation.
- **Tag 26–51 (Merchant Account Information)**: Must be preserved verbatim from merchant payload.
- **Tag 52 (Merchant Category Code)**: Preserved.
- **Tag 53 (Transaction Currency)**: Must be `"360"` (Indonesian Rupiah).
- **Tag 54 (Transaction Amount)**:
  - Whole integer IDR formatted string with length indicator (e.g., `85024` -> `540585024`).
  - No decimals (`.00` is invalid in IDR QRIS).
- **Tag 55–57 (Tip / Convenience Fee)**:
  - Must be stripped during dynamic conversion so banking apps do not prompt customers for additional fees.
- **Tag 58 (Country Code)**: Must be `"ID"`.
- **Tag 59 (Merchant Name)** & **Tag 60 (Merchant City)**: Preserved.
- **Tag 62 (Additional Data Field Template)**:
  - Original sub-tags preserved so strict banking gateways validate merchant terminal identifiers.
- **Tag 63 (CRC-16/CCITT-FALSE Checksum)**:
  - Polynomial: `0x1021`, Initial: `0xFFFF`, Final XOR: `0x0000`, Non-reflected.
  - Calculated over all bytes including `"6304"`, producing 4 uppercase hexadecimal characters.

---

## 2. Indonesian Personal Data Protection Law (UU No. 27 Tahun 2022 / UU PDP)
- **Data Minimization**: Collect only what is strictly necessary for Pre-Order fulfillment (Customer Name, WhatsApp Number, Fulfillment Choice, Delivery Address / Order Notes).
- **Purpose Limitation**: Customer data must only be used to process baking batches and communicate order confirmation.
- **Storage Security**:
  - Customer records stored in `.xlsx`, `.csv`, and `.json` must reside in `backend/storage/` (excluded from version control).
  - Production receipts must not be publicly browsable without authorization.
