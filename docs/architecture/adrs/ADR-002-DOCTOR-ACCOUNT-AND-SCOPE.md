# ADR-002: One doctor account per clinic, no reviews

**Status:** SUPERSEDED by ADR-003 on 2026-09-30 for every rule that shrinks the product (no reviews, one clinic per doctor, reduced notices). The password rule remains: the doctor sets the password, and admins cannot read or set it.  
**Date:** 2026-09-30  
**Decision owner:** Product owner, this chat. Name not recorded.  
**Supersedes for this release:** the review and rating parts of HM-007 and HM-008, and the “one active affiliation on a shared doctor account” reading of HM-003.

## Context

The 2026-09-29 minimum pack allowed one active clinic link on a doctor profile and included post-visit clinic reviews plus rating sort. The owner then required a stricter account rule and removed reviews and ratings. The owner also named dashboards, a patient list, a client card, and financial analysis.

## Decision

Withdrawn. The list below is not an instruction. `ADR-003` is the product.

1. One email is one account. It may book as a patient at many clinics. A doctor role on that account belongs to exactly one clinic. A second clinic requires a second email. The doctor sets the password. Admins cannot read or set it. Two accounts for the same person are not checked against each other for overlapping appointments.
2. The review ban in this ADR is withdrawn. Reviews return on point P8.
3. Booking, in-app booking notifications, the public home page, and the public doctors pages stay.
4. Add a clinic/doctor operations dashboard, a clinic patient list, a clinic client card, and financial totals calculated from appointment price snapshots.
5. The client card is operational contact and appointment history at that clinic. It is not a medical record. Financial analysis does not collect payments.

## Consequences

- A doctor may affiliate with more than one clinic. Each clinic sees only its own patients.
- Reviews are point P8. Do not add them during P0.
- Password handling stays: the doctor sets the password, and admins cannot read or set it.
