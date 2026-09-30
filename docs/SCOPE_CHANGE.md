# Scope Change — Expanded V1 to 23-Function Minimum MVP

> Prepared 2026-09-29. This is a **proposed new delivery baseline**, not authorization to delete existing code or retroactively rewrite any approved ADR. It is derived from the user's `Hippocrates_Minimum_MVP_Functions_HY.pdf`.

## Revision 2026-09-30

The owner removed reviews and rating sort (`MVP-21`, `MVP-22`). A doctor account is bound to one clinic. Added dashboard, patient list, client card, and financial totals from appointment prices (`MVP-24` … `MVP-27`). Home, doctor pages, booking, and notifications were already in scope.

## What stays in Minimum MVP

Public home, published clinics and doctors and their pages, simple name/specialty search, published services and prices, patient login, scoped roles, clinic and doctor verification, clinic and doctor management, schedules and real availability, online booking with confirmation and cancellation, role-specific appointment lists, in-app booking notifications, clinic and doctor dashboards, a clinic patient list, an operational client card, booking-price totals, and restricted platform admin.

## What is intentionally deferred from the original 46-function list

| Previously expanded capability | Minimum-MVP treatment |
| --- | --- |
| Advanced combined filters and ranking models | Name and specialty search only. Clinic list is ordered by name. Rating sort is out |
| Separate branch directory and multi-branch operations | Out. One location per clinic. Accepted 2026-09-29 |
| Doctor affiliated with multiple clinics on one account | Out. One account, one clinic. A second clinic needs a second account. Accepted 2026-09-30 |
| Advanced staff invitations and branch permission administration | Basic required clinic-admin/doctor/patient/platform roles only |
| Room/equipment booking resource management | Out; protect doctor schedule against overlaps |
| Appointment reschedule and extended check-in/no-show progression | Out. Request, confirmation, cancellation, and attendance completion remain. Completion does not open a review |
| Private patient/doctor chats and doctor chat management | Out |
| Anonymous public question creation/moderation, doctor answers and searchable Q&A archive | Out |
| Reviews, ratings, replies, and rating sort | Out as of 2026-09-30, including the earlier minimum clinic-review feature |
| Appointment reminder campaign and extra channels | Booking-event notices only; no timed reminders |
| Rich public CMS / analytics warehouse | Out. The clinic dashboard and booking-price totals in `MVP-24` and `MVP-27` are the allowed summaries |
| Automated external review aggregation | Out |
| Payment collection, deposits, EHR/CT/PACS, diagnostic-center operations | Out. `MVP-27` only sums recorded appointment prices |

## Why small technical supporting mechanisms remain

Supporting safeguards stay technical, not extra products: one-clinic checks on every doctor account, booking history, transaction-safe occupancy, private verification evidence, and minimal audit. Visit completion is attendance only.

## Explicit product decisions to confirm

1. One location per clinic remains. One doctor account per clinic is now an explicit owner rule, 2026-09-30.
2. Clinic manually confirms booking requests. There is no automatic timeout.
3. Reviews and ratings are removed. Do not add them back without a new owner decision.
4. Booking notifications are in-app only. Accepted 2026-09-29. Email is not part of this release.
5. The local stack in `TECH_CARD.md` is accepted for a later build. Production host is not chosen. Do not start the application from this document alone.

## Agent migration instruction

1. Read `FUNCTIONALITY_MINIMUM_HY.md` and `ADR-002`. Do not treat the old 23-item PDF, reviews, or a shared doctor account as current work.
2. Audit actual repository, previous approved product decisions and any already-built expanded features.
3. Present concrete contradictions and destructive migration impact to product owner; **do not delete data, files or production resources**.
4. After approvals, update existing authoritative docs with this pack's agreed scope. Preserve historical change records.
5. Mark progress only from verified code, tests and owner acceptance; proposed documents are not implementation evidence.
