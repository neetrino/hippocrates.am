# Hippocrates.am — Architecture

> **Status: ACTIVE BASELINE.** Revised 2026-09-30. One web application, one API, and one database. Modules for later points are added when that point starts. Technology specifics belong in `02-TECH_STACK.md`. Product scope is `ADR-003`.

## Architectural goal and boundaries

Provide the full product with one web application, one API, and one database. Keep each clinic's patients private. A doctor account may work at more than one clinic. Chat, Q&A, reviews, branches, and reminders are later points. Finance capture and clinical records are later points of the same product and are not built early.

```text
Public / Patient / Doctor / Clinic / Platform browser views
                          |
                    HTTPS + Web
                   (one Next.js app)
                          |
                 Versioned REST API
                (one NestJS process)
                          |
        +-----------------+-----------------------+
        |                 |                       |
   PostgreSQL       Optional media       Conditional async
  one primary        storage             notification worker
       (authoritative data, session and booking records)
```

A worker exists **only when needed by an approved outbound notification channel**. Redis, realtime gateways, PACS, payment processors and separate search infrastructure are not part of this baseline.

## Functional backend boundaries

| Module | Owns | Allowed cross-module contract dependencies |
| --- | --- | --- |
| `identity` | User, login/session, basic role identity | None |
| `clinics` | Clinic record/publication, clinic-admin membership, clinic verification state | `identity` IDs only |
| `doctors` | Doctor profile and one affiliation per clinic on the same login | `identity`, clinic ids |
| `catalog` | Named service and clinic offering/price | Published `clinics`, authorized `doctors` |
| `scheduling` | Doctor working periods, basic unavailability, availability reads | Approved clinic/doctor, booking occupancy contract |
| `appointments` | Appointment and status events; transactional occupied intervals | Doctor/schedule/offering/patient approved lookups |
| `marketplace` | Public home, clinic list, doctor list, profiles, and filters. Ratings arrive on point P8 | Published clinic, doctor, and catalog fields only |
| `clinic-operations` | Dashboard, patient list, client card, booking-price totals | This clinic's appointments and patient contacts only |
| `notifications` | Basic booking-event intents, in-app recipient visibility | Appointment events created in the same transaction |
| `platform-admin` | Clinic and doctor approval and safe counts | No patient contacts and no booking amounts |

`identity`, `clinics`, `doctors` and `appointments` must expose narrow internal application interfaces. **No module may directly write another module's private data**, even within the monolith. Shared technical infrastructure (DB/HTTP/logging) is not a business module.

## Data, authorization and privacy rules

1. `PatientProfile` belongs to an identity used across the marketplace. Clinic appointments remain clinic-scoped; no clinic sees appointments of another clinic.
2. Every protected clinic operation validates the server-side session, **current** authorized clinic membership, action permission and record clinic ID. Doctor operations additionally validate doctor ownership/assignment; patients see their own records only.
3. Published projections use explicit DTO allowlists, never full ORM rows; approval status is independently checked for clinic and doctor publication.
4. Super Admin registers clinics and their owner Admin. An Admin registers doctors for that clinic only. A Patient self-registers. There is no blanket permission to read patient notes, private contact histories, or future medical records.
5. Revoking a clinic-admin membership prevents later operations; session alone does not grant stale clinic rights.
6. A doctor user may hold a separate affiliation at each clinic. Each request checks the affiliation for that clinic. Accepted 2026-09-30, revised by ADR-003.

## Core flows

### Publication / verification

`Clinic creates/edits draft → platform verifies clinic → publish clinic → clinic adds doctor → platform separately verifies doctor → publish doctor.` A clinic/doctor can be hidden if verification is withdrawn. Published profiles display only approved information. The same user may have multiple platform roles without bypassing object-scope checks.

### Booking and cancellation

`Visitor finds doctor → server calculates available time → patient signs in → creates REQUESTED booking → DB transaction checks doctor/schedule/time/clinic again, reserves time and records event → clinic confirms → patient sees status → basic notification.`

A working `REQUESTED` booking **occupies** the offered interval, so a second request cannot reserve it. A platform policy can expire or decline abandoned requests **only after approval**; do not silently invent expiration rules. Cancellation checks actor and cutoff policy, releases occupancy atomically and appends event.

**Concurrency invariant:** two active appointments (`REQUESTED` or `CONFIRMED`) may not overlap for one doctor. Check at transaction time and enforce by suitable PostgreSQL constraints/locking. Do not rely solely on application-side `SELECT` or display cache. Deduplicate retries using actor-scoped idempotency keys.

### Completion, patients, and totals

`Clinic admin marks CONFIRMED appointment COMPLETED after attendance.` That status does not create a review or a medical note. The clinic patient list and client card show only this clinic's appointments. Financial totals sum this clinic's stored appointment prices. They do not collect money.

### Notifications

Booking events generate minimal recipient-specific notices. An in-app notice can be inserted in the authoritative transaction. If email is approved, store a minimal durable delivery intent with the appointment transaction and use a retry-safe worker; email downtime must not roll back booking state.

## Deployment and resilience

One web runtime, one stateless API runtime, one PostgreSQL primary, optional media storage and optional small notification worker. Sessions stored in authoritative DB initially if approved. Shared state affecting authorization and booking correctness cannot reside solely in API memory. Development/staging/production separation, tested backups, health monitoring and controlled one-time migrations are mandatory operational practices.

## Later points

Add branch, messaging, public Q&A, review, finance, and clinical modules on their points in `PROGRESS.md`. Do not scaffold empty modules before that point. A doctor affiliation is per clinic. Slot overlap is enforced per doctor, including across that doctor's clinics.

## Approval gates

- Local topology is one web app, one API, and one PostgreSQL database. `ADR-003` is the scope authority.
- Production host is still open.
- Prove access controls, appointment concurrency, and restore before release. Record evidence in `PROGRESS.md`.
