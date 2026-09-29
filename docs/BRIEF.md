# Hippocrates.am — Minimum MVP Product Brief

> **Scope authority:** The user's 23-item Armenian minimum-functionality file, `Hippocrates_Minimum_MVP_Functions_HY.pdf`. This document intentionally **supersedes the earlier 46-function V1 draft only for the proposed minimum MVP**, not as an assertion that the original vision has been canceled.
>
> **Status:** LOCAL SCOPE ACCEPTED 2026-09-29. The owner delegated the remaining product choices. Production host and region are not chosen. **Version:** Minimum-MVP 0.3. **Implementation:** not started. These documents are the build contract.

## Product purpose

A narrowly scoped public platform for dental and oral/maxillofacial clinics. Visitors discover clinics and doctors, see published services/prices and ratings, and patients request an available appointment. Clinics maintain the essential public data and appointment workflow. The platform administrator verifies clinics/doctors and oversees only necessary operational records.

This is a **minimum release**, not a comprehensive healthcare operations suite, EHR, or the earlier expanded V1. All 23 entries below are required product capabilities. Security, audit and correctness safeguards are technical acceptance obligations, **not additional user-facing features**.

## Actors and surfaces

- **Visitor:** public home, clinic/doctor listings, simple search, profiles, public prices and ratings.
- **Patient:** register/sign in, choose an available appointment, see own appointments, request permitted cancellation, submit an eligible post-visit review.
- **Doctor:** public approved profile and own authorized schedule/appointment list.
- **Clinic administrator:** manage own clinic profile, doctor assignments, offerings/prices, schedules and appointment requests/confirmation/cancellation/completion.
- **Platform administrator:** verify clinic/doctor publication, see minimal platform oversight and handle necessary records with scoped permission.

There are three main presentation areas: public website, role-dependent signed-in portal, and basic platform admin. They may live in **one web application**. A separate receptionist account, multiple branches per clinic and doctors working at several clinics are **not minimum product requirements**.

## Exactly 23 required functions

The numbers below match the user's minimum list order. IDs (`MVP-01` ... `MVP-23`) must remain stable across the API, database, tests and `PROGRESS.md`.

| ID | Function (canonical Armenian name) | Minimum acceptance behavior |
| --- | --- | --- |
| MVP-01 | Գլխավոր էջ | Present the service and public entry points to clinics, doctors and appointments. |
| MVP-02 | Կլինիկաների հանրային ցանկ | List only published, approved clinics with concise contact/location details. |
| MVP-03 | Բժիշկների հանրային ցանկ | List only approved published doctors independently of clinic-directory navigation. |
| MVP-04 | Պարզ որոնում՝ ըստ անվանման և մասնագիտացման | Search published clinics/doctors by name and doctors by approved specialty; no advanced geo/price filtering. |
| MVP-05 | Կլինիկայի հանրային էջ | Show approved clinic details, address/contact, associated published doctors, offered services/prices and native ratings. |
| MVP-06 | Բժշկի հանրային պրոֆիլ | Show approved doctor identity, specialization, permitted professional information and associated clinic. |
| MVP-07 | Ծառայությունների և գների հրապարակում | Show a clinic's approved offerings and published prices; identify estimates where applicable. |
| MVP-08 | Պացիենտի գրանցում և մուտք | Patient sign-up, sign-in, sign-out and own basic account; specific authentication method awaits approval. |
| MVP-09 | Օգտատերերի դերեր և մուտքի իրավունքներ | Enforce distinct visitor/patient/doctor/clinic-admin/platform-admin access on every protected backend action. |
| MVP-10 | Կլինիկաների և բժիշկների հաստատում | Platform administrator can approve/reject and control public visibility of clinic and doctor records separately. |
| MVP-11 | Կլինիկայի տվյալների կառավարում | Clinic administrator edits their clinic's permitted public identity, location/contact and publication requests. |
| MVP-12 | Բժիշկների և ծառայությունների կառավարում | Clinic administrator links approved doctors, maintains service offerings and changes published prices. |
| MVP-13 | Բժիշկների աշխատանքային ժամանակացույց | Authorized doctor/clinic admin creates and edits doctor working slots and basic unavailable intervals. |
| MVP-14 | Ազատ ժամերի ցուցադրում | Display **server-calculated** available times respecting working schedule and existing active appointments. |
| MVP-15 | Առցանց այցի ամրագրում | Authenticated patient requests a specific available doctor/service/time; transactionally prevent conflicting bookings. |
| MVP-16 | Ամրագրման հաստատում և չեղարկում | Clinic confirms requests; patient/clinic cancels when permitted; update reservation and history correctly. |
| MVP-17 | Պացիենտի այցերի ցանկ | Patient can view only their upcoming/past appointment requests and statuses. |
| MVP-18 | Բժշկի այցերի ցանկ | Doctor views only appointments assigned to them and the minimum contact information needed. |
| MVP-19 | Կլինիկայի ամրագրումների կառավարում | Clinic admin views own appointment requests, confirms/cancels, and marks an attended appointment complete. |
| MVP-20 | Ամրագրումների մասին ծանուցումներ | Patient and relevant clinic/doctor receive appropriate basic booking-created/confirmed/canceled notifications. |
| MVP-21 | Այցից հետո կարծիքներ և գնահատականներ | Patient can review an eligible completed **platform-recorded** clinic visit once per eligible appointment. |
| MVP-22 | Կլինիկաների դասակարգում ըստ գնահատականի | Public clinic directory can order clinics by native clinic review rating; display review count and distinguish unrated clinics. |
| MVP-23 | Հարթակի հիմնական ադմինիստրատորի վահանակ | Authorized platform admin sees basic clinic/doctor approvals and minimal high-level counts, without unrestricted private patient access. |

### Minimum end-to-end journey

1. Platform admin approves a clinic and its doctors; clinic admin publishes services/prices and doctor schedules.
2. Visitor finds a clinic or doctor by name/specialty and sees published profile, offerings and genuinely available times.
3. Patient signs in, requests one available slot. Clinic confirms or cancels it according to approved policy, and the patient sees updated status and receives basic notification.
4. Clinic marks a genuinely completed appointment complete; its patient can submit one native clinic review. Clinic ratings appear in directory ordering.

## Product scope constraints

- **Clinics:** one operating location per clinic in the minimum MVP. Branch-management UI is deferred. The schema may later support branches, but do not present unapproved branch workflows now.
- **Doctor affiliation:** one active clinic per doctor in this release. Accepted 2026-09-29. Do not add cross-clinic scheduling in this release.
- **Booking:** `REQUESTED` occupies the slot. An authorized clinic user confirms it. `REQUESTED` or `CONFIRMED` can be cancelled by the patient or the clinic, with no time cutoff and no automatic expiry. Cancellation releases the slot in the same transaction. `COMPLETED` is a later clinic action for a visit that happened and is not cancelled on this path. Accepted 2026-09-29.
- **Completion:** a clinic admin marks a real `CONFIRMED` visit `COMPLETED`. That status means the person attended. It creates no medical note, diagnosis, or medical record. Accepted 2026-09-29.
- **Reviews:** one review per patient for one completed appointment at that clinic. A hidden review still uses that single chance. Public text shows no name and no email. Accepted 2026-09-29.
- **Ranking:** clinics with a visible review come first, ordered by average descending, then review count descending, then name ascending. Clinics with no visible review follow, ordered by name. The list shows the average to one decimal and the count. An empty clinic gets no invented score. Accepted 2026-09-29.
- **Notifications:** in-app notices only for booking request, confirmation, and cancellation. No email and no reminder campaign in this release. Accepted 2026-09-29. A failed notice does not change the appointment.
- **Login:** email and password. The session lasts 12 hours and then must be renewed by signing in again. Login is limited to 10 requests per minute per IP. Registration is limited to 5 requests per 10 minutes per IP. There is no email password reset. Accepted 2026-09-29.
- **Language:** the interface of this release is Armenian. Accepted 2026-09-29.
- **Admin:** clinic approval and doctor approval are separate. Verification files stay private to platform admins and are not deleted automatically. No wide access to private patient information. Accepted 2026-09-29.

## Explicitly deferred from the earlier 46-function V1

- Combined advanced filters, distance/geo ranking, complex statistical ranking beyond an approved basic clinic-rating sort.
- Multi-branch clinic operations; multiple concurrent clinic affiliations per doctor; extended employee invitations/roles; room/equipment resource calendars.
- Appointment rescheduling; elaborate attendance states, no-show workflows and advanced calendars; reminder schedules or additional message channels.
- Private patient–doctor text messaging and doctor chat management.
- Anonymous public questions, doctor public answers, Q&A moderation, archive and question tracking.
- Doctor review/reply workflows, public review reports/appeals beyond the minimum legally necessary moderation mechanisms; automatic third-party ratings import.
- Rich content CMS, advanced dashboards/analytics, payments/deposits, CT/CBCT/PACS, EHR, treatment plans, surgery management and native mobile apps.

**Do not keep disabled routes, tables or fake UI from deferred features in this minimum pack.** The previous expanded documents are historical scope references, not active minimum-MVP instructions.

## Minimum security and quality acceptance

- Only approved clinics and doctors are public; never return unpublished verification evidence in public responses.
- Patient A cannot read Patient B's appointments or reviews; Clinic A cannot access Clinic B's operational records.
- Removing a clinic member blocks subsequent access to that clinic's protected records.
- Two simultaneous requests for the same doctor/time cannot both create active bookings, including under retries.
- Cancellation releases capacity atomically; review eligibility exists only for legitimately completed appointments.
- Notifications cannot determine the correctness of an appointment transaction; failed delivery does not cancel a booking.
- No real patient data in development fixtures, logs, public cache/SEO or screenshots; security, accessibility, backup/restore and deployment checks must be demonstrated before launch.

## Open product approvals (do not guess)

1. Authentication/sign-up method and verification/recovery policy.
2. Confirm single-location and single-active-clinic assumptions or explicitly expand and replan.
3. Clinic confirmation workflow, booking time/cancellation cutoffs, and who is allowed to mark completed.
4. Exact clinic-ranking rule (rating only vs rating + minimum count; unrated placement, ties).
5. Published profile fields and clinic/doctor verification evidence/retention.
6. Launch language(s), UI content ownership and accessibility targets.
7. Booking-notification channel(s), content, opt-in requirements, failure policy.
8. Data hosting region, retention, backup/restore, security and applicable legal review.

**Approval procedure:** product owner reviews this scope; record signature/date in `DECISIONS.md`. Update implementation documents only with decisions actually approved. No statement here implies that the app has been built.
