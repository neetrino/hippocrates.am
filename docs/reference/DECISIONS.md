# Decision Register: Hippocrates.am (V1)

> An index of **proposals, open questions and approval records**. A row in this register is **not an accepted ADR**. Do not silently promote a proposal to an architectural invariant or implement it without the relevant approved task and technical sign-off.

**Version:** 1.0-draft  
**Target:** V1 / MVP  
**Date:** 2026-09-28  
**Status:** DRAFT

## Status definitions

- **Source requirement:** Explicit product direction from Hippocrates Overview v2.0. Implementation details may still be unapproved.
- **Proposed:** A technical approach recommended in the V1 architectural/stack drafts, not approved.
- **Pending:** Material product/technical choice still needed.
- **Accepted:** Recorded project-owner/authorized reviewer approval, with date and decision evidence.
- **Superseded / Deprecated:** Preserve the prior decision, link to replacing ADR and note migration consequences.

## V1 register

| ID | Decision | Current position | Status | Approval/evidence needed |
| --- | --- | --- | --- | --- |
| H-001 | First release boundaries | Marketplace, operational clinic/doctor/patient interfaces, safe booking, text chat, anonymous Q&A, native reviews and notifications | Source requirement; formal V1 BRIEF pending | Product owner validates final BRIEF against source v2.0. |
| H-002 | Initial architecture | Simple modular monolith, one Web, one API, one primary DB | Proposed | Architecture/TECH_CARD approval; repo compatibility review. |
| H-003 | Tenant storage | Shared PostgreSQL with strict clinic-scoped authorization and referential integrity | Proposed | Threat model, DB constraint and restore reviews. |
| H-004 | Identity/session strategy | Opaque revocable server-side sessions in PostgreSQL | Proposed | Credential flow, revocation policy, CSRF and security review. |
| H-005 | Doctor cross-clinic scheduling | Independent doctor identity plus affiliation; prevent overlaps on global practitioner reservation key | Source need + proposed design | Detailed conflict SQL/locking algorithm, test plan and approved transition policy. |
| H-006 | Durable notifications | Minimal PostgreSQL-backed worker/outbox only where V1 reminders require it | Proposed | Choose reminder channels/cadence, worker deployment and retry policy. |
| H-007 | Chat eligibility | Patient can initiate text chat from doctor's profile without a prior booking | Source requirement | Abuse limits, clinic context/doctor availability, retention and complaint policy. |
| H-008 | Public anonymous Q&A | Private author mapping; moderated public answers by verified doctors; independent searchable archive | Source requirement | Exact content moderation, anonymity and deletion/retention policy. |
| H-009 | Native review verification | Distinguish reviews based on completed known visits | Source requirement | Define off-platform proof process or defer it from V1. |
| H-010 | Online deposits/payments | No **mandatory** V1 gateway until ambiguity is resolved | Pending | Source mentions optional booking deposit but payment integration is listed in Phase 2. |
| H-011 | Launch languages | Internationalization-ready but exact launch locales unselected | Pending | Approve languages, locale URLs, fallback and translated-content ownership. |
| H-012 | Signup and login | Current-session checks required; exact auth providers and recovery flow TBD | Pending | Product/security approval. |
| H-013 | Booking policies | Temporary holds and safe confirmation proposed | Pending | Request vs immediate confirmation, cutoff policies, slot length and no-show authorization. |
| H-014 | Reviews/ranking policy | Native rating/source transparency; no assumed formula or undisclosed paid ranking | Pending | Explainable ranking and external source rights. |
| H-015 | Hosting/provider choices | Vendor-neutral until approved TECH_CARD | Pending | Region/privacy agreements, backend/DB/worker and backup provider evaluation. |
| H-016 | V1 clinical scope | No full EHR, Dental Chart, treatment plans, surgery records or CT/PACS in baseline V1 | Scope boundary from source roadmap | Any change requires new scope/medical/privacy ADR. |
| H-017 | Public vs private file handling | Private verification evidence separate from published media | Proposed | Data minimization, storage approval, malware checks and retention. |
| H-018 | Realtime and Redis | Polling and DB-backed jobs first; no default Redis/BullMQ/realtime gateway | Proposed | Add only when justified by approved UX/load/security requirements. |

## How to record an accepted decision

1. Create `docs/architecture/ADR-XXX-<slug>.md` using the tailored `docs/reference/templates/ADR_TEMPLATE.md`.
2. Document context, 2+ realistic options where applicable, decision, privacy/tenant/concurrency implications, test gates and rollback.
3. Record owner approval with approver and date; set ADR `Accepted` and update this register with a relative link.
4. Align `BRIEF.md`, `TECH_CARD.md`, `ARCHITECTURE_TEMPLATE.md`, `02-TECH_STACK.md`, API/DB docs and PROGRESS where affected.
5. If a decision changes, retain historical ADR and add a superseding ADR; avoid rewriting approval history as though the earlier choice never existed.

## Source precedence

The approved current product task and approved BRIEF/TECH_CARD outrank draft reference documents. The connected repository's `docs/BRIEF.md` was an unfilled template when checked; this pack supplies `BRIEF_V1_DRAFT.md` only for approval discussion. Repository `.agents/` and `.cursor/` agent rules are separate from product scope. No table row above authorizes production mutation or deployment.
