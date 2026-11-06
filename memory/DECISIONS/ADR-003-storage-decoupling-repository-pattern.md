# ADR-003: Storage Decoupling via Repository Pattern (`IOrderRepository`)

## Status
Accepted

## Context
Phase 1 uses local flat files (`orders.xlsx`, `orders.csv`, `orders_ledger.json`). In Phase 3, the application will migrate to SQLite or PostgreSQL for multi-user admin dashboards and customer order tracking. Directly calling file operations inside Express route controllers would cause immense technical debt during migration.

## Decision
All persistence calls from route controllers are strictly decoupled behind the `IOrderRepository` interface. The `storageService.ts` implements this interface for flat files in Phase 1. When Phase 3 arrives, a `DatabaseOrderRepository` can be substituted with a 1-line dependency swap in the application container.

## Consequences
- **Positive**: Clean separation of concerns; zero controller refactoring needed during Phase 3 database cutover.
- **Negative**: Requires maintaining interface contracts and domain model mappings.
