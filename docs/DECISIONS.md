# Decision register — Hippocrates.am

> **Status:** FULL PRODUCT ACCEPTED, 2026-09-30. `ADR-003` wins where an older row shrinks the product to a reduced first release. No person name was supplied. Production host remains open. No application code exists.

| ID | Decision | Position | Status |
| --- | --- | --- | --- |
| HM-001 | Release boundary | 23-function reduced pack, later revised on 2026-09-30 | **SUPERSEDED by HM-016** |
| HM-002 | Applications | `apps/web` Next.js, `apps/api` NestJS, PostgreSQL, Prisma. No `packages/*` until real reuse | **ACCEPTED** for local development |
| HM-003 | Doctor account | One email is one account. The doctor sets the password. Admins cannot read or set it. The same account may work at more than one clinic | **ACCEPTED, revised by HM-016.** The one-clinic limit is withdrawn |
| HM-004 | Clinic locations | One location only | **SUPERSEDED by HM-016.** Branches are in the product, on point P2 |
| HM-005 | Booking confirmation | Patient request, clinic confirmation | **ACCEPTED as the base.** Holds, reschedule, and no-show arrive on point P4 with the canonical specification |
| HM-006 | Cancellation | Patient or clinic may cancel. Cancellation releases the slot in the same transaction | **ACCEPTED** |
| HM-007 | Visit completion | Attendance is recorded. A verified visit can later receive a review on point P8 | **ACCEPTED, review ban withdrawn by HM-016** |
| HM-008 | Public order | Name order only, no ratings | **SUPERSEDED by HM-016.** Ratings return on point P8 after an approved formula |
| HM-009 | Notifications | In-app only | **SUPERSEDED by HM-016.** Email and reminders are point P5. SMS waits for a provider and consent |
| HM-010 | Authentication | Email and password, Argon2id, revocable server session, HttpOnly Secure SameSite=Lax cookie, 12-hour absolute lifetime, login 10/minute/IP, registration 5/10 minutes/IP | **ACCEPTED.** Production still needs a security review |
| HM-011 | Verification | Clinic approval and doctor approval are independent. Evidence is private and is not auto-deleted | **ACCEPTED.** Legal retention period is not invented |
| HM-012 | Infrastructure | Local Node.js, pnpm, Docker Compose PostgreSQL | **ACCEPTED** for development. Production host remains open |
| HM-013 | Languages | Armenian only | **SUPERSEDED by HM-016.** Armenian is the default. Russian and English are in the product |
| HM-014 | Deferred features | Chat, Q&A, reviews, reschedule, payments, and clinical systems removed | **SUPERSEDED by HM-016** |
| HM-015 | Clinic operations | Dashboard, patient list, operational card, price totals | **ACCEPTED** as part of point P5. They do not replace the rest of the product |
| HM-016 | Full product | Build the canonical specification point by point. No reduced first release. Finance and clinical work are later points of the same product | **ACCEPTED 2026-09-30.** Chat timing revised by HM-017 |
| HM-017 | Roles and registration | Four roles: `SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`. Super Admin registers the clinic and its owner Admin. That Admin registers doctors for their clinic only. A Patient self-registers and can book any clinic from the home page. Chat is not in the current work | **ACCEPTED 2026-09-30.** See ADR-004 |

## How to read older rows

`ADR-004` is the current registration and role authority. `ADR-003` remains the product map except where HM-017 pauses chat.

**Approver:** Product owner, this chat session. Legal name not recorded.  
**Approval date:** 2026-09-30.  
**Scope status:** Full product. Production host, region, backup owner, and deploy owner stay open. No production deploy is authorized.
