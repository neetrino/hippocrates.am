# Repository layout — Hippocrates.am

> **TARGET TREE ONLY; NOT A CLAIM ABOUT THE ACTUAL REPOSITORY.** Revised 2026-09-30. Preserve `.agents/` and `.cursor/`. Add a feature folder when its point in `PROGRESS.md` starts.

```text
hippocrates.am/
├── apps/                             # Only if approved vs current repo
│   ├── web/
│   │   └── src/
│   │       ├── app/                  # public, patient, doctor, clinic, admin routes
│   │       ├── features/             # discovery, booking, patients, dashboard
│   │       └── shared/               # API client, safe UI primitives
│   └── api/
│       └── src/
│           ├── modules/
│           │   ├── identity/
│           │   ├── clinics/
│           │   ├── doctors/
│           │   ├── catalog/
│           │   ├── scheduling/
│           │   ├── appointments/
│           │   ├── marketplace/
│           │   ├── clinic-operations/
│           │   ├── notifications/
│           │   └── platform-admin/
│           └── infrastructure/       # db, security, logging adapters
├── docs/
│   ├── BRIEF.md
│   ├── TECH_CARD.md
│   ├── 01-ARCHITECTURE.md
│   ├── 02-TECH_STACK.md
│   ├── 03-STRUCTURE.md
│   ├── 04-API.md
│   ├── 05-DATABASE.md
│   ├── DECISIONS.md
│   ├── PROGRESS.md
│   ├── FUNCTIONALITY_HY.md
│   ├── SCOPE_CHANGE.md
│   └── architecture/adrs/
├── .agents/                          # keep existing project governance
├── .cursor/                          # keep existing Cursor rules
├── .env                              # local only, gitignored; the single file for web and API
└── .env.example                      # names only, no secrets
```

The layout is a **minimal proposal**. No standalone worker/package is obligatory. Add a `worker` directory only if an approved external notification channel needs reliable async delivery; add shared packages only for genuine reuse.

## UI areas

- Public: homepage, published clinic and doctor lists, search, provider pages, and prices. Rating sort arrives on point P8.
- Patient: registration/login, own appointments, permitted cancellation, and booking notifications.
- Doctor: permitted profile/schedule view and own appointments.
- Clinic: own public information, doctor/offering/price management, schedules and booking processing.
- Platform: independent clinic/doctor approvals and minimal aggregate oversight.

## Module import rules

- Web consumes reviewed HTTP/DTO contracts, not Prisma-generated database models or private API repositories.
- API modules own their writes. Other modules consume narrow application contracts/read DTOs; no private-table cross-writes.
- Marketplace reads published projections only. Clinic operations read that clinic's patients and prices only.
- Scheduling reads occupancy through appointments' approved contract; appointment writes must transactionally validate/record actual capacity.
- Shared infrastructure utilities must not become an authorization-bypassing business service.

## Excluded directories / source cleanup

Create `branches`, `messaging`, `public-qa`, `reviews`, `finance`, and `clinical` when their points start. Do not add those folders during P0. Do not delete existing product files without an explicit owner request.

## Verification procedure

Before implementation, inventory actual paths/dependencies, identify mismatches with this proposed tree, propose the smallest safe change, and record accepted actual structure after implementation. Documentation is not evidence that a module or deployment exists.
