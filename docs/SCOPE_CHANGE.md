# Scope Change — Expanded V1 to 23-Function Minimum MVP

> Prepared 2026-09-29. This is a **proposed new delivery baseline**, not authorization to delete existing code or retroactively rewrite any approved ADR. It is derived from the user's `Hippocrates_Minimum_MVP_Functions_HY.pdf`.

## What stays in Minimum MVP

Public home, published clinics/doctors and their individual pages; simple name/specialty search; published clinic services/prices; patient login; scoped roles; clinic/doctor verification; essential clinic/doctor/service management; doctor working schedule and genuine availability; online appointment requests with confirmation/cancellation and role-specific appointment lists; booking notifications; post-visit native clinic reviews and basic clinic-rating sort; restricted platform admin.

These correspond **exactly** to `MVP-01` ... `MVP-23` in `BRIEF.md` and `FUNCTIONALITY_MINIMUM_HY.md`.

## What is intentionally deferred from the original 46-function list

| Previously expanded capability | Minimum-MVP treatment |
| --- | --- |
| Advanced combined filters and ranking models | Only basic name/specialty search plus owner-approved native clinic-rating ordering |
| Separate branch directory and multi-branch operations | One location per clinic (working assumption; approve first) |
| Doctor affiliated with multiple clinics simultaneously | One active affiliation per doctor (working assumption; approve first) |
| Advanced staff invitations and branch permission administration | Basic required clinic-admin/doctor/patient/platform roles only |
| Room/equipment booking resource management | Out; protect doctor schedule against overlaps |
| Appointment reschedule and extended check-in/no-show progression | Out; request/confirmation/cancellation plus completion for verified review |
| Private patient/doctor chats and doctor chat management | Out |
| Anonymous public question creation/moderation, doctor answers and searchable Q&A archive | Out |
| Detailed review replies, complaints/appeals and doctor rating features | Out of product scope; minimal legally necessary content safety still applies |
| Appointment reminder campaign and extra channels | Booking-event notices only; no timed reminders |
| Rich public CMS / advanced clinic metrics | Only basic home/static informational copy and platform admin minimal counts |
| Automated external review aggregation | Out |
| Payments/deposits, clinical/EHR/CT/PACS, diagnostic-center operations | Out |

## Why small technical supporting mechanisms remain

A small number of non-public implementation safeguards are necessary for these 23 functions: current membership validation; one-clinic scope checks; booking-state event history; transaction-safe appointment occupancy; clinic-visit completion as a prerequisite to post-visit reviews; private verification evidence handling where required; minimal audit/backup/restore. **These safeguards must not be presented as additional product modules or new patient-facing functionality.**

## Explicit product decisions to confirm

1. Single location per clinic and single active doctor affiliation are simplifications, **not verbatim words in the user's PDF**. If either is wrong, re-plan schedule, schema and admin before development.
2. Clinic manually confirms booking requests is a working interpretation of 'confirmation and cancellation'; no automatic timeout/cutoff is imposed without approval.
3. The minimum review target is the **clinic**, because only clinic-rating ordering is requested. If doctor reviews are intended, add explicit scope and update ranking/DB/API.
4. Initial basic booking notifications are in-app unless email is expressly approved; real communications rules require legal/privacy review.
5. Technical stack remains a proposal; audit the actual repository and existing approved choices before acceptance.

## Agent migration instruction

1. Read the user's 23-item function list and this scope delta; do not treat old expanded V1 features as current to-dos.
2. Audit actual repository, previous approved product decisions and any already-built expanded features.
3. Present concrete contradictions and destructive migration impact to product owner; **do not delete data, files or production resources**.
4. After approvals, update existing authoritative docs with this pack's agreed scope. Preserve historical change records.
5. Mark progress only from verified code, tests and owner acceptance; proposed documents are not implementation evidence.
