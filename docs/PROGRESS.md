# Delivery plan — Hippocrates.am

> **Ready to start.** Revised 2026-09-30. Full product, one point at a time. Nothing below is implemented until code and tests exist.

**Verified implementation:** none.  
**Scope:** `ADR-003`. **Env:** one root `.env`. Web `3000`, NestJS `4000`.  
**Status terms:** `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `PAUSED`, `VERIFIED`.

Do the points in order. Do not add empty modules for a later point.

## Numbered points

| # | Point | Approximate contents | State | Done when |
| --- | --- | --- | --- | --- |
| 0 | Foundation | pnpm workspace, `apps/web` on 3000, `apps/api` on 4000, both read the root `.env`, Docker PostgreSQL, Prisma, health, lint, typecheck, test, build | NOT_STARTED | Both apps boot and the empty database migrates |
| 1 | Registration | Roles `SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`. Super Admin creates the clinic and its Admin. Admin creates that clinic's Doctors. Patient self-registers | NOT_STARTED | An Admin cannot create a doctor for another clinic |
| 2 | Clinic profile | Branches, clinic data, and publication after the Admin account exists | NOT_STARTED | An unpublished clinic stays off the public pages |
| 3 | Public catalog | Doctor profiles, services and prices, Armenian-first pages, filters | NOT_STARTED | Another clinic's patients are not visible |
| 4 | Booking | Schedules, resources, free slots, hold, confirm, cancel, reschedule, attendance | NOT_STARTED | Two concurrent requests cannot take the same slot |
| 5 | Portals | Patient, doctor, and clinic screens, email reminders, operational patient card, price totals | NOT_STARTED | A failed notice does not change the appointment |
| 6 | Chat | Paused. Not in the current work | PAUSED | Do not build until the owner puts it back |
| 7 | Questions | Anonymous public questions, moderation, searchable archive | NOT_STARTED | The author is absent from public responses |
| 8 | Reviews | Review after a verified visit, reply, dispute, ranking only with an approved formula | NOT_STARTED | A review without a verified visit is rejected |
| 9 | Finance | Invoices and card payments | NOT_STARTED | Starts only after a separate approval. No card capture before that |
| 10 | Clinical | Charts, notes, imaging | NOT_STARTED | Starts only with its own acceptance spec |
| 11 | Release | Backup restore, role-by-role walkthrough | NOT_STARTED | Blocked until host, backup owner, and deploy owner are named |

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
