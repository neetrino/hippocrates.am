# Hippocrates.am — Minimum MVP Product Brief

> **Scope authority:** `FUNCTIONALITY_MINIMUM_HY.md` as revised on 2026-09-30. The earlier 23-item PDF is history. Where it still lists reviews or one shared doctor account, this brief and `ADR-002` win.
>
> **Status:** LOCAL SCOPE ACCEPTED, revised 2026-09-30. Reviews and ratings are removed. A doctor account belongs to one clinic. Dashboards, patient list, client card, and booking-based financial totals are in scope. Production host and region are not chosen. **Version:** Minimum-MVP 0.4. **Implementation:** not started. These documents are the build contract.

## Product purpose

A narrowly scoped public platform for dental and oral/maxillofacial clinics. Visitors discover clinics and doctors, see published services and prices, and patients request an available appointment. Clinics maintain bookings, their own patients, and operational totals. The platform administrator verifies clinics and doctors.

This is a **minimum release**, not an EHR and not a payment system. The functions below are the required product capabilities. Security, audit, and correctness safeguards are technical obligations, not extra user-facing features.

## Actors and surfaces

- **Visitor:** public home, clinic and doctor listings, simple search, profiles, and public prices.
- **Patient:** register and sign in, choose an available appointment, see own appointments, and cancel when permitted.
- **Doctor:** one account bound to one clinic, a public profile, own schedule, own appointments, and an own-work dashboard.
- **Clinic administrator:** own clinic profile, doctor accounts for that clinic, prices, schedules, bookings, patient list, client cards, dashboard, and booking totals.
- **Platform administrator:** verify clinics and doctors separately and see minimal counts, without patient financial or contact detail.

There are three presentation areas: the public website, the signed-in portal, and basic platform admin. They live in **one web application**. A doctor cannot use one account at two clinics.

## Required functions

IDs stay stable. `MVP-21` and `MVP-22` are retired and must not be reused. New work uses `MVP-24` onward. The Armenian names in `FUNCTIONALITY_MINIMUM_HY.md` are the current list.

| ID | Function (canonical Armenian name) | Minimum acceptance behavior |
| --- | --- | --- |
| MVP-01 | Գլխավոր էջ | Present the service and public entry points to clinics, doctors and appointments. |
| MVP-02 | Կլինիկաների հանրային ցանկ | List only published, approved clinics with concise contact/location details. |
| MVP-03 | Բժիշկների հանրային ցանկ | List only approved published doctors independently of clinic-directory navigation. |
| MVP-04 | Պարզ որոնում՝ ըստ անվանման և մասնագիտացման | Search published clinics/doctors by name and doctors by approved specialty; no advanced geo/price filtering. |
| MVP-05 | Կլինիկայի հանրային էջ | Show approved clinic details, address/contact, associated published doctors, and offered services/prices. No rating. |
| MVP-06 | Բժշկի հանրային պրոֆիլ | Show approved doctor identity, specialization, permitted professional information and associated clinic. |
| MVP-07 | Ծառայությունների և գների հրապարակում | Show a clinic's approved offerings and published prices; identify estimates where applicable. |
| MVP-08 | Պացիենտի գրանցում և մուտք | Patient sign-up, sign-in, and sign-out with email and password. One email is one account. |
| MVP-09 | Օգտատերերի դերեր և մուտքի իրավունքներ | Enforce distinct visitor/patient/doctor/clinic-admin/platform-admin access on every protected backend action. |
| MVP-10 | Կլինիկաների և բժիշկների հաստատում | Platform administrator can approve/reject and control public visibility of clinic and doctor records separately. |
| MVP-11 | Կլինիկայի տվյալների կառավարում | Clinic administrator edits their clinic's permitted public identity, location/contact and publication requests. |
| MVP-12 | Բժիշկների և ծառայությունների կառավարում | Clinic administrator maintains this clinic's doctor profiles, offerings, and prices. The doctor sets their own password. The clinic cannot read or set it, and cannot attach that login to a second clinic. |
| MVP-13 | Բժիշկների աշխատանքային ժամանակացույց | Authorized doctor/clinic admin creates and edits doctor working slots and basic unavailable intervals. |
| MVP-14 | Ազատ ժամերի ցուցադրում | Display **server-calculated** available times respecting working schedule and existing active appointments. |
| MVP-15 | Առցանց այցի ամրագրում | Authenticated patient requests a specific available doctor/service/time; transactionally prevent conflicting bookings. |
| MVP-16 | Ամրագրման հաստատում և չեղարկում | Clinic confirms requests; patient/clinic cancels when permitted; update reservation and history correctly. |
| MVP-17 | Պացիենտի այցերի ցանկ | Patient can view only their upcoming/past appointment requests and statuses. |
| MVP-18 | Բժշկի այցերի ցանկ | Doctor views only appointments assigned to them and the minimum contact information needed. |
| MVP-19 | Կլինիկայի ամրագրումների կառավարում | Clinic admin views own appointment requests, confirms/cancels, and marks an attended appointment complete. |
| MVP-20 | Ամրագրումների մասին ծանուցումներ | Patient and relevant clinic/doctor receive appropriate basic booking-created/confirmed/canceled notifications. |
| MVP-21 | Removed 2026-09-30 | Reviews and ratings. Do not implement. Do not reuse this ID. |
| MVP-22 | Removed 2026-09-30 | Clinic sort by rating. Public clinic list is ordered by name. Do not reuse this ID. |
| MVP-23 | Հարթակի հիմնական ադմինիստրատորի վահանակ | Platform admin sees clinic/doctor approvals and minimal counts, without patient contacts or booking amounts. |
| MVP-24 | Աշխատանքային վահանակ | Clinic sees pending requests, today's appointments, and its patient count. Doctor sees only their own upcoming appointments. |
| MVP-25 | Պացիենտների ցանկ | Clinic sees only patients who have an appointment at that clinic. No other clinic's patients. |
| MVP-26 | Հաճախորդի քարտ | Clinic opens one operational card: contact and appointments at that clinic only. No diagnosis, note, or treatment plan. |
| MVP-27 | Ֆինանսական ամփոփում | Sum this clinic's fixed price snapshots, split into `REQUESTED`, `CONFIRMED`, and `COMPLETED`. `CANCELLED` adds nothing. An estimated price is counted, not added to the money total. No payment collection. |

### Minimum end-to-end journey

1. Platform admin approves a clinic and its doctors; clinic admin publishes services/prices and doctor schedules.
2. Visitor finds a clinic or doctor by name/specialty and sees published profile, offerings and genuinely available times.
3. Patient signs in, requests one available slot. Clinic confirms or cancels it according to approved policy, and the patient sees updated status and receives basic notification.
4. Clinic sees its dashboard, patient list, and client card. Financial totals come from recorded appointment prices. There is no review.

## Product scope constraints

- **Clinics:** one operating location per clinic in the minimum MVP. Branch-management UI is deferred. The schema may later support branches, but do not present unapproved branch workflows now.
- **Doctor account:** one email is one account. That account may book as a patient at many clinics. If it is a doctor, the doctor role belongs to exactly one clinic. A second clinic requires a second email and a second account. Overlap protection applies to each doctor account, not across two accounts of the same person. Accepted 2026-09-30. The doctor chooses the password. Clinic and platform admins cannot read or set it.
- **Booking:** `REQUESTED` occupies the slot. An authorized clinic user confirms it. `REQUESTED` or `CONFIRMED` can be cancelled by the patient or the clinic, with no time cutoff and no automatic expiry. Cancellation releases the slot in the same transaction. `COMPLETED` is a later clinic action for a visit that happened and is not cancelled on this path. Accepted 2026-09-29.
- **Completion:** a clinic admin marks a real `CONFIRMED` visit `COMPLETED`. That status means the person attended. It creates no medical note, diagnosis, or medical record. Accepted 2026-09-29.
- **Reviews and ratings:** removed 2026-09-30. Do not collect, store, or sort by them.
- **Clinic operations:** dashboard, patient list, client card, and booking-price totals are required. The client card is not a medical record. Totals are not a payment system. Accepted 2026-09-30.
- **Notifications:** in-app notices only for booking request, confirmation, and cancellation. No email and no reminder campaign in this release. Accepted 2026-09-29. A failed notice does not change the appointment.
- **Login:** email and password. The session lasts 12 hours and then must be renewed by signing in again. Login is limited to 10 requests per minute per IP. Registration is limited to 5 requests per 10 minutes per IP. There is no email password reset. Accepted 2026-09-29.
- **Language:** the interface of this release is Armenian. Accepted 2026-09-29.
- **Admin:** clinic approval and doctor approval are separate. Verification files stay private to platform admins and are not deleted automatically. No wide access to private patient information. Accepted 2026-09-29.

## Explicitly deferred from the earlier 46-function V1

- Reviews, ratings, and public sort by rating.
- Combined advanced filters and distance/geo ranking.
- Multi-branch clinic operations; one doctor account used at more than one clinic; room/equipment resource calendars.
- Appointment rescheduling; elaborate attendance states, no-show workflows and advanced calendars; reminder schedules or additional message channels.
- Private patient–doctor text messaging and doctor chat management.
- Anonymous public questions, doctor public answers, Q&A moderation, archive and question tracking.
- Payment collection, deposits, invoices, and bank integrations. Booking-price totals in `MVP-27` do not add these.
- Rich CMS, CT/CBCT/PACS, EHR, treatment plans, surgery management, and native mobile apps.

**Do not keep disabled routes, tables or fake UI from deferred features in this minimum pack.** The previous expanded documents are historical scope references, not active minimum-MVP instructions.

## Minimum security and quality acceptance

- Only approved clinics and doctors are public; never return unpublished verification evidence in public responses.
- Patient A cannot read Patient B's appointments. Clinic A cannot access Clinic B's patients, cards, bookings, or totals.
- Removing a clinic member blocks subsequent access to that clinic's protected records.
- Two simultaneous requests for the same doctor/time cannot both create active bookings, including under retries.
- Cancellation releases capacity atomically. `COMPLETED` records attendance only and does not open a review.
- Notifications cannot determine the correctness of an appointment transaction; failed delivery does not cancel a booking.
- No real patient data in development fixtures, logs, public cache/SEO or screenshots; security, accessibility, backup/restore and deployment checks must be demonstrated before launch.

## Still open (do not guess)

These are decided and must not be reopened as if they were pending: email/password login, 12-hour sessions, Armenian UI, in-app booking notices, clinic confirmation without a cutoff, no reviews, one doctor account per clinic, and name order for clinic lists.

Still open:

1. Which public profile fields are shown, and how long private verification files are kept.
2. Production host, region, backup owner, and deploy owner.

**Approval procedure:** product owner reviews this scope; record signature/date in `DECISIONS.md`. Update implementation documents only with decisions actually approved. No statement here implies that the app has been built.
