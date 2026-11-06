# Active Context & Working State

## Current Focus
- **Milestone**: Phase 1 (MVP) — Milestone 1 Initialization & Scaffold
- **Status**: Git repository initialized, complete folder scaffold established, AI Governance and Memory architecture established, pushing initial commit to GitHub (`oldmanboy/dizz-baked-goods-webapp`).

## Recent Key Decisions & Events
- Initialized monorepo with `frontend/` (React 19 + Vite) and `backend/` (Express + TypeScript + Zod).
- Established `ai-governance/` with formal AI Constitution, Security Policy, Agent Roles, Compliance Standards, and Change Control.
- Established `memory/` with ADRs, system patterns, product knowledge, and roadmap tracker.
- Synced strategic documents `implementation_plan.md` and `future_roadmap.md` into `docs/`.

## Immediate Next Steps (Milestone 1 & 2 Execution)
1. Complete core backend implementations:
   - `backend/src/services/qrisService.ts`: EMVCo TLV parsing, Tag 01 mutation, Tag 54 injection, CRC-16 calculation.
   - `backend/src/services/storageService.ts`: Mutex-locked ExcelJS multi-sheet workbook + append-only CSV backup fulfilling `IOrderRepository`.
   - `backend/src/services/uniqueCodeService.ts`: Scoped 2-digit unique code allocation with 30-min TTL.
   - `backend/src/services/receiptService.ts`: Binary magic-byte inspection + Sharp WebP transcoding.
2. Build unit tests in `backend/tests/` verifying QRIS mutation and spreadsheet formula injection sanitization.
3. Scaffold storefront and checkout UI in `frontend/src/`.
