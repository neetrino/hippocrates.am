# Hippocrates.am — Minimum MVP Technical Card

> **Local stack accepted 2026-09-29.** Production host and region are not chosen. Applies to the 23 features in [`BRIEF.md`](./BRIEF.md). Version: Minimum-MVP 0.3. No application has been created yet.

| Topic | Small-release proposal | Decision state |
| --- | --- | --- |
| Product boundary | Exactly 23 minimum functions, no chat/Q&A/advanced clinic suite | Accepted 2026-09-29 |
| Repository | Size B. `apps/web` and `apps/api`. No `packages/*` until real reuse | Accepted 2026-09-29. Target layout only. The folders are not created yet |
| Web | Next.js 16.3 App Router. One UI for public, patient, doctor, clinic, and platform areas | Accepted 2026-09-29 |
| Backend | NestJS 12 modular-monolith REST API | Accepted 2026-09-29 |
| Language | TypeScript 5.9 strict, Node.js 24 | Accepted for local development, 2026-09-29 |
| Persistence | One PostgreSQL 17 database | Accepted for local development, 2026-09-29 |
| ORM | Prisma 7. The first schema is identity, written when implementation starts | Accepted for local development, 2026-09-29 |
| Login/session | Email and password. Argon2id. 12-hour absolute server session. Login 10/minute/IP. Register 5/10 minutes/IP | Accepted 2026-09-29. Security review required before production |
| Booking state | `REQUESTED` occupies the slot; clinic sets `CONFIRMED`; patient or clinic may cancel `REQUESTED` or `CONFIRMED` with no cutoff and no auto-expiry | Accepted 2026-09-29 |
| Doctor account | One login, one clinic. A second clinic needs a second account | Accepted 2026-09-30 |
| Clinic location | One operational location per clinic | Accepted 2026-09-29 |
| Reviews and ratings | Removed. Clinic lists use name order | Accepted 2026-09-30 |
| Clinic operations | Dashboard, patient list, operational client card, totals from appointment prices. No EHR and no payment collection | Accepted 2026-09-30 |
| Notifications | In-app booking request, confirmation, and cancellation only. No email in this release | Accepted 2026-09-29 |
| Redis, BullMQ, WebSocket, dedicated search | **Not a default minimum-MVP dependency** | Deferred |
| Payments, chat, Q&A, clinical/CT systems | Payment collection, chat, Q&A, and clinical systems stay out. Booking-price totals are in | Deferred, except `MVP-27` |
| Storage | Public profile images only when a store is approved. Verification evidence stays private and is not auto-deleted | Accepted as a rule, 2026-09-29. File vendor still open |
| Hosting | Local web, local API, local PostgreSQL in Docker Compose | Accepted for development, 2026-09-29. Production vendor and region open |
| Interface language | Armenian only | Accepted 2026-09-29 |
| Background worker | Only if an approved outbound channel requires reliable asynchronous delivery | Conditional |

## Scope-led design constraints

- Public web pages are rendered from allowlisted **published-only** projections; protect private account/clinic data from shared caches and metadata.
- Backend, not UI hiding, enforces roles, current clinic membership, doctor assignment, patient ownership and platform-verifier restrictions.
- In PostgreSQL, double booking is blocked by transaction-time validation plus an enforceable concurrency strategy; optimistic UI availability is never sufficient.
- `COMPLETED` records attendance. It does not create a review or a clinical history.
- No extra distributed service, event bus or separate application is installed solely to anticipate deferred functions.
- Use one deployable API and database initially; scale only from measured need, with separate approved change.

## Project configuration to confirm before development

- [ ] Confirm actual repo layout and installed stack; reuse compatible existing choices.
- [ ] Name an approver and approve `BRIEF.md` + all material booking/verification/ranking decisions.
- [ ] Pin Node, Next, React, Nest, Prisma and PostgreSQL versions only after verified compatibility.
- [ ] Approve locale(s), authentication UX, session expiry/revocation, password/account recovery if relevant.
- [ ] Approve public clinic/doctor profile fields and evidence-checking policy.
- [ ] Approve notification delivery channel and provider or explicitly choose in-app only.
- [ ] Approve media/verification-document handling, hosting region and retention.
- [ ] Assign migration owner, backup/restore owner, incident contacts and production deploy approval.

## Security and operational release gates

- Separate development, staging and production credentials/data; dev/staging use synthetic test patients.
- HTTPS, safe cookies/CSRF/Origin as applicable, input validation, login and booking rate limits, least-privileged DB credentials and secret storage.
- Audit clinic/doctor approval, membership changes, and booking transitions. Redact patient contact data from technical logs.
- CI: reproducible install, format/lint, strict typecheck, automated tests and build; reviewed versioned migrations only.
- Before real patient onboarding: cross-clinic authorization tests, a test that one doctor account cannot open a second clinic, concurrent booking tests, cancellation tests, staging walkthrough, and a demonstrated backup restore.

**Authority:** functional details `BRIEF.md`; architecture `01-ARCHITECTURE.md`; specific technology choices `02-TECH_STACK.md`; progress `PROGRESS.md`; approvals `DECISIONS.md`.
