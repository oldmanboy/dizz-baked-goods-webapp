# ADR-001: Static-to-Dynamic QRIS with 2-Digit Verification Code

## Status
Accepted

## Context
Payment gateways in Indonesia (Midtrans, Xendit, Doku) charge 0.7% MDR fees, recurring monthly API fees, and require formal corporate registration, which represents unnecessary overhead for an early-stage artisan bakery with batch Pre-Orders. However, a purely static QRIS requires customers to manually type amounts into banking apps, which frequently leads to typos and impossible payment reconciliation.

## Decision
We implement a zero-fee server-side Static-to-Dynamic QRIS transformation engine:
1. Parse the merchant's static QRIS string using the EMVCo TLV specification.
2. Mutate Point of Initiation (Tag 01) from Static (`11`) to Dynamic (`12`).
3. Inject the exact payable Rupiah amount into Tag 54.
4. Recalculate the Tag 63 CRC-16/CCITT-FALSE checksum.
5. Allocate a unique 2-digit verification code (`+01` to `+99`) per subtotal group with a 30-minute expiration window.

## Consequences
- **Positive**: 0% payment gateway fees, amount auto-locked in customer mobile banking apps, deterministic matching of incoming bank mutations.
- **Negative**: Requires customer to upload receipt screenshot for Phase 1 verification (automated listener introduced in Phase 5 / Phase M2).
