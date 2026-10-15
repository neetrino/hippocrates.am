# Delivery plan — Hippocrates.am

> Revised 2026-10-14. Full product, one point at a time. This file tracks **what is in the repository**, not the September start plan.

**In the repository:** workspace, four roles, public catalog, booking, portals, in-app notices, questions, reviews, password reset, clinic/doctor verification, and appointment event history.  
**Not started / paused:** chat, card payments, clinical records, production release.  
**Scope:** `ADR-003`; doctor-clinic binding `ADR-005`. **Env:** one root `.env`. Web `3000`, NestJS `4000`.

**Status terms**

| Term | Meaning |
| --- | --- |
| `VERIFIED` | Routes and data exist in this repo; the point's "Done when" check has been run |
| `IN_PROGRESS` | Work started; the point is not complete against BRIEF |
| `PAUSED` | Approved later work. Do not add tables or routes until the owner puts it back in queue |
| `BLOCKED` | Waiting on a named decision or owner |
| `NOT_STARTED` | Approved, not begun |

Do not add empty modules for a later point. Prefer `NOW_VS_NEEDED_HY.md` for the remaining FR gaps. If this file and the code disagree, the code and an explicit approved task win.

## Numbered points

| # | Point | In the repository now | State | Remaining on this point |
| --- | --- | --- | --- | --- |
| 0 | Foundation | pnpm workspace, Next.js 3000, NestJS 4000, Prisma migrations, `GET /health` | VERIFIED | Production host still unnamed |
| 1 | Registration | Four roles. Patient self-registers. Super Admin creates clinic + Admin. Admin creates doctors. Forgot/reset password | VERIFIED | Email ownership verification and MFA are later hardening |
| 2 | Clinic profile | Clinic edit, cover, hours, staff, services. No `Branch` table | VERIFIED | Multi-branch product still later |
| 3 | Public catalog | Home, clinic and doctor lists and pages, name/specialty search, locales | VERIFIED | City and other BRIEF filters |
| 4 | Booking | Slots, request, confirm, cancel, reschedule, complete, no-show, expiry, overlap exclusion, `AppointmentEvent` | VERIFIED | Hold, check-in, cancel cutoff |
| 5 | Portals | Patient, doctor, clinic desk, in-app notices, patient card, price totals, favorites, settings | VERIFIED | Visit email delivery (Resend is only on password reset) |
| 6 | Chat | — | PAUSED | No chat routes |
| 7 | Questions | Public ask/list, doctor answers, Super Admin page, author hidden on public DTO | VERIFIED | Searchable archive and stronger moderation |
| 8 | Reviews | After `COMPLETED` only. Clinic reply. Public clinic page shows them | VERIFIED | Dispute path |
| 9 | Finance | Price totals only | PAUSED | Card payments need a separate approval |
| 10 | Clinical | — | PAUSED | Needs its own acceptance spec |
| 11 | Release | — | PAUSED | Host, backup owner, and deploy owner are unnamed |

## What point 0 contains

1. Root pnpm workspace.
2. `apps/web` — Next.js, port 3000, loads the root `.env`.
3. `apps/api` — NestJS, `API_PORT` 4000, loads the same `.env`.
4. Prisma — versioned migrations under `apps/api/prisma/migrations`.
5. `GET /health` on the API.
6. Format, lint, typecheck, test, and build scripts.

Point 1 is the four roles in `ADR-004`. Chat, payments, clinical tables, and production deploy stay paused.

## Still blocking release only

- [ ] Name the production host, region, backup owner, and deploy owner.

## Discipline

For each point: implement the smallest complete slice, run positive and negative tests, then update this file from evidence. Do not mark a point verified from documentation alone. Do not rewrite `docs/archive/` to match the code; that folder is historical.
