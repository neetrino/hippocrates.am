# Minimum MVP API Contracts — Hippocrates.am

> **CANDIDATE ROUTES, NOT EXISTING ENDPOINTS.** 2026-09-29. Apply the 23-feature `BRIEF.md`, current repo audit and approved identity/booking policies before implementation. Path prefix `/api/v1` is proposed.

## Shared API rules

- Public routes expose **published-only DTOs**; never serialize whole clinic/user/doctor ORM rows or private verification details.
- Login is email and password. The session is a revocable server record. The browser receives an HttpOnly Secure SameSite=Lax cookie. Registration and login must be rate-limited; the numeric limits are not pinned yet.
- Every private operation checks current user identity, active clinic membership when relevant, action permission and resource/patient/doctor ownership.
- Validate inputs, return generic 404 where another clinic's object must not be disclosed, and cap pagination and rate limits.
- Timestamp storage UTC; render available times in clinic's declared IANA time zone. Server is source of truth for available slots.
- Use an `Idempotency-Key` for creation/cancellation as agreed; deny replay with a different payload and ensure atomic consistency.

**Response envelope (proposed):** `{ "data": ..., "meta": { "requestId": "..." } }`; errors `{ "error": { "code": "...", "message": "..." }, "requestId": "..." }`.

## Public discovery and basic search (`MVP-01`–`MVP-07`)

| Route | Purpose | Critical rule |
| --- | --- | --- |
| `GET /public/home` | Homepage summary and entry points | Only published content |
| `GET /public/clinics?name=` | Clinic list and simple name search | Published clinics only, ordered by name. No rating parameter |
| `GET /public/clinics/:id` | Published clinic, its doctors, and offerings/prices | Safe allowlisted fields only. No rating |
| `GET /public/doctors?name=&specialty=` | Independent published doctor directory and basic search | Published doctor AND associated clinic approved |
| `GET /public/doctors/:id` | Published doctor profile | No internal credential attachments |
| `GET /public/clinics/:id/services` | Published service/price list | Distinguish quoted estimate from fixed price where applicable |
| `GET /public/availability?doctorId=&serviceId=&date=` | Genuine bookable slots for doctor/service | Advisory display only; booking rechecks in DB |
Search does **not** promise geolocation, ratings, or external review imports.

## Identity, roles and own data (`MVP-08`, `MVP-09`, `MVP-17`)

| Route | Actor / purpose |
| --- | --- |
| `POST /auth/register` | Patient registration with email and password. Store only an argon2id hash. Do not send a mail confirmation in this release |
| `POST /auth/login` | Start a revocable server session. Set the session cookie. Do not return the session token in JSON |
| `POST /auth/logout` | Revoke the current session so the cookie no longer authorizes requests |
| `GET /me` | Own minimum profile / role context |
| `GET /me/appointments` | Patient sees **only** own requests, statuses and permitted history |
| `GET /me/notifications` | Own basic booking-event notifications |

Email and password is the accepted login. Do not add phone login, OAuth, or an email password-reset route in this release.

## Clinic/doctor approval and maintenance (`MVP-10`–`MVP-13`, `MVP-23`)

| Route | Actor / purpose | Guard |
| --- | --- | --- |
| `POST /clinic-applications` | Authorized clinic applicant submits basic clinic information | Evidence stays private. Clinic approval is separate from doctor approval |
| `GET /clinics/:clinicId/profile` | Clinic admin reads own editable clinic info | Live membership + clinic scope |
| `PATCH /clinics/:clinicId/profile` | Clinic admin edits own allowed fields | Material public changes may require reapproval |
| `GET /clinics/:clinicId/doctors` | Own linked doctors | Clinic scope |
| `POST /clinics/:clinicId/doctors` | Register a doctor bound to this clinic | The doctor sets the password. Reject the email if it is already a doctor at any clinic. Admins cannot set the password |
| `PATCH /clinics/:clinicId/doctors/:doctorId` | Update clinic-authorized doctor info | Doctor verification may need re-review |
| `GET /clinics/:clinicId/services` | Own offerings | Clinic scope |
| `POST /clinics/:clinicId/services` | Create service/price offering | Approved doctor/clinic/service relationships |
| `PATCH /clinics/:clinicId/services/:id` | Update current published price/offering | Existing appointment price snapshot unaffected |
| `PUT /clinics/:clinicId/doctors/:doctorId/schedule` | Manage working periods/unavailability | Doctor-owner or approved clinic-admin permission |
| `GET /doctors/me/appointments` | Doctor's assigned appointment list | Own doctor identity only |
| `GET /admin/verification` | Platform admin lists pending clinics/doctors | Restricted verifier role |
| `POST /admin/verification/:id/decision` | Approve/reject clinic OR doctor independently | Decision audit + no raw evidence exposure in public API |
| `GET /admin/overview` | Counts of clinics, doctors, and bookings | Counts only. No patient contacts and no money totals |

A clinic-admin UI for doctor management does not grant authority to self-verify a doctor's professional credentials.

## Appointment flow (`MVP-14`–`MVP-20`)

| Route | Purpose | Mandatory behavior |
| --- | --- | --- |
| `POST /appointments` | Patient requests available doctor/service/time | **Atomic** availability conflict check + occupied slot reservation; idempotent |
| `GET /clinics/:clinicId/appointments` | Clinic-admin appointment queue/calendar | Own clinic only |
| `POST /appointments/:id/confirm` | Clinic confirms pending request | Authorized clinic; valid transition |
| `POST /appointments/:id/cancel` | Permitted patient/clinic cancellation | Policy validation, slot release and event in same transaction |
| `POST /appointments/:id/complete` | Clinic records attendance | Confirmed visit only. Does not create a review |
| `GET /me/appointments` | Patient's own appointment/history | Own records only |
| `GET /doctors/me/appointments` | Doctor's own assigned appointments | Own records only |

**States:** `REQUESTED -> CONFIRMED -> COMPLETED`, or `REQUESTED`/`CONFIRMED -> CANCELLED`. A `REQUESTED` appointment reserves the interval. There is no cutoff and no automatic expiry. No reschedule endpoint.

## Clinic operations (`MVP-24`–`MVP-27`)

| Route | Purpose | Critical guard |
| --- | --- | --- |
| `GET /clinics/:clinicId/dashboard` | Pending requests, today's appointments, patient count | That clinic only |
| `GET /doctors/me/dashboard` | The signed-in doctor's upcoming appointments | That doctor account only |
| `GET /clinics/:clinicId/patients` | Patients with an appointment at this clinic | No other clinic's patients |
| `GET /clinics/:clinicId/patients/:patientId` | Contact and appointments at this clinic | No diagnosis or other clinic's visits |
| `GET /clinics/:clinicId/finance?from=&to=` | Sum fixed price snapshots for `REQUESTED`, `CONFIRMED`, and `COMPLETED` | `CANCELLED` adds nothing. Estimates are excluded from the money total. No payment capture |

`MVP-21` and `MVP-22` routes are not part of the API. Do not add review or rating endpoints.

## Contract verification gates

- Clinic-public API hides draft/unverified clinics/doctors and verification evidence.
- Unauthorized patient/doctor/clinic/platform role requests are denied with no cross-clinic data leaks.
- Concurrent `POST /appointments` for an overlapping doctor slot yields at most one active booking.
- Cancellation immediately makes legitimately freed capacity available; retries cannot duplicate changes.
- A doctor account that already has a clinic is rejected for a second clinic.
- Patient list, client card, and finance responses contain only the caller's clinic. Public responses contain no rating.
- Booking notification failure never changes final appointment state.

Each route is a draft candidate; generate OpenAPI/DTO and automate positive/negative tests when implementing its approved slice. Do not claim routes already exist.
