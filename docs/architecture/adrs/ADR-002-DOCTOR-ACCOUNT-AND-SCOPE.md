# ADR-002: One doctor account per clinic, no reviews

**Status:** ACCEPTED  
**Date:** 2026-09-30  
**Decision owner:** Product owner, this chat. Name not recorded.  
**Supersedes for this release:** the review and rating parts of HM-007 and HM-008, and the “one active affiliation on a shared doctor account” reading of HM-003.

## Context

The 2026-09-29 minimum pack allowed one active clinic link on a doctor profile and included post-visit clinic reviews plus rating sort. The owner then required a stricter account rule and removed reviews and ratings. The owner also named dashboards, a patient list, a client card, and financial analysis.

## Decision

1. One email is one account. It may book as a patient at many clinics. A doctor role on that account belongs to exactly one clinic. A second clinic requires a second email. The doctor sets the password. Admins cannot read or set it. Two accounts for the same person are not checked against each other for overlapping appointments.
2. Reviews, ratings, and rating sort are out of this release. `MVP-21` and `MVP-22` stay retired and must not be reused.
3. Booking, in-app booking notifications, the public home page, and the public doctors pages stay.
4. Add a clinic/doctor operations dashboard, a clinic patient list, a clinic client card, and financial totals calculated from appointment price snapshots.
5. The client card is operational contact and appointment history at that clinic. It is not a medical record. Financial analysis does not collect payments.

## Consequences

- Do not model a doctor as one user with many clinic memberships.
- Do not add review tables, review routes, or public rating sort.
- A patient may still book at more than one clinic. Each clinic sees only its own patients and appointments.
- No application code existed when this decision was recorded, so nothing is deleted from a database.
