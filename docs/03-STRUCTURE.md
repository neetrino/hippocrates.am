# Repository Structure: Hippocrates.am

> Version 1 simple modular-monolith layout. The paths below describe a **proposed application tree**, not a claim that applications or modules already exist. Read the real repository before creating, replacing, or moving files.

**Target:** Version 1 / MVP  
**Version:** 1.0-draft  
**Date:** 2026-09-28  
**Status:** PROPOSED; reconcile with approved `TECH_CARD.md`, actual repository and `ARCHITECTURE_TEMPLATE.md`.

---

## Current repository observation

At the time of drafting, the connected `neetrino/hippocrates.am` default branch was primarily a Cursor/Agent onboarding template. Its `docs/BRIEF.md` still contained unfilled placeholders, and `docs/TECH_CARD.md` was not present. No completed application layout can be inferred from template README or `.env.example`. Treat the tree below as **target design** only.

## Proposed minimal V1 tree

```text
hippocrates.am/
├── apps/                          # Create when V1 implementation is approved
│   ├── web/                      # One Next.js app: all six UI surfaces
│   │   ├── src/app/              # Route and rendering boundaries
│   │   ├── src/features/         # Feature-specific UI/client code
│   │   └── src/shared/           # Accessible components and API client
│   ├── api/                      # One NestJS modular-monolith process
│   │   └── src/
│   │       ├── modules/          # Named domain owners (see table below)
│   │       └── infrastructure/   # DB/auth/logger/storage adapters
│   └── worker/                   # Create only for approved durable reminders
├── packages/                     # Create packages only for demonstrated sharing
│   ├── contracts/                # Runtime-validatable cross-app contracts
│   └── database/                 # Optional centralized migration/ORM home
├── docs/
│   ├── BRIEF.md                  # Product-owner-approved V1 scope once populated
│   ├── TECH_CARD.md              # Approval source for stack and deployment
│   ├── ARCHITECTURE_TEMPLATE.md  # V1 architectural boundaries (unless renamed)
│   ├── 02-TECH_STACK.md
│   ├── 03-STRUCTURE.md
│   ├── 04-API.md
│   ├── 05-DATABASE.md
│   ├── DECISIONS.md
│   ├── PROGRESS.md
│   ├── architecture/             # Actual accepted ADRs, as needed
│   └── reference/templates/     # Reusable templates, NOT accepted decisions
├── .agents/                      # Existing agent governance; preserve it
├── .cursor/rules/                # Existing persistent Cursor rules; preserve them
└── .env.example                  # Placeholder keys only; no real secrets
```

Only use a `packages/database/` directory if the approved ORM/migration strategy actually needs it; otherwise keep DB configuration within the API. A worker does not need its own deployment until a durable reminder workflow is approved.

## API module ownership boundaries

| Module / concern | Owns | May consume from |
| --- | --- | --- |
| `identity` | Accounts, credentials (if selected), sessions, account recovery | None; publishes approved identity interface |
| `organizations` | Clinics, branches, organization memberships and organizational verification cases | Identity profile IDs |
| `practitioners` | Doctor profiles, specialties, credentials and affiliations | Organizations' published branch/membership lookup |
| `patients` | Patient profile and permitted cross-clinic identity links | Identity |
| `catalog` | Canonical services and branch-specific service offerings | Organizations, practitioner eligibility |
| `scheduling` | Doctor availability, exceptions, resource catalog, holds and reservations | Practitioners, catalog and organizations |
| `appointments` | Booking/attendance state and appointment event history | Scheduling, patients, catalog |
| `marketplace` | Public clinic/doctor/service projections, discovery filters, basic content pages | Published data from organizations/catalog/practitioners and approved reviews |
| `messaging` | Private text conversations, participants, messages and access checks | Identity, approved practitioner IDs; no appointment prerequisite |
| `public-qa` | Public questions, **separate private author mapping**, answers, publication policy | Identity (restricted author link), verified practitioners |
| `reviews` | Native reviews, eligibility check, replies and reports | Completed-visit proof via appointments' public contract |
| `notifications` | Consent/settings, minimal notification intents and delivery history | Approved domain events and internal author notification tokens |
| `moderation` | Public content review and limited platform actions | Marketplace, Q&A and reviews public/moderation contracts |
| `reporting` | Basic read-only authorized aggregate dashboards | Approved reporting interfaces; no private-table shortcuts |

These are **logical owners**. Physical folders may be grouped for V1 simplicity if the same public-contract and data-ownership rules are enforced by tests and review. Do not create an omnipotent `management` module.

## UI routing boundaries (illustrative, not contractual URLs)

- Public routes: home, clinic/doctor directories and profiles, services, approved Q&A archive, informational pages.
- Patient area: own profile, bookings/history, private messages, own public question status, eligible reviews and notification preferences.
- Doctor area: own cross-clinic affiliations, authorized schedules/appointments, private messages, public answers and personal metrics.
- Clinic operations: branch/team/service offering/calendar/booking management and authorized aggregates.
- Platform operations: clinic/doctor verification, public moderation and platform-level safe aggregates.

Enforce access in NestJS and owning modules even when Next.js layouts hide UI elements. Public SEO must never contain Q&A author links, private chats, unpublished verification evidence or clinic-private operational records.

## Import and dependency rules

1. Web may depend on approved API contracts, not Prisma internals or API module persistence.
2. Every API module exposes a narrow public application interface. Cross-module writes through private repositories/tables are forbidden.
3. Shared packages contain genuinely shared contracts only; avoid generic dumping grounds.
4. No clinical/CT/PACS/inventory/advanced finance modules in V1 unless a new scope decision is accepted.
5. Keep `.agents/` and `.cursor/` governance separate from product documentation and implementation.

## Implementation and repository migration rule

Inspect files, list actual commands and document discrepancies before any folder move. A structure refactor requires approved need, explicit migration plan, tests and rollback. Update this file to reflect **actual paths after implementation**; never mark proposed folders as present solely because they appear above.
