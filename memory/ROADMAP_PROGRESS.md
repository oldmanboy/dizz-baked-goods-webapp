# Roadmap Progress & Phase Status

This matrix tracks progress across all phases defined in [`docs/implementation_plan.md`](../docs/implementation_plan.md) and [`docs/future_roadmap.md`](../docs/future_roadmap.md).

---

## Web & Backend Track

| Phase / Milestone | Status | Description |
| :--- | :--- | :--- |
| **Phase 1: Milestone 1** | 🟡 **IN PROGRESS** | Workspace scaffold, Git init, AI Governance, AI Memory, project config |
| **Phase 1: Milestone 2** | ⚪ Planned | Dynamic QRIS engine, unique code service, Mutex Excel/CSV storage |
| **Phase 1: Milestone 3** | ⚪ Planned | REST API endpoints (`/catalog`, `/orders`, `/confirm-payment`), Zod & rate limiters |
| **Phase 1: Milestone 4** | ⚪ Planned | Warm artisanal React 19 UI, cart drawer, QR payment view, receipt uploader |
| **Phase 1: Milestone 5** | ⚪ Planned | Unit testing suite, end-to-end checkout & file persistence verification |
| **Phase 2: Admin Portal** | ⚪ Post-MVP | Baker web dashboard, order approval queue, catalog management |
| **Phase 3: Database Cutover** | ⚪ Post-MVP | SQLite/PostgreSQL migration via `IOrderRepository` & 1-click Excel export |
| **Phase 4: Customer Accounts** | ⚪ Post-MVP | WhatsApp OTP / Google OAuth, guest order linking, order tracking |
| **Phase 5: Automated Webhooks** | ⚪ Post-MVP | Gateway webhooks (Midtrans/Xendit) or Zero-MDR mutation notification listener |
| **Phase 6: Kitchen Logistics** | ⚪ Post-MVP | Kitchen prep sheets, courier auto-booking, loyalty stamps |

---

## Android App Track (CapacitorJS)

| Phase | Status | Description |
| :--- | :--- | :--- |
| **Phase M1: Customer APK/AAB** | ⚪ Ready for wrap | Wrap `frontend/` with Capacitor, 1-tap gallery save, native photo picker |
| **Phase M2: Baker Companion** | ⚪ Post-MVP | Pocket order queue, Zero-MDR QRIS push listener, Bluetooth thermal print |
| **Phase M3: Play Store Release** | ⚪ Post-MVP | Google Play Console `.aab`, Play App Signing, Data Safety |
