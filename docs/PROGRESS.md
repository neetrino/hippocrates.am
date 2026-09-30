# Delivery Plan — Hippocrates.am Minimum MVP

> **PLAN, not implementation status.** Revised 2026-09-30. No feature should be marked implemented solely from these documents.

**Verified implementation:** none. The repository has no application.  
**Product scope approval:** local scope accepted 2026-09-30. Production host is still open.  
**Status terms:** `NOT_VERIFIED`, `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `VERIFIED`, `DEFERRED`.

## Minimum delivery slices

| Slice | Deliverable | MVP IDs | Current state | Definition of verified completion |
| --- | --- | --- | --- | --- |
| S0 | Repo audit and the current scope, decisions, and release prerequisites | all | IN_PROGRESS | Local product choices are recorded, including the 2026-09-30 revision. Production host, backups, and deploy owner are still open |
| S1 | Identity, roles, clinic/doctor basic records and independent verification | 08–12,23 | NOT_VERIFIED | Wrong-role and revoked-membership denial tests; platform approval flows |
| S2 | Public pages, approved clinic/doctor profiles and service/price publication | 01–07 | NOT_VERIFIED | Hidden draft providers stay private; responsive public journey passes |
| S3 | Doctor schedule and authoritative free-slot listing | 13–14 | NOT_VERIFIED | Doctor unavailability and existing bookings reflected in server slots |
| S4 | Patient booking, clinic confirmation/cancellation, own patient/doctor/clinic lists | 15–19 | NOT_VERIFIED | Cross-role tests, simultaneous overlapping booking race tests, cancel slot release |
| S5 | In-app booking notifications | 20 | NOT_VERIFIED | A failed notice does not change the appointment |
| S6 | Clinic dashboard, patient list, client card, and booking-price totals | 24–27 | NOT_VERIFIED | Clinic A cannot read Clinic B patients, cards, or totals. The card has no clinical note. Totals match fixture prices |
| S7 | Platform admin finishing, staging walkthrough, backups/security and release sign-off | 23 + all | NOT_VERIFIED | Role-by-role end-to-end acceptance, production-readiness and recovery evidence |

**Number ranges refer to `MVP-XX` IDs in `BRIEF.md`.** `MVP-21` and `MVP-22` are retired. `MVP-23` starts in S1 and is finished in S7.

## Owner decisions blocking dependent coding

- [x] Product owner signed the current scope. The 2026-09-29 23-function list was revised on 2026-09-30. Name not recorded.
- [x] One location per clinic. One doctor account per clinic. Accepted 2026-09-30. A shared doctor account across clinics is not allowed.
- [x] Confirm signup/login. Accepted 2026-09-29: email and password, 12-hour server session, login 10/minute/IP, register 5/10 minutes/IP, no email password reset.
- [x] Confirm clinic-manual confirmation and cancellation. Accepted 2026-09-29: `REQUESTED` occupies the slot, the clinic confirms, no cutoff, no auto-expiry.
- [x] Reviews and rating sort removed 2026-09-30. `COMPLETED` is attendance only.
- [x] Dashboard, patient list, client card, and booking-price totals added 2026-09-30. Payment collection stays out.
- [x] Notifications channel: in-app only. Accepted 2026-09-29.
- [x] Verification evidence stays private and is not auto-deleted. Interface language is Armenian. Accepted 2026-09-29.
- [ ] Name the production host, region, backup owner, and deploy owner. Local Docker PostgreSQL is accepted and is not a production decision.

## Core acceptance checks

- [ ] Public clinic list, independent doctor directory, name/specialty search and published pages never show unapproved records.
- [ ] Clinic admin can manage only own profile, doctor links, service/price and schedules.
- [ ] Doctor can view only own appointments; patient only own appointments; platform admin has restricted verification/overview access.
- [ ] Unavailable time is excluded and concurrent requests cannot create overlapping active appointments for one doctor.
- [ ] Authorized confirmation and cancellation update availability/history and display current status in patient, doctor and clinic portals.
- [ ] Booking notifications are delivered under chosen policy without determining appointment correctness.
- [ ] One doctor account cannot be attached to a second clinic.
- [ ] Clinic patient list, client card, and financial totals show only that clinic's records. Public pages show no rating.
- [ ] Staging E2E, negative authorization checks, database migration rehearsal, backup restore and monitoring reviewed before launch.

## Implementation discipline

For each slice: inspect current code → document gaps → approve affected choices → define API/DB/UX acceptance → implement smallest complete vertical slice → positive/negative tests → update affected docs → PR review. When old expanded-V1 code exists, **do not delete, disable or migrate it blindly**; propose safe plan and obtain explicit approval. No agent-originated production data mutation or deployment without explicit authority.

## S0 repository audit (2026-09-29)

Inspected the working tree. This repository is still the Cursor/agent template. No Hippocrates application has been initialized, so there is no expanded-V1 code to de-scope.

| Check | Result |
| --- | --- |
| `package.json`, lockfile, `apps/`, `src/`, `prisma/` | Absent |
| MVP-01 … MVP-23 in code | None |
| Application CI | Absent. `.github/` has Dependabot and issue templates only |
| Product docs | Present. Local scope and stack choices are accepted in `DECISIONS.md`. Production host is still open |
| Governance | `.agents/` and `.cursor/` kept |
| `.env.example` | Template placeholders for Upstash Redis, Resend and Cloudflare R2. Not an approved stack. Minimum MVP defers Redis; email and object storage stay conditional |

**Ready for a later implementation task.** Size B with `apps/web` and `apps/api` is accepted on paper. No application folders, pages, or API are in the repository. The next implementation task starts from these documents. Production host, backups, and the deploy owner are still unnamed, so this is not a release approval.

## Change log

| Date | Documentation change | Evidence |
| --- | --- | --- |
| 2026-09-29 | Drafted 23-function minimum-MVP replacement pack from user minimum-functionality file and prior reference documents | Documentation only; implementation not checked |
| 2026-09-29 | Recorded S0 repository audit. No application code. S0 blocked on owner approval | Working-tree inspection; no tests, because there is no app |
| 2026-09-29 | Recorded partial S0 approval: 23-function scope, Size B two-app layout, one location, one active doctor-clinic link | Owner selections in chat. Booking/notification choice was Other with no captured rule |
| 2026-09-29 | Owner delegated the booking choice. Accepted clinic confirmation, no cutoff, no auto-expiry, in-app notices only | Recorded in DECISIONS HM-005, HM-006, HM-009. No application code |
| 2026-09-29 | Owner delegated login. Accepted email/password and a revocable server session. No email password reset | Recorded in DECISIONS HM-010. No application code |
| 2026-09-29 | Owner delegated the remaining local choices: reviews, ranking, Armenian UI, private evidence, 12-hour session, auth rate limits, local PostgreSQL | Recorded in DECISIONS. Production host remains open |
| 2026-09-29 | Removed an unrequested application scaffold. The repository stays documentation-only | Owner asked for ready documents, not a website |
| 2026-09-30 | Owner removed reviews and ratings, required one doctor account per clinic, and added dashboard, patient list, client card, and booking-price totals | Recorded in ADR-002, BRIEF, and DECISIONS. No application code |
| 2026-09-30 | Reconciled stale 23-function, review, and “awaiting approval” statements with the accepted rules | Documentation only. No application code |
