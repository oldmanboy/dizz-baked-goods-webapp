# AI Governance — Change Control & Verification Protocols

This protocol establishes the quality gates and verification procedures required before code can be accepted into the repository.

---

## 1. Automated Verification Gates

Every pull request, feature implementation, or commit must satisfy:

1. **TypeScript Compilation**:
   - `npm run build --workspace=backend` passes with zero type errors.
   - `npm run build --workspace=frontend` passes with zero type errors.

2. **Unit Test Suite**:
   - `npm test` runs all Vitest test suites.
   - 100% pass rate on QRIS EMVCo test vectors and Tag 54 mutation.
   - 100% pass rate on spreadsheet formula-injection sanitization tests.

3. **Security Invariants Checklist**:
   - [ ] No hardcoded passwords, production API keys, or real merchant QRIS strings in committed code.
   - [ ] No raw user input written directly to `.xlsx` or `.csv` without `sanitizeForSpreadsheet()`.
   - [ ] No image uploads stored without magic-byte verification and `sharp` re-encoding.
   - [ ] `backend/storage/` content remains strictly excluded in `.gitignore`.

---

## 2. Architectural Change Protocol

If a proposed change alters:
- Database or storage schema
- API routes or payload contracts
- QRIS generation logic
- Authentication or authorization design

The agent must:
1. Document the rationale in a new Architectural Decision Record under `memory/DECISIONS/ADR-XXX.md`.
2. Update `memory/ACTIVE_CONTEXT.md` and `memory/SYSTEM_PATTERNS.md`.
3. Provide automated unit tests verifying backwards compatibility or explicit migration paths.

---

## 3. Rollback & Disaster Recovery
- Flat-file persistence uses atomic writes (`.tmp` write followed by atomic rename) to avoid half-written file corruption.
- If `orders.xlsx` is unreadable, `orders.csv` serves as the authoritative append-only audit trail to rebuild the workbook without data loss.
