# Decision Register — Hippocrates.am Minimum MVP

> **Status:** PARTIAL OWNER CONFIRMATION, 2026-09-29. Accepted rows below are explicit chat choices. Unlisted rows stay open. No person name was supplied. The old 46-feature V1 pack remains historical reference.

| ID | Decision / clarification | Current minimum-MVP position | Status |
| --- | --- | --- | --- |
| HM-001 | Narrow release to user-selected 23 functions | This pack contains only the provided minimum list; prior chat/Q&A/rescheduling/advanced operations deferred | **ACCEPTED 2026-09-29** |
| HM-002 | Initial applications | Size B. `apps/web` Next.js 16, `apps/api` NestJS 12, PostgreSQL 17, Prisma 7. No `packages/*` layer until real reuse exists | **ACCEPTED 2026-09-29** for local development. Production database vendor is not chosen |
| HM-003 | Doctor association | One active clinic per doctor. No multi-clinic scheduling UI in this release | **ACCEPTED 2026-09-29** |
| HM-004 | Clinic locations | One operational location per clinic, no branch management UI | **ACCEPTED 2026-09-29** |
| HM-005 | Booking confirmation | Patient creates slot-occupying `REQUESTED`; an authorized clinic user moves it to `CONFIRMED` | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-006 | Booking cancellation | No time cutoff and no automatic expiry. Patient or clinic may cancel `REQUESTED` or `CONFIRMED`. Cancellation releases the slot in the same transaction. `COMPLETED` is not cancelled on this path | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-007 | Completion and review | Clinic admin marks a real `CONFIRMED` visit `COMPLETED`. That patient may publish one clinic review for that appointment. A hidden review still uses up that one review. Public text shows no name and no email | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-008 | Public ranking | Rated clinics first: average descending, then review count descending, then name ascending. Unrated clinics after them, by name. Show one decimal and the count. Never invent a rating | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-009 | Notifications | In-app notices only for booking request, confirmation, and cancellation. No email provider and no reminder campaign in this release | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-010 | Authentication | Email and password, argon2id, revocable server session, HttpOnly Secure SameSite=Lax cookie. Absolute session lifetime is 12 hours. Login is limited to 10 requests per minute per IP. Registration is limited to 5 requests per 10 minutes per IP. No email password reset. Admin cannot read or set a password | **ACCEPTED 2026-09-29.** Owner delegated the numbers. Production still needs a security review |
| HM-011 | Provider verification | Clinic approval and doctor approval are independent. Evidence is private to platform admins, has no public URL, and is not deleted automatically | **ACCEPTED 2026-09-29.** Owner delegated the choice. Legal retention period is not invented |
| HM-012 | Infrastructure | Local only: Node.js 24, pnpm 10, the versions in HM-002, PostgreSQL via Docker Compose. Production host, region, backups, and deploy owner are not chosen | **LOCAL ACCEPTED 2026-09-29.** Production remains open |
| HM-013 | Launch language | Armenian (`hy`) is the only interface language in this release | **ACCEPTED 2026-09-29.** Owner delegated the choice |
| HM-014 | Deferred features | No private chat, public Q&A, reschedule, reminder campaign, payment, EHR/CT or advanced branch management | **ACCEPTED 2026-09-29** with HM-001 |

## Historical decision handling

The earlier expanded-V1 draft `DECISIONS.md` contained chat/Q&A/realtime/outbox options and broad multi-clinic rules. **Do not delete existing accepted ADRs or history in a live repository.** On migration, append an accepted scope-change ADR and mark conflicting drafts as superseded for *Minimum MVP*, retaining historical version control. If an original item was already approved/implemented, the agent must report the conflict and request an explicit de-scope/data-migration decision; this pack alone is not permission to delete code or data.

## Proposed acceptance procedure

1. Product owner reviews the 23-function `BRIEF.md` and `SCOPE_CHANGE.md` and approves minimum-MVP scope, signing name/date.
2. Resolve HM-003 to HM-011 before dependent implementation. Record selected alternatives and dates, avoiding implicit agreement.
3. Audit repo to establish actual implementation and technical constraints before TECH_CARD/stack sign-off.
4. Add `architecture/adrs/ADR-001-MINIMUM-MVP-SCOPE.md` as **Accepted** only after explicit approval; otherwise it remains Proposed.
5. Each future scope change updates BRIEF first, its relevant API/DB/architecture contracts next, and PROGRESS last after verification.

**Approver:** Product owner, this chat session. Legal name not recorded.  
**Approval date:** 2026-09-29. The owner delegated the remaining product choices on this date.  
**Scope status:** Local development choices are accepted, including booking, login, reviews, Armenian UI, and the pinned local stack. Production host, region, backup owner, and deploy owner stay open. No production deploy is authorized.
