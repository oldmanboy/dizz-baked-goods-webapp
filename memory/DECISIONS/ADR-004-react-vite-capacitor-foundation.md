# ADR-004: Decoupled Vite SPA Architecture for Native Android (CapacitorJS) Packaging

## Status
Accepted

## Context
A major strategic requirement is delivering a parallel Android application (`.apk` / `.aab`) for Pre-Order bakery customers. Rewriting the app in Kotlin or React Native would double development and maintenance effort for an indie bakery.

## Decision
We structure the frontend as a pure **React 19 + Vite + TypeScript SPA** communicating with a decoupled backend REST API over HTTP/HTTPS:
1. `client.ts` strictly resolves endpoints using an explicit `VITE_API_BASE_URL` rather than assuming relative browser paths.
2. The platform helper `src/utils/platform.ts` abstracts file downloads and camera/photo uploads so they can swap between HTML5 DOM events and Capacitor native plugins (`@capacitor/camera`, `@capacitor/filesystem`).
3. Backend CORS allows `ALLOWED_ORIGINS` supporting `https://localhost` and `capacitor://localhost`.

## Consequences
- **Positive**: 95%+ code sharing between web storefront and native Android app; immediate compilation to APK via `@capacitor/android` in Phase M1.
- **Negative**: Requires handling cross-origin requests and safe-area insets early in design.
