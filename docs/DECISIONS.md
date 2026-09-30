# Decision Register — Hippocrates.am Minimum MVP

> **Status:** LOCAL SCOPE ACCEPTED, revised 2026-09-30. Rows below are the current rules. `ADR-002` wins where an older row still mentions reviews or a shared doctor account. No person name was supplied. Production host remains open.

| ID | Decision / clarification | Current minimum-MVP position | Status |
| --- | --- | --- | --- |
| HM-001 | Release boundary | Started as the 23-function list. As of 2026-09-30, `MVP-21` and `MVP-22` are removed and `MVP-24`–`MVP-27` are added. Chat, Q&A, and rescheduling stay out | **ACCEPTED, revised 2026-09-30** |
| HM-002 | Initial applications | Size B. `apps/web` Next.js 16, `apps/api` NestJS 12, PostgreSQL 17, Prisma 7. No `packages/*` layer until real reuse exists | **ACCEPTED 2026-09-29** for local development. Production database vendor is not chosen |
| HM-003 | Doctor account | One email is one account. It may be a patient at many clinics. A doctor role on that account belongs to exactly one clinic. A second clinic needs a second email. The doctor sets the password. Admins cannot read or set it. Slot overlap is enforced per doctor account, not across two accounts of one person | **ACCEPTED 2026-09-30** |
| HM-004 | Clinic locations | One operational location per clinic, no branch management UI | **ACCEPTED 2026-09-29** |
| HM-005 | Booking confirmation | Patient creates slot-occupying `REQUESTED`; an authorized clinic user moves it to `CONFIRMED` | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-006 | Booking cancellation | No time cutoff and no automatic expiry. Patient or clinic may cancel `REQUESTED` or `CONFIRMED`. Cancellation releases the slot in the same transaction. `COMPLETED` is not cancelled on this path | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-007 | Visit completion | Clinic admin may mark a real `CONFIRMED` visit `COMPLETED`. That status is attendance only. It does not create a review | **ACCEPTED 2026-09-30.** Review half superseded |
| HM-008 | Public clinic order | Clinics are listed by name. Rating sort is removed | **ACCEPTED 2026-09-30.** Supersedes the 2026-09-29 rating sort |
| HM-009 | Notifications | In-app notices only for booking request, confirmation, and cancellation. No email provider and no reminder campaign in this release | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-010 | Authentication | Email and password, argon2id, revocable server session, HttpOnly Secure SameSite=Lax cookie. Absolute session lifetime is 12 hours. Login is limited to 10 requests per minute per IP. Registration is limited to 5 requests per 10 minutes per IP. No email password reset. Admin cannot read or set a password | **ACCEPTED 2026-09-29.** Owner delegated the numbers. Production still needs a security review |
| HM-011 | Provider verification | Clinic approval and doctor approval are independent. Evidence is private to platform admins, has no public URL, and is not deleted automatically | **ACCEPTED 2026-09-29.** Owner delegated the choice. Legal retention period is not invented |
| HM-012 | Infrastructure | Local only: Node.js 24, pnpm 10, the versions in HM-002, PostgreSQL via Docker Compose. Production host, region, backups, and deploy owner are not chosen | **LOCAL ACCEPTED 2026-09-29.** Production remains open |
| HM-013 | Launch language | Armenian (`hy`) is the only interface language in this release | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-014 | Deferred features | No private chat, public Q&A, reschedule, reminder campaign, payment collection, EHR/CT, reviews, ratings, or one doctor account at many clinics | **ACCEPTED 2026-09-30** |
| HM-015 | Clinic operations added | Dashboard, clinic patient list, and operational client card. Money totals use fixed price snapshots only, split into `REQUESTED`, `CONFIRMED`, and `COMPLETED`. `CANCELLED` adds nothing. Estimates are excluded from the money total. No medical notes and no payment collection | **ACCEPTED 2026-09-30** |

## Historical decision handling

The earlier expanded-V1 draft `DECISIONS.md` contained chat/Q&A/realtime/outbox options and broad multi-clinic rules. **Do not delete existing accepted ADRs or history in a live repository.** On migration, append an accepted scope-change ADR and mark conflicting drafts as superseded for *Minimum MVP*, retaining historical version control. If an original item was already approved/implemented, the agent must report the conflict and request an explicit de-scope/data-migration decision; this pack alone is not permission to delete code or data.

## How to read older rows

`ADR-002` supersedes review, rating, and shared-doctor wording in ADR-001. Each later scope change updates `BRIEF.md` first, then API and database, then `PROGRESS.md` after the code is actually verified. There is no application code yet.

**Approver:** Product owner, this chat session. Legal name not recorded.  
**Approval date:** 2026-09-29, revised 2026-09-30.  
**Scope status:** Revised 2026-09-30. One doctor account per clinic. Reviews and ratings are out. Dashboards, patient list, client card, and booking-price totals are in. Booking, notifications, home, and doctor pages stay. Production host, region, backup owner, and deploy owner stay open. No production deploy is authorized. See `ADR-002`.
