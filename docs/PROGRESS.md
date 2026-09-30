# Delivery plan — Hippocrates.am

> **Ready to start.** Revised 2026-09-30. Full product, one point at a time. Nothing below is implemented until code and tests exist.

**Verified implementation:** foundation, registration roles, public pages, booking, in-app notices, questions, and reviews are in the repository. Chat, payments, clinical records, and release are not started. Health `GET /health` and `GET /api/v1/public/home` were called against the configured database on 2026-09-30.  
**Scope:** `ADR-003`. **Env:** one root `.env`. Web `3000`, NestJS `4000`.  
**Status terms:** `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `PAUSED`, `VERIFIED`.

Do the points in order. Do not add empty modules for a later point.

## Numbered points

| # | Point | Approximate contents | State | Done when |
| --- | --- | --- | --- | --- |
| 0 | Foundation | pnpm workspace, web 3000, NestJS 4000, one root `.env`, Prisma, health, checks | IN_REPO | `GET /health` returned ok |
| 1 | Registration | Four roles. Super Admin creates clinic and Admin. Admin creates doctors. Patient self-registers | IN_REPO | Unit test denies another clinic |
| 2 | Clinic profile | Branches and clinic update | IN_REPO | Admin-only routes |
| 3 | Public catalog | Home, clinic and doctor pages, name and specialty search | IN_REPO | Public home returned an empty published list |
| 4 | Booking | Windows, free slots, request, confirm, cancel, reschedule, attendance, overlap constraint | IN_REPO | Slot unit test passed. Database exclusion constraint is in the migration |
| 5 | Portals | Patient page, clinic desk, in-app notices, patient card, price totals | IN_REPO | Email reminders wait for a mail provider |
| 6 | Chat | Paused | PAUSED | No chat routes |
| 7 | Questions | Public questions without the author, doctor answers, Super Admin publish | IN_REPO | Public DTO has no author id |
| 8 | Reviews | Review only after a completed visit. Lists stay ordered by name | IN_REPO | Review route checks `COMPLETED` |
| 9 | Finance | Card payments | PAUSED | Not built. Needs a separate approval |
| 10 | Clinical | Charts and imaging | PAUSED | Not built. Needs its own acceptance spec |
| 11 | Release | Backup restore and launch | PAUSED | Host, backup owner, and deploy owner are still unnamed |

## What point 0 contains

1. Root pnpm workspace.
2. `apps/web` — Next.js, port 3000, loads the root `.env`.
3. `apps/api` — NestJS, `API_PORT` 4000, loads the same `.env`.
4. Docker Compose — local PostgreSQL only, matching `DATABASE_URL`.
5. Prisma — connection and an empty first migration.
6. `GET /health` on the API.
7. Format, lint, typecheck, test, and build scripts.

Point 1 is registration and the four roles in `ADR-004`. Public pages start at point 3. Booking starts at point 4. Chat is paused.

## Still blocking release only

- [ ] Name the production host, region, backup owner, and deploy owner.

## Discipline

For each point: implement the smallest complete slice, run positive and negative tests, then update this file from evidence. Do not mark a point verified from documentation alone.
