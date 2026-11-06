# AI Governance Framework — Dizz Baked Goods

This directory establishes the formal **AI Governance System** for the Dizz Baked Goods web application. It sets immutable boundaries, ethical standards, security invariants, and operating protocols for any autonomous agent or AI-assisted developer working on this codebase.

## Governance Structure

```text
ai-governance/
├── README.md                 # Framework overview & operational principles
├── AI_CONSTITUTION.md        # Core immutable laws & non-negotiable architectural boundaries
├── SECURITY_POLICY.md        # Threat mitigation, sanitization standards & secret policies
├── AGENT_ROLES.md            # Personas & responsibilities for AI collaborators
├── COMPLIANCE_STANDARDS.md   # EMVCo QRIS, Bank Indonesia & UU PDP privacy compliance
└── CHANGE_CONTROL.md         # Verification criteria, testing gates & audit workflows
```

## Core Governance Pillars

1. **Safety & Zero-Trust Architecture**:
   Never trust client-side data for prices, totals, or QR payloads. The backend is the sole source of truth.

2. **Data Dignity & Privacy (UU PDP)**:
   Customer personal details (name, WhatsApp number, delivery addresses) and payment screenshots must be treated as confidential and never exposed in public repositories, raw logs, or insecure endpoints.

3. **Financial Integrity (EMVCo / Bank Indonesia)**:
   QRIS generation must adhere strictly to EMVCo Merchant-Presented Mode specifications, verifying checksums on startup and ensuring exact Tag 54 amount injection without rounding flaws.

4. **Code Quality & Traceability**:
   Every architectural decision must be logged in `memory/DECISIONS/` (ADRs), and code modifications must pass unit and integration verification before release.
