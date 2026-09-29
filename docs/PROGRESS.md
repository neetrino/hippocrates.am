# Delivery Plan — Hippocrates.am Minimum MVP

> **PLAN, not implementation status.** Date 2026-09-29. 23 user-selected functions. No feature should be marked implemented solely from these documents; only repository checks and recorded tests count as evidence.

**Verified implementation:** UNKNOWN — repository has not been audited for this revision.  
**Product scope approval:** PENDING.  
**Status terms:** `NOT_VERIFIED`, `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `VERIFIED`, `DEFERRED`.

## Minimum delivery slices

| Slice | Deliverable | MVP IDs | Current state | Definition of verified completion |
| --- | --- | --- | --- | --- |
| S0 | Repo audit and signed 23-feature scope, decisions, security/release prerequisites | all | IN_PROGRESS | Local product choices and stack are recorded. Production host, backups, and deploy owner are still open, so S0 is not verified |
| S1 | Identity, roles, clinic/doctor basic records and independent verification | 08–12,23 | NOT_VERIFIED | Wrong-role and revoked-membership denial tests; platform approval flows |
| S2 | Public pages, approved clinic/doctor profiles and service/price publication | 01–07 | NOT_VERIFIED | Hidden draft providers stay private; responsive public journey passes |
| S3 | Doctor schedule and authoritative free-slot listing | 13–14 | NOT_VERIFIED | Doctor unavailability and existing bookings reflected in server slots |
| S4 | Patient booking, clinic confirmation/cancellation, own patient/doctor/clinic lists | 15–19 | NOT_VERIFIED | Cross-role tests, simultaneous overlapping booking race tests, cancel slot release |
| S5 | Basic booking notifications and review eligibility with native clinic ratings | 20–22 | NOT_VERIFIED | Delivery-safe notifications; only completed visit reviewed once; rating sort tests |
| S6 | Minimal platform admin finishing, staging walkthrough, backups/security and release sign-off | 23 + all | NOT_VERIFIED | Role-by-role end-to-end acceptance, production-readiness and recovery evidence |

**Number ranges refer to `MVP-XX` IDs in `BRIEF.md`.** Slices can be subdivided without changing release scope. `MVP-23` has both early verification tooling in S1 and final overview in S6.

## Owner decisions blocking dependent coding

- [x] Product owner formally signs off the 23-function BRIEF and deferred-feature list. Accepted in chat, 2026-09-29. Name not recorded.
- [x] Confirm one location per clinic and one active clinic affiliation per doctor for this release. Accepted 2026-09-29.
- [x] Confirm signup/login. Accepted 2026-09-29: email and password, 12-hour server session, login 10/minute/IP, register 5/10 minutes/IP, no email password reset.
- [x] Confirm clinic-manual confirmation and cancellation. Accepted 2026-09-29: `REQUESTED` occupies the slot, the clinic confirms, no cutoff, no auto-expiry.
- [x] Completion and reviews. Accepted 2026-09-29: one review per completed appointment, hidden review still consumes it, no public name or email.
- [x] Rating sort. Accepted 2026-09-29: average, then count, then name. Unrated clinics last.
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
- [ ] Only genuine completed clinic visits permit a native review; duplicate or cross-patient review attempts fail.
- [ ] Approved rating sort and unrated display are verified against known fixture data.
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
