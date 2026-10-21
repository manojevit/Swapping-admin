# EVCHARGEX Console

Operations & admin dashboard (frontend) for the EVCHARGEX battery-swapping network —
the operator-facing companion to the EVCHARGEX rider app. Built so the team can wire a
real backend into it with minimal UI changes.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — design tokens carried over from the rider app (brand blue `#1E63F0`, Inter, status colours, 16px radius) so both products share one identity
- **Recharts** for charts, **lucide-react** for icons
- Mock data layer today; shapes match a future API 1:1

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + typecheck
```

## Roles

The console ships with two roles (matching the approved design's permission matrix):

| Role | Scope | Notes |
|------|-------|-------|
| **Administrator** | All organisations | Full access, including the Admin section (Organisations, Plans, Console logins) |
| **Fleet operator** | Own organisation only | Day-to-day ops; Admin section hidden; data scoped to their org |

A **"Preview as"** switch in the top bar flips between roles for demos. In production this
is replaced by the real signed-in session — see `src/lib/session.tsx`.

> A read-only **Viewer** role is intentionally deferred. The permission system is structured
> so it can be added later with minimal work.

## Project structure

```
src/
  app/
    (console)/            # authenticated shell: sidebar + topbar
      overview/           # ✅ built — the hero dashboard
      map, stations, …    # 🔜 placeholders, build order below
    layout.tsx            # root: fonts + SessionProvider
  components/
    layout/               # sidebar, topbar, role switcher, page header
    ui/                   # Card, Button, StatusPill, BayBar  (reusable primitives)
    dashboard/            # KpiCard, Donut, charts, tables
  lib/
    types.ts              # domain types (shared vocabulary with the app)
    mock.ts               # mock data — swap for a real API later
    nav.ts                # sidebar nav + per-role gating
    session.tsx           # role/permission context
    utils.ts
```

## Build order

- [x] **Phase 0** — shell, role system, design tokens, mock layer, shared primitives
- [x] **Phase 1** — Overview
- [ ] **Phase 2** — Stations, Batteries, Riders, Vehicles, Swap Report, Alerts (list screens)
- [ ] **Phase 3** — Station detail (bays/BMS) + Station controls
- [ ] **Phase 4** — Analytics, Revenue, Network Map
- [ ] **Phase 5** — Admin (Organisations, Plans, Console logins) + Login page + add/edit modals + detail drill-downs

## Wiring a real API

Replace the exports in `src/lib/mock.ts` with calls to your backend, keeping the return
shapes in `src/lib/types.ts`. No component changes needed.
