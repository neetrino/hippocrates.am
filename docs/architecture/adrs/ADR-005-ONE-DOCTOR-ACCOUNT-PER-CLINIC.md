# ADR-005: One doctor account belongs to one clinic

**Status:** ACCEPTED  
**Date:** 2026-10-15  
**Decision owner:** Product owner, this chat. Name not recorded.  
**Amends:** ADR-003 (withdraws only the “doctor working at more than one clinic” clause).  
**Restores:** ADR-002 item 1 (one doctor login = one clinic). Does not restore the ADR-002 review ban or other reduced-pack cuts.  
**Matches:** live Prisma and `POST /clinics/:clinicId/doctors`. No schema change.

## Context

ADR-003 put a shared doctor login across clinics back into the product. The implemented model never grew an affiliation table:

```text
User.email UNIQUE
User.clinicId            (optional; staff home clinic)
DoctorProfile.userId UNIQUE
DoctorProfile.clinicId   (required; that doctor's clinic)
```

Create-doctor inserts a new `User` (`role: DOCTOR`) plus `DoctorProfile` for that clinic. An existing email returns `EMAIL_TAKEN`. The same login cannot join a second clinic.

Building `DoctorClinicMembership` now would be a schema and auth rewrite. The owner chose to keep the live shape and correct the documents.

## Decision

1. One email is one account. A `DOCTOR` role on that account belongs to exactly one clinic (`DoctorProfile.clinicId`).
2. A second clinic requires a second email and a second `DoctorProfile`. Occupancy is not shared across those accounts.
3. Duplicate email on doctor create stays `EMAIL_TAKEN` (409). Do not treat the route as “affiliate an existing doctor”.
4. Slot overlap stays on `DoctorProfile.id` (`REQUESTED` | `CONFIRMED`). That is one clinic because the profile has one `clinicId`.
5. Do not add `DoctorClinicMembership` or move hours/offerings/appointments onto a multi-clinic affiliation until a later ADR explicitly requires it.
6. Patients may still book at many clinics. Clinic A still cannot read clinic B's patients. Password rule unchanged: the doctor sets the password; admins cannot read or set it.

## Consequences

- Docs that still said “one login, many clinics” follow this ADR.
- ADR-003 remains the product map for reviews, chat (paused by ADR-004), Q&A, branches, reschedule, and reminders.
- Two emails for the same person are two occupancy worlds. That is accepted.
- Application schema and create-doctor flow stay as they are.

## Related decisions

- [ADR-002](./ADR-002-DOCTOR-ACCOUNT-AND-SCOPE.md) — original one-clinic rule (history; reviews still withdrawn)
- [ADR-003](./ADR-003-FULL-PRODUCT-SCOPE.md) — full product; this ADR amends doctor-clinic binding only
- [ADR-004](./ADR-004-ROLES-AND-REGISTRATION.md) — Admin registers doctors for that clinic only
