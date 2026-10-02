# API Design: Hippocrates.am (V1)

> **Contract proposal, not implemented endpoints.** Use this as a compact Cursor-facing design reference. The approved BRIEF and TECH_CARD determine which operations are shipped and the precise API surface. No route below may be considered live without matching implementation and tests.

**Version:** 1.0-draft  
**Target:** Version 1  
**Date:** 2026-09-28  
**Status:** PROPOSED

---

## 1. API fundamentals

- **Architecture:** one NestJS API with explicitly owned modular-monolith boundaries; versioned HTTPS REST routes under `/api/v1` are a **proposal**.
- **Authentication:** server-verified opaque revocable session, secure HTTP-only browser cookie; exact origin/CSRF and login details pending TECH_CARD.
- **Authorization:** check identity, chosen clinic when relevant, **current** membership, allowed role/action, branch, resource and record ownership on **every protected read/write**. Platform-operator grants are separate; no general override for private chats.
- **Identifiers:** server-generated opaque IDs. Do not infer clinic scope or permission from client-provided clinic IDs.
- **Validation:** runtime validation for body, params and filters; validate transition preconditions again at the time of mutation.
- **Pagination:** cursor-based when results can grow, with fixed server maximum; never return private author or internal moderation fields in public projections.
- **Time:** store timestamps in UTC; calculate human-facing times in the branch's declared time zone, with DST/offset tested. Slot and duration calculations happen server-side.
- **Idempotency:** required for confirm/reschedule booking and other retryable financial-like actions, if introduced; request key scoped to actor/operation and payload fingerprint.
- **Rate limits:** stricter for login, messaging requests, anonymous-question creation, reviews and public search abuse. Rate limiting is not an authorization substitute.

## 2. Standard HTTP contract (proposed)

```json
{
  "data": {"id": "opaque-id", "status": "CONFIRMED"},
  "meta": {"requestId": "request-id"}
}
```

```json
{
  "error": {
    "code": "BOOKING_SLOT_UNAVAILABLE",
    "message": "This appointment time is no longer available.",
    "requestId": "request-id"
  }
}
```

Use `400` for malformed requests, `401` for unauthenticated calls, `403` for unauthorized operations, `404` when a resource should not be disclosed, `409` for state/slot conflicts, `422` for validated business-rule rejection, and `429` for throttling. Do not leak another clinic's resource existence via error details. All success/error DTOs are illustrative until the OpenAPI contract is approved.

## 3. Public read routes — candidates, no clinic-private data

| Method / path | Purpose | Ownership / disclosure |
| --- | --- | --- |
| `GET /api/v1/public/clinics` | Search and filter published clinics | Marketplace projection only; approved rating/source distinctions. |
| `GET /api/v1/public/clinics/:id` | Published clinic and branches | No staff-private or verification-document content. |
| `GET /api/v1/public/doctors` | Doctor search, specialties, filters | Independent public doctor profiles; affiliations only when publishable. |
| `GET /api/v1/public/doctors/:id` | Published doctor page | May show safe availability, not another clinic's appointment details. |
| `GET /api/v1/public/services` | Published canonical services/offerings | Published offerings only; prices may be preliminary. |
| `GET /api/v1/public/availability` | Bookable times for approved branch/doctor/offering | Advisory only; final DB transaction determines confirmation. |
| `GET /api/v1/public/questions` | Published anonymous Q&A archive | Never return author ID, direct author profile URL, private attachment or hidden content. |
| `GET /api/v1/public/questions/:id` | Public question and published doctor answers | Apply same privacy projection to nested objects. |
| `GET /api/v1/public/reviews` | Native published reviews | Explicit verification status; external sources separate if ever introduced. |

Public Q&A publication must be reviewed to avoid identifying the author via **text**, not just omission of their account ID. Moderation and SEO outputs use the same safe approved projection.

## 4. Identity and personal accounts — candidates

| Method / path | Action | Authorization |
| --- | --- | --- |
| `POST /api/v1/auth/register` | Create platform account if registration method approved | Rate-limited; credential policy TBD. |
| `POST /api/v1/auth/login` | Start revocable session | Security/rate limits; exact auth method TBD. |
| `POST /api/v1/auth/logout` | End current session | Authenticated; CSRF/origin protection. |
| `GET /api/v1/me` | Own permitted public/account profile | Current session. |
| `PATCH /api/v1/me` | Update own allowed fields | Current session; audit sensitive changes. |
| `GET /api/v1/me/clinic-memberships` | List own active org roles | Current session; only own memberships. |

Do not implement password login, OAuth or account recovery until their credential and verification flows are approved. These routes show intended boundaries, not a mandated login provider.

## 5. Clinic and practitioner operations — candidates

| Method / path | Action | Authorization |
| --- | --- | --- |
| `POST /api/v1/clinic-applications` | Request clinic onboarding | Eligible user, document policy TBD. |
| `GET /api/v1/clinics/:clinicId/branches` | Read own clinic branches | Active membership + branch scope. |
| `POST /api/v1/clinics/:clinicId/branches` | Create branch | Clinic owner/delegated permission. |
| `POST /api/v1/clinics/:clinicId/staff-invitations` | Invite staff | Organization admin and invitation policy. |
| `GET /api/v1/clinics/:clinicId/members` | Authorized member list | Current membership and permission. |
| `PATCH /api/v1/clinics/:clinicId/members/:id` | Change/remove local membership | Current admin rights; revocation enforced on later requests. |
| `POST /api/v1/clinics/:clinicId/offerings` | Create branch-specific service offering | Allowed clinic scope; validated service taxonomy. |
| `PATCH /api/v1/clinics/:clinicId/offerings/:id` | Edit own offering | Never silently rewrite confirmed booking snapshots. |
| `GET /api/v1/doctors/me/affiliations` | Own clinic affiliations | Doctor identity; minimal other-clinic details. |
| `PUT /api/v1/clinics/:clinicId/schedules/:affiliationId` | Set approved local schedule | Correct doctor/admin permission; cross-clinic conflict rules. |

Clinic profile verification, doctor credential verification and publication are distinct workflows and must not share an undifferentiated `verified` flag. The exact onboarding document fields remain pending security and product approval.

## 6. Booking and attendance — candidate routes and invariant

| Method / path | Action | Notes |
| --- | --- | --- |
| `POST /api/v1/appointment-holds` | Temporarily hold a slot | Atomic doctor and resource conflict check, server-issued expiry. |
| `POST /api/v1/appointments` | Confirm own hold / approved assisted booking | Server rechecks availability and exact offering/branch/doctor compatibility in one transaction. |
| `GET /api/v1/me/appointments` | Own appointment list/history | Only own appointments; organization history is separate. |
| `GET /api/v1/clinics/:clinicId/appointments` | Authorized branch calendar | Active membership and field-level role limitations. |
| `POST /api/v1/appointments/:id/reschedule` | Reschedule if policy permits | Atomically release/acquire reservations; keep event history and old time. |
| `POST /api/v1/appointments/:id/cancel` | Cancel under approved rules | Release reservations and append event. |
| `POST /api/v1/appointments/:id/check-in` | Record arrival | Authorized receptionist/doctor under current branch. |
| `POST /api/v1/appointments/:id/complete` | Finish organizational visit | Authorized branch action; **does not** create clinical Encounter or treatment record. |
| `POST /api/v1/appointments/:id/no-show` | Record no-show | Controlled role and timing; audited. |

Booking states: `HELD`/`REQUESTED` -> `CONFIRMED` -> `CHECKED_IN` -> `IN_PROGRESS` -> `COMPLETED`; additional transitions include `CANCELLED`, `NO_SHOW`, `HOLD_EXPIRED`. **The exact state graph and cancellation deadlines are product decisions**, not inferred from this route list. Avoid an unbounded generic `PATCH status` endpoint that bypasses transition rules.

**Conflict invariant:** the same practitioner cannot have overlapping active reservations across Hippocrates clinic affiliations. A room/chair/device cannot be double-booked within its resource scope. Database-backed transactions and constraints protect confirmation; advisory availability alone is insufficient.

## 7. Private text messaging — candidate routes

| Method / path | Action | Access |
| --- | --- | --- |
| `POST /api/v1/conversations` | Patient requests doctor chat from public profile **without prior appointment** | Authenticated patient, verified/eligible doctor and abuse policy. |
| `GET /api/v1/me/conversations` | List own visible conversations | Participant-only projection. |
| `POST /api/v1/conversations/:id/accept` | Doctor accepts request | Invited doctor only. |
| `POST /api/v1/conversations/:id/messages` | Send text | Active participant, valid state, length/rate checks. |
| `GET /api/v1/conversations/:id/messages` | Read allowed messages | Current participant; pagination. |
| `POST /api/v1/conversations/:id/close` | Close chat | Authorized participant under published workflow. |
| `POST /api/v1/conversations/:id/report` | Abuse complaint | Reporter must have legitimate context; strict evidence review. |

A doctor being messaged does **not** grant access to the patient's unrelated clinic history or future clinical records. No default platform-admin endpoint for unrestricted private-message reading.

## 8. Anonymous public Q&A — candidate routes

| Method / path | Action | Access / redaction |
| --- | --- | --- |
| `POST /api/v1/me/questions` | Create anonymous-public question draft | Authenticated author; server stores author in separate private mapping. |
| `GET /api/v1/me/questions` | View own question statuses | Author-only; this is NOT the public projection. |
| `POST /api/v1/questions/:id/answers` | Verified doctor submits answer | Verified doctor; publication/moderation rules. |
| `GET /api/v1/moderation/questions` | Review submissions | Moderation fields minimized; author identity unavailable by default. |
| `POST /api/v1/moderation/questions/:id/decisions` | Approve/reject/hide | Authorized public-content moderator; audit. |

No public or answering-doctor response may include `authorUserId`, author email/phone/profile URL, internal mapping IDs or identifying metadata. Author notification is performed via internal protected lookup in the notification-owning path, not by adding identity to the public Q&A DTO. Public replies are general information, not medical diagnoses.

## 9. Native reviews, moderation and safe aggregates — candidates

| Method / path | Action | Boundary |
| --- | --- | --- |
| `POST /api/v1/reviews` | Post review for clinic or doctor | Check eligible completed visit/proof; do not expose another clinic's records. |
| `POST /api/v1/reviews/:id/replies` | Provider replies | Verified association to reviewed clinic/doctor. |
| `POST /api/v1/reviews/:id/report` | Report review | Rate limit and audit. |
| `GET /api/v1/clinics/:clinicId/dashboard` | Basic clinic metrics | Current clinic membership and reporting permission. |
| `GET /api/v1/platform/dashboard` | Platform aggregate metrics | Separate platform permission, minimum necessary data. |
| `POST /api/v1/platform/verification-cases/:id/decision` | Approve/reject clinic/doctor verification | Authorized verifier; retain reason/audit without exposing evidence publicly. |

One native review must not be mistaken for independent validation of medical competence; any external rating integration remains a later separately approved feature.

## 10. Security, contract and verification gates

1. Generate OpenAPI from real controllers after the schema is agreed; do not treat this proposal as executable API code.
2. Add integration tests for every protected read/write including removed staff, cross-clinic access, cross-clinic practitioner availability and role-specific projections.
3. Include database concurrency tests for simultaneous holds/confirmations and reschedules.
4. Test that public Q&A HTML, API JSON, error payloads, SEO/JSON-LD, logs and notifications never expose the anonymous author's private mapping.
5. Test chat participant access; no general admin chat-content bypass. No clinical data access implicitly granted through messaging.
6. Add idempotent notification scheduling and cancellation with no booking rollback on email/SMS failure.
7. Test validation/rate limiting, contract compatibility, session expiry/revocation, audit and safe default error responses.

**No V1 clinical or diagnostic endpoints:** any `/medical-records`, `/dental-chart`, `/treatment-plans`, `/surgery`, `/imaging-studies`, `/pacs` or payment capture routes require new accepted scope and dedicated technical/security approval.

**Related:** `BRIEF.md` (when approved), `ARCHITECTURE_TEMPLATE.md`, `02-TECH_STACK.md`, `05-DATABASE.md`, `DECISIONS.md`.
