# Database design — Hippocrates.am

> Revised 2026-10-15. The lists below are the **product target**. Prisma under `apps/api/prisma/` is the live schema. Chat, invoice, and clinical tables still wait. `Question`, `Review`, `AppointmentEvent`, and `PasswordReset` already exist. One doctor user = one `DoctorProfile` = one clinic (`ADR-005`).

## Authoritative data groups

| Domain | Minimum entity | Main responsibility / representative fields |
| --- | --- | --- |
| Identity | `User` | Opaque ID, display name, approved contact/login fields, account state |
| Identity | `Session` | Hashed opaque session ID, user, expiry/revocation, activity policy |
| Clinics | `Clinic` | Public name, description, contact, draft/published state. Branches arrive on point P2 |
| Clinics | `ClinicMembership` | User, clinic, role (admin); active/revoked state and timestamps |
| Verification | `VerificationCase` | **Separate target type** CLINIC or DOCTOR, reviewer, status and audit; protected evidence refs if approved |
| Doctors | `DoctorProfile` | One user, one clinic, specialization, public fields, verification |
| Catalog | `Service` | Minimal approved service identity/name/category as needed |
| Catalog | `ClinicOffering` | Clinic, approved doctor/service eligibility if needed, published price/currency and optional estimate flag |
| Scheduling | `DoctorSchedule` | Doctor+clinic, weekday/date and time intervals, clinic time zone |
| Scheduling | `ScheduleException` | Basic unavailable intervals/holidays (not room/equipment management) |
| Appointments | `Appointment` | Patient, doctor, clinic, offering, UTC start/end, status, agreed offering/price snapshot if shown |
| Appointments | `AppointmentEvent` | Controlled transition history, actor, timestamp, sanitized reason |
| Appointments | `AppointmentIdempotency` | Actor, request key/fingerprint, operation outcome for safe retries |
| Notifications | `Notification` | Recipient, appointment event, minimal content, read state; optional delivery status if email approved |
| Patients | `ClinicPatient` | Clinic, patient user, contact needed by that clinic. Created from this clinic's appointments. No clinical note |
| Audit | `AuditEvent` | Restricted clinic/doctor approvals, permissions and booking actions with sanitized metadata |

The identity migration stores contact needed for booking. Clinical notes, imaging, payments, messages, and Q&A author maps are later migrations. Do not add them before their point.

## Conceptual relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : owns
    USER ||--o{ CLINIC_MEMBERSHIP : assigned
    CLINIC ||--o{ CLINIC_MEMBERSHIP : authorizes
    USER ||--o| DOCTOR_PROFILE : may_have
    CLINIC ||--o{ DOCTOR_PROFILE : employs
    CLINIC ||--o{ CLINIC_OFFERING : offers
    SERVICE ||--o{ CLINIC_OFFERING : describes
    DOCTOR_PROFILE ||--o{ DOCTOR_SCHEDULE : follows
    DOCTOR_PROFILE ||--o{ SCHEDULE_EXCEPTION : excludes
    CLINIC ||--o{ APPOINTMENT : receives
    DOCTOR_PROFILE ||--o{ APPOINTMENT : assigned
    USER ||--o{ APPOINTMENT : patient
    CLINIC ||--o{ CLINIC_PATIENT : knows
    USER ||--o{ CLINIC_PATIENT : appears_as
    CLINIC_OFFERING ||--o{ APPOINTMENT : chosen
    APPOINTMENT ||--o{ APPOINTMENT_EVENT : history
    APPOINTMENT ||--o{ NOTIFICATION : about
    USER ||--o{ NOTIFICATION : receives
```

The diagram is conceptual; actual column names/types/keys require approved migrations and schema review.

## Access and publication constraints

- Every clinic-owned operational row has a trustworthy clinic scope or a constrained FK path to one. Composite integrity and service checks block Clinic A references to Clinic B private objects.
- `Clinic` and `DoctorProfile` publication are distinct; public clinic and doctor projections require independently approved verification states where applicable.
- Clinic membership revocation is checked **on each protected request**; a stale signed-in session does not preserve revoked clinic powers.
- A doctor user has one `DoctorProfile` and one `clinicId`. Overlapping active appointments are rejected for that profile. A second clinic for the same person is a second email and a second occupancy world (`ADR-005`).
- Patient may have appointments with several clinics but sees only their own records; each clinic sees only its own permitted booking details.

## Appointment state and conflict integrity

**Appointment states in the live schema:** `REQUESTED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `EXPIRED`, `NO_SHOW`. `REQUESTED` and `CONFIRMED` occupy that doctor account's time. Unanswered `REQUESTED` rows become `EXPIRED` when the start time arrives. There is no patient cancellation cutoff. `COMPLETED` means the person attended. It is not a review and not a medical note.

**AppointmentEvent** is append-only (`CREATED`, `CONFIRMED`, `CANCELLED`, `RESCHEDULED`, `EXPIRED`, `COMPLETED`, `NO_SHOW`). History starts at the event migration; older visits are not backfilled. Notifications are in-app `Notification` rows. There is no `NotificationIntent` / delivery-attempt table yet.

**Required invariant:** one doctor may have **at most one overlapping active appointment** for a given interval. Option A: PostgreSQL range/exclusion constraint on doctor ID and `[start,end)` with partial active-status predicate. Combine with ordered transaction locking as appropriate, or a proved alternative with a database-backed concurrency test. If Prisma lacks direct support for the chosen constraint, use an explicitly reviewed SQL migration.

Appointment creation transaction:

1. Authorize patient; validate clinic, approved doctor, active clinic assignment, published eligible offering, schedule/unavailability and UTC range.
2. Authoritatively reject conflicting active occupancy in a serializable/constraint-protected transaction; enforce idempotency key/payload fingerprint.
3. Create `REQUESTED` appointment and append `AppointmentEvent` in the same occupancy transaction. Persist the in-app `Notification` after commit so a notice failure does not roll back the booking. Outbox email/SMS delivery is not built.
4. Return safe conflict `409` without revealing another patient's/clinic's appointment details.

Cancellation transaction validates actor, policy, status, and updates appointment to `CANCELLED`, releases occupancy and appends event atomically. Retain the historical appointment. Never trust cached availability as reservation proof.

## Patients and totals

- `ClinicPatient` exists only for a patient who has an appointment at that clinic. It stores contact for that clinic, not a diagnosis.
- Financial analysis reads fixed `Appointment` price snapshots for one clinic, grouped into `REQUESTED`, `CONFIRMED`, and `COMPLETED`. `CANCELLED` adds nothing. Estimated prices are excluded from the money total. Do not add an invoice or payment table.

## Basic indexes and migrations

- Published clinic/doctor lookup by status/name/specialty; foreign keys for clinic offerings and doctor assignments.
- Clinic/day, doctor/time and patient/time indexes for booking and portal lists.
- Unique user email. Overlap exclusion per doctor and idempotency unique key.
- Clinic plus patient unique on `ClinicPatient`. Review indexes arrive on point P8.
- Create tables from reviewed, versioned migrations only; verify `CHECK` constraints, exclusion indexes, rollback strategy and query plans in staging.
- Development/staging use synthetic fixtures; define backup encryption, region, retention and a **tested restore** before first real appointment.

## Tables that wait for their point

Do not create `Conversation`, `Message`, `Branch`, `TreatmentPlan`, `MedicalNote`, imaging, invoice, or payment tables until their point. `Question`, `Answer`, and `Review` already exist. Booking-price totals on P5 are queries, not a ledger. Invoices start on P9. Clinical tables start on P10.

**Still open:** production data residency and the file-storage vendor. Accepted: email login, 12-hour sessions, private verification evidence, and the point order in `PROGRESS.md`. `BRIEF.md` and `ADR-003` are product authority; doctor-clinic binding is `ADR-005`.
