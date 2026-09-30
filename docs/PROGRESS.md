# Delivery plan — Hippocrates.am

> **PLAN, not implementation status.** Revised 2026-09-30. The reduced first release is withdrawn. No feature is implemented until code and tests exist.

**Verified implementation:** none. The repository has no application.  
**Product scope:** full product, `ADR-003`. Production host is still open.  
**Status terms:** `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `VERIFIED`.

## Points

Do the points in order. Do not add empty modules for a point that has not started.

| Point | Deliverable | Requirements | State | Verified when |
| --- | --- | --- | --- | --- |
| P0 | Workspace, local PostgreSQL, CI, health | foundation | NOT_STARTED | Both apps boot, the empty database migrates, checks pass |
| P1 | Identity, sessions, roles, membership | FR-001 login, FR-017 start | NOT_STARTED | Wrong-role and revoked-membership requests are denied |
| P2 | Organizations, branches, separate verification | FR-003, FR-015, FR-016, FR-017 | NOT_STARTED | Unpublished organizations stay private. Clinic and doctor approval are separate |
| P3 | Practitioners, catalog, public pages and filters | FR-002, FR-003, FR-004, FR-005 | NOT_STARTED | A doctor can be published at more than one clinic without leaking the other clinic's patients |
| P4 | Schedules, resources, booking | FR-006, FR-007 | NOT_STARTED | Concurrent requests cannot double-book. Reschedule and cancel keep history |
| P5 | Portals, reminders, operational records | FR-008, FR-009, FR-010, FR-015 | NOT_STARTED | A failed notice does not change the appointment |
| P6 | Private chat | FR-011 | NOT_STARTED | A non-participant cannot read the thread |
| P7 | Public Q&A and archive | FR-012, FR-013 | NOT_STARTED | The author is absent from public responses |
| P8 | Reviews, moderation, ranking | FR-014, FR-016 | NOT_STARTED | A review requires a verified visit. Ranking uses only an approved formula |
| P9 | Finance | later finance point | NOT_STARTED | No card capture until this point is separately approved |
| P10 | Clinical and imaging | later clinical point | NOT_STARTED | No clinical form is added before its own acceptance spec |
| P11 | Release | all accepted points | NOT_STARTED | Backup restore and a role-by-role walkthrough. Blocked while host, backup owner, and deploy owner are unnamed |

## Still blocking release only

- [ ] Name the production host, region, backup owner, and deploy owner.

## Discipline

For each point: inspect the repo, implement the smallest complete vertical slice, run positive and negative tests, then update this file from evidence. Do not mark a point verified from documentation alone.
