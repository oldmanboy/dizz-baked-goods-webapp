# Persistent AI Memory Architecture — Dizz Baked Goods

This directory serves as the **shared, persistent cognitive memory** for AI agents and human engineers across conversation sessions, refactors, and project milestones.

## Memory Structure

```text
memory/
├── README.md                 # Guide to the AI memory system
├── ACTIVE_CONTEXT.md         # Current sprint focus, active work, and immediate priorities
├── SYSTEM_PATTERNS.md        # Architecture conventions, naming standards, and key patterns
├── PRODUCT_KNOWLEDGE.md      # Domain knowledge (bakery operations, PO batching, QRIS quirks)
├── ROADMAP_PROGRESS.md       # Status tracker for Phases 1–6 and Android Phases M1–M3
└── DECISIONS/                # Architectural Decision Records (ADRs)
    ├── ADR-001-static-to-dynamic-qris.md
    ├── ADR-002-dual-storage-exceljs-csv.md
    ├── ADR-003-storage-decoupling-repository-pattern.md
    └── ADR-004-react-vite-capacitor-foundation.md
```

## How Agents Use Memory
1. **On Session Start**: Read `ACTIVE_CONTEXT.md` and `SYSTEM_PATTERNS.md` to load the current operational state and design constraints.
2. **On Architectural Changes**: Create an ADR in `memory/DECISIONS/` before implementing major pattern or structural shifts.
3. **On Task Completion**: Update `ACTIVE_CONTEXT.md` and `ROADMAP_PROGRESS.md` so subsequent agents or turns maintain continuous, unbroken context.
