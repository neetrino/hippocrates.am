# Repository Layout — Hippocrates.am Minimum MVP

> **TARGET TREE ONLY; NOT A CLAIM ABOUT THE ACTUAL REPOSITORY.** 2026-09-29. Preserve the existing repository's `.agents/` and `.cursor/` instructions. Inspect present code before introducing or moving folders.

```text
hippocrates.am/
├── apps/                             # Only if approved vs current repo
│   ├── web/
│   │   └── src/
│   │       ├── app/                  # public, patient, doctor, clinic, admin routes
│   │       ├── features/             # discovery, booking, reviews, etc.
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
│           │   ├── reviews/
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
│   ├── FUNCTIONALITY_MINIMUM_HY.md
│   ├── SCOPE_CHANGE.md
│   └── architecture/adrs/
├── .agents/                          # keep existing project governance
├── .cursor/                          # keep existing Cursor rules
└── .env.example                      # placeholders only
```

The layout is a **minimal proposal**. No standalone worker/package is obligatory. Add a `worker` directory only if an approved external notification channel needs reliable async delivery; add shared packages only for genuine reuse.

## UI areas

- Public: homepage, published clinic/doctor lists, simple name/specialty search, provider pages, offerings/prices and basic clinic rating sort.
- Patient: registration/login, own appointments, permitted cancellation, review eligibility/form and booking notifications.
- Doctor: permitted profile/schedule view and own appointments.
- Clinic: own public information, doctor/offering/price management, schedules and booking processing.
- Platform: independent clinic/doctor approvals and minimal aggregate oversight.

## Module import rules

- Web consumes reviewed HTTP/DTO contracts, not Prisma-generated database models or private API repositories.
- API modules own their writes. Other modules consume narrow application contracts/read DTOs; no private-table cross-writes.
- Marketplace reads published projections only; review aggregation must not expose reviewer/appointment PII.
- Scheduling reads occupancy through appointments' approved contract; appointment writes must transactionally validate/record actual capacity.
- Shared infrastructure utilities must not become an authorization-bypassing business service.

## Excluded directories / source cleanup

Do not create `messaging/`, `public-qa/`, `payments/`, `clinical/`, `imaging/`, `finance/`, `branches/` advanced workflows, realtime gateway or advanced reporting for minimum MVP. If such code **already exists**, do not delete it blindly: audit ownership/use, propose a guarded de-scoping plan and seek explicit approval before removal. Existing working features and data require safe migration/rollback rather than unilateral deletion.

## Verification procedure

Before implementation, inventory actual paths/dependencies, identify mismatches with this proposed tree, propose the smallest safe change, and record accepted actual structure after implementation. Documentation is not evidence that a module or deployment exists.
