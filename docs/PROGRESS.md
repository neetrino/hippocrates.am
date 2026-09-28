# V1 Delivery Progress: Hippocrates.am

> Planning checklist, **not a claim that any feature has been built**. Only mark items complete after checking the current repository, recorded tests and actual environment. Scope is limited to the approved product owner's V1; clinical/diagnostic extensions are not included.

**Version:** 1.0-draft  
**Target:** Version 1 / MVP  
**Date:** 2026-09-28  
**Status:** PLANNING  
**Measured overall completion:** NOT VERIFIED. Do not manufacture percentages.

## Status meanings

`NOT_STARTED` = not confirmed in repository; `IN_PROGRESS` = implementation observed; `BLOCKED` = unmet approved prerequisite; `VERIFIED` = tests/evidence available; `DEFERRED` = approved later phase. Documentation creation and implementation completion are different things.

## Delivery roadmap (suggested vertical slices)

| Slice | Scope | State | Evidence required |
| --- | --- | --- | --- |
| S0 — Discovery & approval | Approve BRIEF, TECH_CARD, V1 boundaries, initial schema and deployment policy; inspect repo | NOT_VERIFIED | Owner sign-off, recorded open decisions, repository audit |
| S1 — Identity & tenancy | Accounts/sessions, patient/doctor identity, clinic membership and permission checks | NOT_STARTED | Session revoke and cross-tenant denial tests |
| S2 — Clinic/doctor/catalog | Organization/doctor verification, branches, specialties, public profiles, service offerings | NOT_STARTED | Different self-reported vs verified fields, approved public projections |
| S3 — Scheduling & booking | Affiliation schedules, exceptions, resources, holds, appointments and history | NOT_STARTED | PostgreSQL concurrency/cross-clinic conflict tests |
| S4 — Discovery & portals | Search/filter, public SEO, clinic profiles, patient/doctor/clinic workspaces | NOT_STARTED | Safe projections and critical cross-role E2E |
| S5 — Private messaging | Profile-initiated text chats, participant policy, retention/abuse reports | NOT_STARTED | No-booking chat test, no admin/other-patient chat leakage |
| S6 — Public anonymous Q&A | Submission, moderation, verified doctor answers, safe searchable archive | NOT_STARTED | Identity-redaction tests across API, HTML, metadata and logs |
| S7 — Reviews & notifications | Completed-visit native review checks, replies, booking and communication notifications | NOT_STARTED | Review proof, idempotent reminders, privacy-safe messages |
| S8 — Platform admin & quality | Restricted verification/moderation, safe dashboards, accessibility/i18n, security and recovery | NOT_STARTED | Role matrix + restore rehearsal + monitoring and CI |
| S9 — Release readiness | Staging end-to-end, stress and security testing, approved release with rollback | NOT_STARTED | Signed acceptance criteria, owners, backup/restore evidence |

## Phase 0: mandatory approval checklist

- [ ] Inspect repository implementation and actual existing technology; do **not** infer implementation from `.env.example` or template README.
- [ ] Review `BRIEF_V1_DRAFT.md` against the source Hippocrates Overview v2.0 and approve an authoritative `BRIEF.md`.
- [ ] Decide online deposit/payment conflict, launch languages, authentication method, scheduling state policy, review verification and public ranking rules.
- [ ] Review and approve `TECH_CARD.md` and architecture; only then pin compatible package versions.
- [ ] Validate organization/patient/private Q&A data privacy strategy and regional hosting suitability.
- [ ] Define who approves production changes and migrations; require staging + restore rehearsal.

## Definition of done for every implementation slice

1. Approved product acceptance criteria and API/DB contracts for the slice.
2. No cross-module private-table shortcuts or new future-clinical scope.
3. Positive, negative, authorization and privacy tests appropriate to the slice.
4. Critical concurrency or retries tested against real test services where applicable.
5. All affected existing checks pass (format, lint, types, tests, build); failures are reported, not hidden.
6. Approved documentation updated (`03-STRUCTURE`, API, database, DECISIONS, TECH_CARD where appropriate).
7. Owner review recorded. Do not equate code generation with acceptance or production readiness.

## Essential end-to-end acceptance journeys

- [ ] Public visitor finds a published doctor, views published prices and bookable time without receiving any private data.
- [ ] One patient books at Clinic A and Clinic B under one identity; Clinic A cannot view Clinic B's private appointment details.
- [ ] Same doctor at both clinics: simultaneous booking confirmations for overlapping times produce only one successful reservation.
- [ ] A removed receptionist immediately loses further Clinic A access while separately permitted Clinic B access remains intact.
- [ ] Patient starts private text chat with a doctor from the public profile **without a booking**; other patients and moderators cannot routinely read it.
- [ ] Patient submits a public question; responding verified doctors and anonymous readers cannot determine author's identity via returned data, search, SEO or errors.
- [ ] Authenticated verified doctor answers an approved question; author receives minimal private notification.
- [ ] Completed appointment grants review eligibility according to approved policy; canceled/no-show appointments do not automatically qualify.
- [ ] Email/SMS provider outage cannot roll back confirmed appointment; duplicates are bounded/reconciled.
- [ ] Backup recovery, release rollback and incident contacts are verified before handling real bookings.

## Blockers / open choices

| Decision | Why it matters | Owner/status |
| --- | --- | --- |
| Approved BRIEF and TECH_CARD | Prevents building unapproved scope/providers | Product owner / PENDING |
| Exact authentication and account recovery | Security architecture and notification contract | Product owner + security / PENDING |
| Booking state machine and cancellation cutoffs | API transitions, reservations, reminder timing | Product owner / PENDING |
| Provider and storage region, retention | Privacy/legal contracts and restore process | Product owner + legal/security / PENDING |
| Deposit/payment contradiction | Affects booking and finance boundary | Product owner / PENDING |
| Launch languages and exact UI design | Routing, content, accessibility and acceptance | Product owner / PENDING |

## Change log and evidence

| Date | Change | Evidence |
| --- | --- | --- |
| 2026-09-28 | Created V1 **planning** document from source product scope and drafted architecture/stack. | Documentation creation only; no implementation verification. |

**Cursor operating rule:** Report to the owner in understandable Armenian or Russian and present concrete choice options; technical documents may remain in English. During a read-only repository audit do not change or cancel real data, production resources or access rights. Do not mark delivery progress as complete without actual checks.
