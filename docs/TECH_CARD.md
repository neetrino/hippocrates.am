# Hippocrates.am — Technical card

> **Local stack accepted.** Production host and region are not chosen. The product is the full specification in [`BRIEF.md`](./BRIEF.md), delivered point by point (`ADR-003`). No application has been created yet.

| Topic | Decision | State |
| --- | --- | --- |
| Product boundary | Full product, points P0–P11 in `PROGRESS.md`. No reduced first release | Accepted 2026-09-30 |
| Repository | `apps/web` and `apps/api`. No `packages/*` until real reuse | Accepted. Folders are not created yet |
| Web | Next.js App Router. One UI for public, patient, doctor, clinic, and platform areas | Accepted |
| Styling | Tailwind CSS 4.x via `@tailwindcss/postcss` (Next.js default) | Accepted |
| Backend | NestJS modular-monolith REST API | Accepted |
| Language | TypeScript strict, Node.js 24 | Accepted for local development |
| Persistence | One PostgreSQL 17 database | Accepted for local development |
| ORM | Prisma. The first migration is identity, written when P1 starts | Accepted for local development |
| Login/session | Email and password. Argon2id. 12-hour absolute server session. Login 10/minute/IP. Register 5/10 minutes/IP | Accepted. Security review required before production |
| Booking | Request occupies the slot. Confirm, cancel, reschedule, and attendance follow point P4 | Accepted |
| Doctor account | One login may affiliate with more than one clinic. The doctor sets the password | Accepted 2026-09-30 |
| Branches | In the product on point P2 | Accepted 2026-09-30 |
| Reviews | In the product on point P8, after a verified visit | Accepted 2026-09-30 |
| Clinic operations | Dashboard, patient list, operational card, and price totals on point P5 | Accepted |
| Notifications | In-app on the booking point. Email and reminders on point P5 | Accepted 2026-09-30 |
| Redis, BullMQ, WebSocket | Not installed on P0. Add only when a later point needs them | Accepted |
| Payments and clinical systems | Later points P9 and P10. Not built early | Accepted |
| Storage | Verification evidence stays private and is not auto-deleted. File vendor still open | Accepted as a rule |
| Hosting | Local web, local API, local PostgreSQL in Docker Compose | Accepted for development. Production vendor and region open |
| Environment | One root `.env` for web and API. No per-app env file | Accepted 2026-09-30 |
| Interface language | Armenian default, plus Russian and English | Accepted 2026-09-30 |
| Background worker | Added when point P5 needs reliable email delivery | Conditional |

## Scope-led design constraints

- Public web pages are rendered from allowlisted **published-only** projections; protect private account/clinic data from shared caches and metadata.
- Backend, not UI hiding, enforces roles, current clinic membership, doctor assignment, patient ownership and platform-verifier restrictions.
- In PostgreSQL, double booking is blocked by transaction-time validation plus an enforceable concurrency strategy; optimistic UI availability is never sufficient.
- `COMPLETED` records attendance. A review is a separate point P8 action. A clinical note is point P10.
- Do not install an extra service before the point that needs it.
- Use one deployable API and database initially; scale only from measured need, with separate approved change.

## Project configuration to confirm before development

- [ ] Confirm actual repo layout and installed stack; reuse compatible existing choices.
- [ ] Name an approver and approve `BRIEF.md` + all material booking/verification/ranking decisions.
- [ ] Pin Node, Next, React, Nest, Prisma and PostgreSQL versions only after verified compatibility.
- [ ] Approve locale(s), authentication UX, session expiry/revocation, password/account recovery if relevant.
- [ ] Approve public clinic/doctor profile fields and evidence-checking policy.
- [ ] Choose the email provider when point P5 starts.
- [ ] Approve media/verification-document handling, hosting region and retention.
- [ ] Assign migration owner, backup/restore owner, incident contacts and production deploy approval.

## Security and operational release gates

- Separate development, staging and production credentials/data; dev/staging use synthetic test patients.
- HTTPS, safe cookies/CSRF/Origin as applicable, input validation, login and booking rate limits, least-privileged DB credentials and secret storage.
- Audit clinic/doctor approval, membership changes, and booking transitions. Redact patient contact data from technical logs.
- CI: reproducible install, format/lint, strict typecheck, automated tests and build; reviewed versioned migrations only.
- Before real patient onboarding: cross-clinic authorization tests, a test that one clinic cannot read another clinic's patients, concurrent booking tests, cancellation tests, staging walkthrough, and a demonstrated backup restore.

**Authority:** functional details `BRIEF.md`; architecture `01-ARCHITECTURE.md`; specific technology choices `02-TECH_STACK.md`; progress `PROGRESS.md`; approvals `DECISIONS.md`.
