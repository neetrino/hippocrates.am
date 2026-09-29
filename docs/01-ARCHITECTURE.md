# Hippocrates.am — Minimum MVP Architecture

> **Status: PROPOSED.** Date: 2026-09-29. Replaces the broader-V1 reference architecture **only for the minimum-MVP planning pack**. The repository must be audited before code changes or approval. Technology/provider specifics belong in `02-TECH_STACK.md`.

## Architectural goal and boundaries

Provide the 23 BRIEF features with one straightforward, secure, maintainable web/API/database deployment. Keep clinic operations isolated, expose only published public data, and make appointment availability/creation correct under concurrent requests. Do not build hidden chat/Q&A/clinical/finance capabilities for possible future releases.

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
| `doctors` | Independent doctor profile, specialty, verification, one active clinic link (proposed) | `identity`, published `clinics` link |
| `catalog` | Named service and clinic offering/price | Published `clinics`, authorized `doctors` |
| `scheduling` | Doctor working periods, basic unavailability, availability reads | Approved clinic/doctor, booking occupancy contract |
| `appointments` | Appointment and status events; transactional occupied intervals | Doctor/schedule/offering/patient approved lookups |
| `marketplace` | Public-only home/list/search/profile/rating projections | Only allowlisted published clinic/doctor/catalog/review contracts |
| `reviews` | Eligible completed-visit clinic reviews and native rating aggregates | Appointments' eligibility interface, clinic published ID |
| `notifications` | Basic booking-event intents, in-app recipient visibility, optional delivery | Appointment domain events or transactionally generated intents |
| `platform-admin` | Clinic/doctor review decisions and safe overview counts | Restricted clinic/doctor approval interfaces |

`identity`, `clinics`, `doctors` and `appointments` must expose narrow internal application interfaces. **No module may directly write another module's private data**, even within the monolith. Shared technical infrastructure (DB/HTTP/logging) is not a business module.

## Data, authorization and privacy rules

1. `PatientProfile` belongs to an identity used across the marketplace. Clinic appointments remain clinic-scoped; no clinic sees appointments of another clinic.
2. Every protected clinic operation validates the server-side session, **current** authorized clinic membership, action permission and record clinic ID. Doctor operations additionally validate doctor ownership/assignment; patients see their own records only.
3. Published projections use explicit DTO allowlists, never full ORM rows; approval status is independently checked for clinic and doctor publication.
4. Platform administrator permissions are narrow: verification and aggregate platform counts. There is no blanket permission to read patient notes, private contact histories or future medical records.
5. Revoking a clinic-admin membership prevents later operations; session alone does not grant stale clinic rights.
6. Working assumption for MVP is at most one active clinic link per doctor, subject to owner approval. Do **not** implement multi-clinic doctor affiliation with incomplete conflict control.

## Core flows

### Publication / verification

`Clinic creates/edits draft → platform verifies clinic → publish clinic → clinic adds doctor → platform separately verifies doctor → publish doctor.` A clinic/doctor can be hidden if verification is withdrawn. Published profiles display only approved information. The same user may have multiple platform roles without bypassing object-scope checks.

### Booking and cancellation

`Visitor finds doctor → server calculates available time → patient signs in → creates REQUESTED booking → DB transaction checks doctor/schedule/time/clinic again, reserves time and records event → clinic confirms → patient sees status → basic notification.`

A working `REQUESTED` booking **occupies** the offered interval, so a second request cannot reserve it. A platform policy can expire or decline abandoned requests **only after approval**; do not silently invent expiration rules. Cancellation checks actor and cutoff policy, releases occupancy atomically and appends event.

**Concurrency invariant:** two active appointments (`REQUESTED` or `CONFIRMED`) may not overlap for one doctor. Check at transaction time and enforce by suitable PostgreSQL constraints/locking. Do not rely solely on application-side `SELECT` or display cache. Deduplicate retries using actor-scoped idempotency keys.

### Completion and ratings

`Clinic admin marks CONFIRMED appointment COMPLETED after genuine attendance → review eligibility projection returns true only for patient + appointment's clinic → patient may submit one clinic review → rating aggregate/directory ordering refreshes.`

Do not automatically infer medical treatment, diagnosis or clinical data from operational completion. Review moderation should remove unlawful content under reviewed rules, not manipulate negative scores.

### Notifications

Booking events generate minimal recipient-specific notices. An in-app notice can be inserted in the authoritative transaction. If email is approved, store a minimal durable delivery intent with the appointment transaction and use a retry-safe worker; email downtime must not roll back booking state.

## Deployment and resilience

One web runtime, one stateless API runtime, one PostgreSQL primary, optional media storage and optional small notification worker. Sessions stored in authoritative DB initially if approved. Shared state affecting authorization and booking correctness cannot reside solely in API memory. Development/staging/production separation, tested backups, health monitoring and controlled one-time migrations are mandatory operational practices.

## Deferred architectural boundaries

No live modules for multi-branch operations, cross-clinic doctor schedules, room/equipment booking, rescheduling, messaging, anonymous Q&A, payments, analytics warehouse, EHR or imaging. Future designs require a new approved scope + ADR, rather than speculative tables/endpoints in the current MVP.

## Approval gates

- Validate current repository and choose a compatible minimal topology instead of forcing an unnecessary rewrite.
- Confirm one active clinic per doctor, manual clinic confirmation, cancellation cutoff, clinic review formula, identity/verification and notification channel before implementing dependent flows.
- Prove access controls, appointment concurrency and restore in staging; record evidence in `PROGRESS.md`.
