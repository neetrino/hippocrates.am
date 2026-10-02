<!-- AGENT_SCOPE: ACTIVE | FEATURE_SOURCE: YES | AUTO_IMPLEMENT: POINT_BY_POINT | CURRENT_AUTHORITY: YES -->

> [!IMPORTANT]
> **AI AGENTS — ACTIVE PRODUCT SPECIFICATION.**
>
> This file is the canonical product for Hippocrates.am. Build it one point at a time, in the order in `docs/PROGRESS.md`. Do not treat it as optional background. Do not shrink it to a reduced first release.
>
> **Companion authority:** `docs/BRIEF.md`, `docs/architecture/adrs/ADR-003-FULL-PRODUCT-SCOPE.md`, `docs/TECH_CARD.md`, and `docs/DECISIONS.md`. If a reduced-pack sentence remains elsewhere, ADR-003 wins.
>
> Finance capture and clinical records are later points of this same product. Do not invent clinical forms or take live payments before those points have their own acceptance spec.

---

# HIPPOCRATES.AM — Canonical Product & Engineering Specification

**Version:** 3.1 | **Date:** 2026-09-30 | **Audience:** Cursor AI agents, tech lead, product owner, QA, security reviewer  
**Status:** ACTIVE. Full product. Deliver point by point. Implementation has not started.  
**Language policy:** developer artifacts, code, API contracts and test names in English; public UI uses Armenian as the default, plus Russian and English. Product-owner explanations and decisions must be presented in Armenian unless the owner requests otherwise.

> **Provenance:** This specification drew on `reference/PROJECT_OVERVIEW_V2_ORIGINAL.txt` and `reference/OOAD_ARCHITECTURE_V02_ORIGINAL.md`. The 2026-09-29 reduced pack is withdrawn.

## 0. Agent execution contract — READ FIRST

1. **No invented implementation state.** Inspect the repository, README, package scripts, migrations, CI, secrets handling, tests and infrastructure. Report verified facts before proposing changes. An uploaded requirements file is not proof that any feature already exists.
2. **No destructive or production operations without explicit approval.** No migration against production, seed into a live database, mass edit, deletion, external messaging, real payments or deployment without the owner approving the exact action. Use isolated local/staging fixtures and test providers.
3. **Do not ask the owner dozens of open questions.** Build the safe, approved foundation and present grouped unresolved business decisions with 2–3 clearly contrasted options in Armenian. Block only the specific feature requiring that decision.
4. **Do not imply medical/legal certification.** Clinical records, diagnosis automation, live diagnostic-data exchange and surgery workflow wait for the clinical point and for clinical/legal approval. Marketplace, booking and communications still require privacy and security review before production.
5. **Deliver vertical slices, not mock-only screens.** Each slice must include domain model, validated API, authorization, real persistence, UI, error handling, events if needed, tests, documentation and staging verification. Never report a slice as completed merely because pages render.
6. **Keep a living `docs/PROGRESS.md`.** Record each task as `planned / in_progress / blocked / verified`, evidence (tests, paths, migration), risks and next work. The final status must distinguish implemented, simulated and untested capabilities.
7. **Do not skip ahead.** Private text chat and anonymous public Q&A are required points. Medical images, surgical records, DICOM viewing and live payment capture are later points. Do not build a later point inside an earlier one.
8. **Security and isolation override convenience.** Never expose cross-clinic patient data, private messages, Q&A author identity or provider credentials for debugging/analytics.
9. **If requirements conflict:** explicit latest product-owner decision > original v2.0 product specification > this file's clearly flagged provisional engineering design > older v0.2 architecture proposal. Ask for owner confirmation if latest product intent cannot be established.
10. **Stop conditions:** pause affected integration/go-live on missing legal basis, clinician-approved medical templates, untested tenant isolation, unrecoverable backups, or a payment/provider contract not authorized. Continue unrelated safe slices.

### Requirement labels
- **[V2]** explicitly established in attached product specification v2.0.
- **[OWNER-HISTORY]** established in earlier Hippocrates discussions but not necessarily in v2.0.
- **[DESIGN]** proposed implementation choice, revisable by the owner/tech lead.
- **[GATE]** cannot be launched until a specified clinical, legal, provider or business decision is approved.
- **[FUTURE]** architecture accommodation only; build it on its own later point.

## 1. Product mission, boundaries and non-goals

**Mission [V2]:** A multi-organization dental and maxillofacial healthcare platform for Armenia: public discovery of clinics/doctors/services and trustworthy reviews, online appointments, clinic/doctor/patient workspaces, private doctor–patient text chat, anonymously authored public dental Q&A stored in a searchable public archive, clinic operations and platform administration.

**Product surfaces (six [V2]):**
1. **Public Space:** homepage, search/filter/rank clinics and doctors, services, Q&A archive, educational pages, about author/about project, contact and policies.
2. **Clinic Space:** each verified organization's PUBLIC website-like profile, branches, staff, pricing, reviews, equipment/material descriptions and booking CTA. Not the internal admin.
3. **Patient Portal:** identity/preferences, current/past appointments, favorites, private conversations, own questions/reviews, available payment history and notifications.
4. **Doctor Portal:** per-clinic context, schedule, appointments, messages, verified public answers, basic analytics; protected clinical workspace is [FUTURE].
5. **Clinic Management:** branches, memberships/staff, practitioner affiliations, catalog/pricing, resources/schedules, reception bookings, reviews and allowed operational reports.
6. **Platform Administration:** organization/practitioner verification, public CMS, Q&A/review moderation, subscriptions, platform-only finances and aggregated operational stats.

**Ecosystem organization types:** `DENTAL_CLINIC`, `MAXILLOFACIAL_CENTER` [V2] and `DIAGNOSTIC_IMAGING_CENTER` [OWNER-HISTORY, FUTURE]. Orthodontics, implants, pediatric dentistry, periodontics and oral surgery are specialty/service categories, not automatically different tenant types. Dental laboratories are [FUTURE]. An organization may have multiple service categories and multiple branches.

**In scope now [V2]:** the 17 product features in section 2, delivered point by point. **Later points:** digital dental chart, diagnosis and treatment records, surgical case management, automatic clinical recommendations, DICOM/PACS, diagnostic cross-organization exchange, full inventory, payroll, Google review syncing, dedicated mobile app, insurance/ArMed integrations and irreversible live financial actions. Architecture must not prevent later addition.

**No clinical decision support:** rankings display documented profiles and **patient-reported service experience**, not an objective measure of clinician skill or medical outcome; public Q&A is general information, not personal diagnosis or emergency service.

## 2. Release scope: exactly what to implement

### 2.1 Product requirements (source v2.0)

| ID | Priority | Requirement / acceptance intent | Owner context |
|---|---|---|---|
| FR-001 | Product | Public homepage, global nav, localized content, search entry, login/registration | Public/CMS |
| FR-002 | Product | Public clinic and doctor directories with multi-select filters: area/distance where permitted, specialty, services, comparative prices, ratings, availability, languages | Marketplace |
| FR-003 | Product | Public Clinic Space profile: overview, branches, practitioners, prices/services, available equipment/material claims, approved certificates, reviews, contact/map and booking CTA | Org/CMS |
| FR-004 | Product | Public doctor profile: verified vs self-entered credentials, specialties, work locations, public work contact where authorized, languages, service/price and availability | Practitioner |
| FR-005 | Product | Common service definitions and location-specific `ServiceOffering` with price, duration, conditions, practitioner(s), branch and publish lifecycle | Catalog |
| FR-006 | Product | Branch/practitioner schedules, exceptions, finite resources and availability calculation preventing overlapping confirmed allocations | Scheduling |
| FR-007 | Product | Patient/authorized reception booking, optional approval flow, hold expiry, confirm, cancel/reschedule, no-show, attendance and immutable appointment history | Booking |
| FR-008 | Product | Basic in-app/email notifications; configurable reminder templates including initial proposed 24h and 2h before visit, SMS only with configured provider/consent | Notifications |
| FR-009 | Product | Patient Portal: dashboard, upcoming/past appointments, favorites, chat, own Q&A/reviews, notifications and profile/settings | Patient |
| FR-010 | Product | Doctor Portal: own schedule and bookings in selected org, private chat, public answers, basic operational metrics | Practitioner |
| FR-011 | Product | Private patient–doctor **text** conversation can be requested directly from doctor's public profile, without mandatory prior booking [V2]. Doctor may decline/disable requests; protect against spam; no auto-export to Q&A | Messaging |
| FR-012 | Product | Anonymous-to-public question submission, private author link, moderation, verified doctor answers and author notifications | Public Q&A |
| FR-013 | Product | Dedicated public searchable permanent Q&A archive, subject categories, answered/unanswered filters, safe public SEO, hidden author from public **and responding doctors** | Public Q&A |
| FR-014 | Product | Internal first-party reviews for doctor/clinic after verified attendance, review replies and fair dispute process; off-platform proof reviewed separately | Reviews |
| FR-015 | Product | Clinic Management basic branches, staff and delegated permissions, patients' **operational** records, offerings, calendars, appointments, reviews and basic metrics | Org/Booking |
| FR-016 | Product | Platform Admin verification, public CMS, moderation, plan visibility, platform stats, audit and organization lifecycle | Admin |
| FR-017 | Product | Registration and verification workflows for organizations and professional profiles, expiry/revocation handling | Verification |

**Acceptance:** Every FR-001…017 implemented end-to-end with functioning persistence/API/permissions, tested in staging with representative non-production data; no unsupported claims of clinical software readiness. A CLI script or documentation alone does not satisfy an FR.

### 2.2 Phase 2 [V2], only after owner approval
Advanced multi-branch/staff permissions; full operational finance and **real** online payments/refunds; advanced reporting; external third-party review integrations *only under provider API/content terms*; permitted secure file transfer; push/SMS extensions; commercial subscription lifecycle. Basic Product plan visibility does not imply production billing automation.

### 2.3 Phase 3 [V2 + OWNER-HISTORY], future gated clinical ecosystem
Protected medical records, dental chart and clinical notes; treatment plans; surgery and postoperative workflows; diagnostic centers, doctor referrals, CT/CBCT/OPG scheduling, imaging studies/reports, permissioned return of results; lab orders; later telehealth, permitted existing clinic/ArMed integrations. Formal clinical data workflows, provider contracts, medical-document legal retention, lawful data processing/location and DICOM/FHIR integration design require separate signed-off specifications. **Do not create clinical forms from assumptions.**

### 2.4 Explicit conflict resolutions; owner approval still needed
- **Chat gate:** v2.0 explicitly permits new private requests directly from doctor profile, so no booking prerequisite. Earlier booked-only assumption is superseded; doctor opt-out/anti-spam [DESIGN].
- **Deposits:** v2.0 describes optional deposits during booking but puts real payment integration on the finance point. Booking may show `DEPOSIT_REQUIRED_MANUAL` / record off-platform payment verification ONLY with clinic's approved procedure; no mock checkout presented as real. Default to **no required online prepayment** until payment gateway, refund handling and agreements approved.
- **Diagnostic priority:** user previously emphasized external CT center integration, but newest v2.0 stages it in Phase 3. Keep complete extension boundaries and explicit `DEC-003` in decision log: may be moved forward for an approved pilot; do not implement live exchange in Product by assumption.
- **Clinic finances:** Product presents price and basic booking/admin metrics; advanced financial ledger and online checkout start in Phase 2. Do not confuse patient-paid clinical fees with Hippocrates subscription invoices.
- **Promotion:** earlier concept considered paid placement for similarly rated clinics. This is not an approved feature in v2.0; store no invisible paid boosts. Any future ads must be plainly labeled, never blended into clinical-quality claims.
- **Medical notes:** v2.0 places them on the clinical point. Do not pretend an earlier point is a compliant EHR.

## 3. Actors and authorization boundaries

| Actor | Product capabilities | Must NOT receive by default |
|---|---|---|
| Anonymous visitor | Search/read published profiles, browse moderated Q&A | Patient details, Q&A author mapping, private conversations |
| Patient account | Own bookings/profile/preferences/favorites, chat, Q&A, reviews | Another patient's records or internal clinic finance |
| Practitioner | Own verified public profile, per-organization work context and messages, public Q&A answers | All clinics' schedules or patient charts |
| Receptionist | Assigned branch booking and permitted minimal contact info | All organizations' appointments, private chat, future clinical notes |
| Organization admin / owner | Permitted organization setup, employees, branches, catalog, calendars and business dashboards | Other organizations' internal data; unrestricted clinical records |
| Finance staff | Authorized clinic financial fields if Phase 2 enabled | Medical notes, unrelated tenant payments |
| Platform moderator | Public listing, Q&A, review complaints based on redacted reports | Full private chats, anonymous author mapping by ordinary moderation routes |
| Platform superadmin | Platform/org lifecycle, approvals, abuse and platform-only billing | Blanket access to patient clinical content, private messages or all tenant finance |
| Imaging center admin / technician / radiologist | [FUTURE] scoped diagnostic workflows, appropriate read grants | Entire referring clinic medical record |
| Legal representative | [FUTURE] verified, limited permitted representation | Automatically all patient records merely due to relationship |

**Model:** one `UserIdentity` (login), separate `Patient` profile, `Practitioner` profile and `OrganizationMembership` (role + branch scope + active interval). The same user can be patient and doctor. A practitioner can belong to multiple clinics. Local `OrganizationPatient` links are distinct; **never merge unrelated patients solely by name/phone**. Authorization uses active session + tenant + membership/ownership + action + resource scope and lawful purpose where required. Re-check server-side on **every** read, mutation, download and subscription update.

## 4. Domain ownership: bounded contexts

Each module is the only authoritative writer of its aggregates. Other modules access it through an explicit application contract or its published **non-sensitive** event/projection; never update its tables directly. Shared physical Postgres does not imply shared write ownership.

| BC | Module (owner) | Core entities | Commands | Emitted events | Release |
|---|---|---|---|---|---|
| 01 | Identity & Access | UserIdentity, Session, Membership, RoleAssignment | signIn, inviteMember, changeRole, revokeSession | `identity.user.created.v1`, `identity.membership.changed.v1` | Product |
| 02 | Organizations | Organization, Branch, VerificationCase | registerOrg, verifyOrg, addBranch, suspendOrg | `organization.verified.v1`, `organization.suspended.v1` | Product |
| 03 | Practitioners | Practitioner, Credential, Affiliation, Specialty | verifyPractitioner, affiliate, changeStatus | `practitioner.verified.v1`, `affiliation.changed.v1` | Product |
| 04 | Patient Registry | Patient, OrganizationPatient, ContactPreference | registerPatient, linkPatientToOrg, updateOwnInfo | `patient.registered.v1` (no patient demographics) | Product |
| 05 | Service Catalog | ServiceDefinition, ServiceOffering, OfferingVersion | publishOffering, updateOffering, archiveOffering | `catalog.offering.published.v1`, `catalog.offering.changed.v1` | Product |
| 06 | Scheduling | WorkSchedule, ScheduleException, Resource, SlotHold, ResourceReservation | computeAvailability, placeHold, consumeHold, release | `scheduling.hold.expired.v1` | Product |
| 07 | Appointments | Appointment, AppointmentEvent, AttendanceEvidence | request, confirm, cancel, reschedule, checkIn, complete | `appointment.confirmed.v1`, `appointment.completed.v1` | Product |
| 08 | Marketplace | PublicListing, ListingProjection, SearchProjection | indexPublicData, search, compare | `listing.updated.v1` | Product |
| 09 | Messaging | Conversation, Message, MessageReadReceipt | requestConversation, accept, send, close, block | `message.sent.v1`, `conversation.requested.v1` | Product |
| 10 | Public Q&A | Question, Answer, Category, PrivateQuestionAuthor | submitQuestion, moderate, publishAnswer, close | `qa.question.published.v1`, `qa.answer.published.v1` | Product |
| 11 | Reviews | ReviewEligibility, Review, ReviewReply, ReviewCase | grantEligibility, publishReview, respond, dispute | `review.published.v1` | Product |
| 12 | Notifications | Notification, Template, DeliveryAttempt, Preference | queueNotification, deliver, retry | `notification.delivery.updated.v1` | Product |
| 13 | Clinic Operations | LocalPatientNote (organizational only), OperationalDashboard | recordReceptionNote, summarize | `operations.summary.updated.v1` | Early point |
| 14 | Platform Administration & CMS | CMSPage, ModerationCase, PlatformPlan | publishPage, approveOrg, resolveReport | `cms.page.published.v1` | Product |
| 15 | Clinic Finance | Estimate, Invoice, Payment, Refund | invoice, settle, refund | `finance.payment.settled.v1` | Phase 2 |
| 16 | SaaS Billing | Subscription, Plan, PlanEntitlement | subscribe, bill, cancel | `saas.entitlement.changed.v1` | Finance point |
| 17 | Clinical Records | Encounter, ClinicalNote, DentalChartEntry, ClinicalAttachment | openEncounter, signNote, appendCorrection | `clinical.encounter.closed.v1` | Phase 3 [GATE] |
| 18 | Care & Surgery | TreatmentPlan, PerformedProcedure, SurgicalCase | proposePlan, recordProcedure, runSurgery | `care.procedure.recorded.v1` | Phase 3 [GATE] |
| 19 | Diagnostic Referral & Imaging | Referral, DiagnosticOrder, ImagingStudy, DiagnosticReport | issue, accept, perform, release | `diagnostic.report.released.v1` (IDs only) | Phase 3 [GATE] |
| 20 | Integration & Reporting | OutboxEvent, InboxReceipt, AnalyticsProjection | publish, project, retry | internal integration | Cross-cutting |
| 21 | Security Policy & Audit | AccessGrant, ConsentRecord, AuditEvent | evaluate, grant/revoke, appendAudit | `security.grant.revoked.v1` | Product framework; richer Phase 3 |

**Naming:** API/domain uses `Practitioner`; user-facing text is “Doctor”. `Clinic` is one type of `Organization`. `ServiceDefinition` is an abstract catalog entry; `ServiceOffering` is a **specific clinic/branch** offering with versioned price/duration. `Appointment` is not `Encounter`. `Referral`, `ImagingStudy` and `DiagnosticReport` are separate.

## 5. Core object relationship contract

| From | Relationship | To | Mandatory invariant |
|---|---|---|---|
| Organization | 1 → 0..* | Branch | A branch belongs to exactly one org; branch ID is mandatory for branch-scoped bookings |
| UserIdentity | 1 → 0..* | Membership | Membership includes org, role, scope and active state |
| Practitioner | 1 → 0..* | Affiliation | Affiliation belongs to exactly one practitioner and one branch/org |
| ServiceDefinition | 1 → 0..* | ServiceOffering | Prices, duration and availability belong to offering; listing shows price caveats |
| ServiceOffering | 0..* ↔ 0..* | Affiliation | Only verified/active eligible practitioners can be shown as providing offering |
| Patient | 1 → 0..* | Appointment | Appointment must have patient or validated reception provisional patient |
| Appointment | many → 1 | Offering version | Snapshot accepted price, duration, branch, practitioner and policy at booking time |
| Appointment | 1 → 0..* | ResourceReservation | All required scarce resources allocated atomically before CONFIRMED |
| Practitioner | 1 → 0..* | WorkSchedule | Per-affiliation schedule; global time collisions prohibited without cross-clinic PHI disclosure |
| Appointment | 0..1 → 0..1 | Encounter | Appointments can end in no-show; walk-ins can have Encounter without appointment [FUTURE] |
| Question | 1 → 1 PRIVATE link | PrivateQuestionAuthor | Public question/answer payload never serializes author key/identity |
| Question | 1 → 0..* | Answer | Only verified practitioner may publish answer; moderated separately |
| Appointment / verified offline visit | 1 → 0..* | ReviewEligibility | Max one eligible review **per target** (doctor vs clinic) per verified visit |
| Conversation | 1 → 2 participants (Product) | Patient + Practitioner | Private contents never feed public Q&A or analytics text |
| Referral | 1 → 0..* | ImagingStudy | Request is not proof imaging was performed [FUTURE] |
| ImagingStudy | 1 → 0..* | DiagnosticReport versions | Report SIGNED/RELEASED independent of study COMPLETED [FUTURE] |

**Identifiers:** UUID; immutable createdAt, updatedAt where appropriate, optimistic version for contested writes; public slugs must not act as access credentials. Public projections are explicit allowlists rather than full-domain `SELECT *` JSON serialization.

## 6. State machines and guarded transitions

### 6.1 Organization / professional verification
- `Organization: DRAFT → SUBMITTED → UNDER_REVIEW → VERIFIED → ACTIVE`; variants `REJECTED` (with reason), `SUSPENDED`, `ARCHIVED`.
- `Credential: UNVERIFIED → UNDER_REVIEW → VERIFIED | REJECTED`; later `EXPIRED | REVOKED`.
- `Affiliation: INVITED → ACTIVE → SUSPENDED | ENDED`.
- Only platform verification authority can grant verified badges; verified is **not** a promise of clinical quality. If an org or required credential is suspended, future bookable offerings become unavailable according to approved cancellation/continuity policy; retain historical records.

### 6.2 Offering / schedule / booking
- `ServiceOffering: DRAFT → PUBLISHED ↔ PAUSED → ARCHIVED`.
- `SlotHold: ACTIVE → CONSUMED | EXPIRED | RELEASED`; TTL must be explicit and configurable [DESIGN default 5 minutes, owner may change].
- `Appointment: REQUESTED → CONFIRMED | REJECTED | CANCELLED`; direct book `CONFIRMED` only when policy allows and resources allocated. `CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED`; `CONFIRMED → CANCELLED | NO_SHOW | RESCHEDULED` and controlled `CHECKED_IN → CANCELLED` with reason if visit cannot proceed. UI may show `HELD` while an independent hold exists; do **not** store contradictory `HELD` appointment and hold records.
- **Reschedule algorithm:** reserve new resources with the original appointment locked; commit new allocation and release old in the **same transaction** or keep old booking if new reservation fails. Record immutable `AppointmentEvent`; if audit requirements demand a new appointment record, maintain linked `rescheduledFromId` and close old only after new confirmed.
- `Appointment COMPLETED` means administratively finished; if no Clinical Records module is enabled, NEVER create simulated Encounter or medical findings. Review eligibility based on reliable attendance evidence and configured clinic verification.

### 6.3 Messaging
- Conversation lifecycle: `REQUESTED → ACTIVE → CLOSED`; exceptional `BLOCKED`; reopening `CLOSED → ACTIVE` if allowed.
- Reply-waiting indicator: `awaiting = DOCTOR | PATIENT | NONE` **separate** from lifecycle; UI maps to v2 labels “Waiting for Doctor/Patient”.
- Doctor may disable incoming requests or rate-limit without exposing a patient’s health status. Content of private chat may contain sensitive data and requires strict access control even if not an EHR.

### 6.4 Public Q&A
- `moderationStatus = PENDING | APPROVED | REJECTED | HIDDEN`; `threadStatus = OPEN | CLOSED`; `archived = true/false` after policy review. A question becomes publicly visible only when APPROVED and not HIDDEN; “ANSWERED” is a **derived** count of published doctor answers, not a separate independently writable state.
- On submit, sanitize/redact obvious identifiers, route uncertain posts to human review and publish only redacted/approved content. Do not claim reliable automatic anonymization. Doctor never receives patient account ID through Q&A read endpoints, events, telemetry, or notification payloads.
- Doctors must have `Credential.VERIFIED` to publish answers, and answers have independent moderation as configured. Public answers cannot be auto-merged into private chat.

### 6.5 Reviews
- `ELIGIBLE → SUBMITTED → PENDING_MODERATION → PUBLISHED | REJECTED | HIDDEN`; a dispute opens `UNDER_REVIEW` metadata and preserves moderation trail. Do not remove a review solely because its rating is low. Internal review and third-party external rating **must never be merged into one unattributed figure**.
- Default sort/ranking: transparent relevant filter + confidence-aware internal review aggregation [V2 intent; algorithm weights / publication must be owner approved]. If paid placements added in future they are conspicuously labeled and excluded from the organic score.

### 6.6 Future medical/diagnostics (model only; do not code full workflows in Product)
- `ClinicalNote: DRAFT → SIGNED` with explicit append-only signed amendment instead of overwrite.
- `TreatmentPlan: DRAFT → PROPOSED → ACCEPTED | DECLINED → ACTIVE → COMPLETED | DISCONTINUED`; patient consent to a procedure is separate from quote acceptance.
- `Referral: DRAFT → ISSUED → ACCEPTED → SCHEDULED → PERFORMED → CLOSED`, with declined/cancelled branches.
- `ImagingStudy: REGISTERED → IN_PROGRESS → COMPLETED | ABORTED`; `Report: DRAFT → REVIEW → SIGNED → RELEASED`; a signed amendment is a new version. A completed scan is not a released report.
- `AccessGrant: REQUESTED → GRANTED → REVOKED | EXPIRED`, or `REQUESTED → DENIED`; legal bases other than consent must be modeled separately after counsel review.

## 7. Critical cross-module workflows

### WF-01 Organization onboarding and public publishing
1. Owner registers legal organization in DRAFT; create owner membership and audit record.
2. Upload minimal verification evidence to PRIVATE storage and submit case; platform verifier reviews; no blanket clinical access.
3. After approval create branches, invite staff, link or register practitioners, verify individual credentials/affiliations, create offerings and schedules.
4. Publish profile only when all fields and legal/verification preconditions are satisfied; marketplace reads a **public allowlisted projection**.
5. On suspension, hide future booking UI appropriately, inform existing bookings according to policy, **never erase past appointment/audit records**.

**Failure cases:** duplicate org registration, forged documents, expired credentials, missing branch, unverified doctor, stale index. Build tests and a human exception queue.

### WF-02 End-to-end booking (the primary Product transaction)
1. Visitor searches an approved offering/doctor/branch; booking queries authoritative availability, not the search-index cache.
2. Check both affiliation schedule and globally reserved practitioner busy times, plus branch room/chair/equipment requirements. The global busy-time check exposes `BUSY/FREE`, **not another clinic’s patient details**.
3. Patient (or authorized receptionist) selects time; Scheduling places TTL hold across **all** required resources with a unique idempotency key. Competing requests cannot both hold the same resource/time.
4. Patient authenticates or reception uses limited local patient intake. Validate eligibility, price/duration snapshot, branch, resource allocation and policy.
5. `confirmAppointment()` in one transactional boundary consumes hold, writes Appointment + resource reservation(s) + AppointmentEvent + OutboxEvent. Confirm/reject according to clinic policy. Return only committed result.
6. Notification worker consumes outbox, creates idempotent delivery attempts; provider outage must not roll back committed Appointment.
7. Reception check-in; clinic records administrative completion/no-show. Emit event; Review module grants eligibility only with checked attendance proof.
8. Rescheduling is atomic: do not release existing confirmed reservation if acquiring replacement fails; send proper notifications after commit.

**Mandatory concurrency acceptance test:** 25 parallel patients attempt last free slot for the same global practitioner and chair; **exactly one** confirmed appointment can reserve it. Repeat across two organizations employing same practitioner; neither sees the other clinic’s patient data. Test expired hold re-availability and time zone/DST normalization (store UTC; render by branch IANA time zone, default Armenian branches `Asia/Yerevan`).

### WF-03 Doctor-profile initiated private messaging
1. Patient opens approved doctor public profile and requests text conversation even with no Appointment [V2].
2. Apply session check, doctor messaging availability, per-user rate limit, block/abuse checks and consent to messaging rules.
3. Doctor accepts/declines. Only participants receive authorized message/history queries and unread notifications.
4. Doctor may suggest booking by link. No message content is sent to the public Q&A index; logging masks sensitive payloads.
5. Closing and blocking preserve allowed audit/history under approved retention policy, not unconditional deletion.

### WF-04 Anonymous public Q&A and independent archive
1. Signed-in user submits question/category; owner link stored in a separate private mapping inaccessible through public data interfaces.
2. Detect obvious personal identifiers in title/body; apply human moderation for uncertain content; reject/return for edits without public author leakage.
3. After approval publish a **sanitized** `PublicQuestionView` with stable URL and category index. No author name/photo/contact/profile link, even to responding doctors.
4. Verified practitioner submits general informational answer; moderator policy checks and publishes; notify **author through a private internal routing service**, never pass identity into public Q&A payloads.
5. Display question + all published doctor answers in searchable independent archive. `answered` is derived; thread may close/hide/archive via documented rules.
6. Security tests check API JSON, search index, structured data, sitemaps, browser DOM, logs and notifications for author identifiers or sensitive residual text.

### WF-05 Ratings and trustworthy ranking
1. Confirmed completed/verified offline visit gives at most one review opportunity **per target** (doctor and clinic counted separately).
2. User submits service-experience review with proper category, optional response and report path; handle abusive content and potential clinical secrets in free text before public exposure.
3. Publish moderated first-party review and aggregate sample count/confidence; do not fabricate “top doctor” medical quality metric.
4. External provider reviews [Phase 2] are separate with displayed provenance and current provider policy.

### WF-06 Diagnostic collaboration [FUTURE; no Product live exchange]
Physician creates consent/lawful-basis-gated referral → patient selects diagnostic center/scan service → imaging center accepts and schedules device/staff → performs study and records secure file references → specialist signs report → report is released **only after a fresh authorization check** to an approved recipient → audit every disclosure. `Referral`, `Study`, `DiagnosticReport`, `AccessGrant` are separately owned; no private medical data in general event payloads. Technical modeling may follow FHIR ServiceRequest / ImagingStudy, and DICOM for imaging, but standards compatibility needs dedicated implementation design and testing.

## 8. Engineering architecture and operational design [DESIGN]

### 8.1 Baseline technology (adapt to pre-existing repo, do not overwrite working stack)
- **Frontend:** Next.js App Router + React + TypeScript; public SEO pages via appropriate server rendering, secure server components and localization framework; HY default, RU/EN content when supplied.
- **Backend:** NestJS TypeScript modular monolith with one module per bounded context; contract-driven application services; no business policy embedded only in React components.
- **Persistence:** PostgreSQL with Prisma, transactional writes and migrations; one shared logical DB for Product, explicit tenant scoping of all nonpublic operational data. Use platform-controlled schema migration gates; test restore.
- **Async:** Redis-backed queue only for noncritical delayed side effects (reminders, search projection, external API retries). Business correctness must not depend on queue uptime. DB transactional outbox + inbox deduplication.
- **Storage:** private S3-compatible object storage with server-mediated short-lived signed URLs, content-type and malware-scan policy before public publication, versioning/retention where appropriate; separate public CMS assets from private verification documents.
- **Infrastructure:** reproducible local compose for Postgres/Redis/mock mail; isolated staging and prod environment files. Deployment provider is **unresolved**: do not assume Vercel/Hetzner/Cloud Run as a product decision without repo/owner evidence.
- **Observability:** structured redacted logs, tracing/correlationId, metrics, failure alerts, audit ledger separated from analytics.

### 8.2 Suggested monorepo tree (only for greenfield; adapt if repo already exists)
```text
hippocrates/
  apps/web/                 # Public Space + patient/doctor/clinic/admin route groups
  apps/api/                 # NestJS bounded contexts: src/modules/<context>/
  apps/worker/              # outbox notifications/indexing, independent consumer
  packages/contracts/      # shared typed API/event contracts (no direct ORM sharing)
  packages/ui/             # UI primitives/localization styles, no medical business logic
  docs/                    # specs, ADRs, workflow diagrams, progress, tests
  prisma/                  # schema/migrations, migration checks and local fixtures
  infra/                   # compose, staging manifests, backup/recovery guides
  .cursor/rules/hippocrates.mdc
  .env.example             # variable names only; never credentials
```
**Do not split into microservices for speculative traffic.** Separate independent deployment later only on measured operational need and tested data contract.

### 8.3 Module interaction rules
- Synchronous calls for immediate validated decisions: `Booking → Scheduling`, `Booking → Catalog`, `Authorization → Membership`, `Marketplace → Public projections`.
- Async events for independent consequences: `Booking confirmed → notifications, public availability projection, operational stats`; `Review published → search index`; `Answer published → private author notification`.
- Shared app DTOs are **allowlisted**; event envelope: `{eventId, type, version, aggregateId, organizationId?, occurredAt, correlationId}` plus only authorized non-sensitive event data. Consumers fetch restricted details through domain APIs with fresh authorization.
- Web/API reads must enforce denial by default on tenant scope. Foreign-key integrity and DB constraints are defense in depth, not substitute for authorization.
- Every write endpoint that can be retried receives an idempotency key; consumer inbox stores `(consumerName, eventId)` unique receipt. Provider notifications deduped per event, recipient and channel.
- No shared writable `utils` domain. No “admin bypass” endpoint retrieving all clinic records.

### 8.4 Booking race safety pattern
- `SlotHold` stores TTL, patient/request id, all required normalized resource IDs including a cross-clinic pseudonymous practitioner resource; pending holds participate in exclusion checks.
- In Postgres, enforce time-range collision per reservable resource with exclusion constraint (`resource_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&`) for ACTIVE/CONFIRMED resource reservation rows or an equivalent proven atomic locking approach; add `btree_gist` as needed and test migrations under concurrency.
- Protect against transaction retries, expired holds and worker replays. The transaction should not depend on Redis lock as the *sole* safety mechanism.
- A clinic may see another affiliation's **busy-only** status for the same doctor, not its appointment/patient/clinic metadata.

### 8.5 Public SEO, content, localization and search
- Armenian default locale; RU/EN route scaffolding but no machine-translated medical claims as if clinician-reviewed.
- Only approved public profile/QA/content entities indexed; hidden/rejected/noindex content must disappear from public search, robots and caches upon moderation changes.
- Page slugs version-safe; full-text matching must not inadvertently index private messages, patient contact notes or Q&A author linkage.
- External map/geolocation optional based on provider contract; distance search requires lawful location permission and honest fallback.
- Distinguish paid advertising from organic rank; future sponsorship feature cannot modify core quality-like score invisibly.

## 9. Non-functional requirements & safety gates

| NFR | Observable acceptance / verification |
|---|---|
| Tenant isolation | Automated matrix test: actor from Org A cannot access Org B private objects by guessing IDs, listing, downloads, websockets, batch API or job payload |
| Least privilege | Reception/admin/moderator/superadmin negative access tests including Q&A private author map and private chat |
| Confidentiality | Encrypt transport & storage where supported; private signed URLs expire; redact sensitive fields from logs, search index, analytics and third-party providers |
| Availability | Recover from crashed worker without losing confirmed appointments; reminder outage visible/retryable, not silent data corruption |
| Backups/restore | Automated encrypted backups and **demonstrated** restore in isolated environment before production; recovery targets chosen in DEC log |
| Performance | Measure under representative pilot traffic; do not assert unsupported SLOs. [DESIGN] provisional target p95 public-search API < 600 ms at agreed pilot load, to be validated |
| Accessibility | Aim for WCAG 2.2 AA for public booking and forms; keyboard usability, meaningful errors, contrast and mobile responsiveness |
| Data minimization | Do not collect diagnoses for simple booking. Allow patient to review privacy/retention policy. Marketing analytics contain no personal medical content |
| Localization | HY default; RU/EN consistent formatting and untranslated-content fallback; TZ stored UTC, rendered by branch IANA zone |
| Moderation | Unreviewed public Q&A never published; report/appeal trail exists; negative reviews not deleted solely for negativity |
| Audit | Who/when/where/action/requestId recorded for security-sensitive reads/changes; append-only protected trail without unnecessary medical payload |
| Security gate | Documented threat model, dependency review, secrets scanning, rate limiting, input validation, least-privileged DB/app creds, incident runbook |
| Privacy/legal gate | Armenian-qualified legal review: role of parties, lawful basis, health/confidential data, cross-border hosting/providers, retention, processor agreements and communications rules; do not claim automatic HIPAA applicability |
| Clinical gate | Clinician-validated forms/workflows & safety signoff prior to Clinical/Diagnostics/Surgery production; no auto-diagnosis |

**Official design references (not proof of regulatory compliance):** Armenian Law on Personal Data Protection and Law on Medical Care/Service (check latest consolidated ARLIS text with counsel); OWASP ASVS; HL7 FHIR ServiceRequest/ImagingStudy; DICOM for medical imaging. Links and verification tasks in `docs/REFERENCES.md`.

## 10. API contract skeleton (provisional; version `v1`)

| Method/path | Actor | Command/query and rules | Response notes |
|---|---|---|---|
| `POST /v1/auth/register` | Public | Register verified email/phone per selected auth policy | Never expose credential existence detail |
| `POST /v1/orgs` | Authenticated owner | Start tenant DRAFT + owner membership | `201` with org ID |
| `POST /v1/orgs/{orgId}/verification` | Owner | Submit **private** verification documents | `202` review pending |
| `POST /v1/admin/verifications/{id}/decision` | Platform verifier | Approve/reject with evidence and audit | Required policy/role guard |
| `GET /v1/clinics` | Public | Allowlisted filters/pagination/safe ranking | Only `PUBLIC` fields |
| `GET /v1/practitioners` | Public | Verified status/specialty/branch filters | Do not imply clinical-quality sorting |
| `GET /v1/offerings` | Public | Branch-practitioner-offering published catalog | Price caveat and version |
| `POST /v1/branches/{id}/offerings` | Clinic manager | Publish draft only if org and practitioner prerequisites valid | Authoritative catalog write |
| `GET /v1/availability` | Public | Consult authoritative schedules, TTL and all required resources | Availability is not reservation |
| `POST /v1/booking/holds` | Patient/reception | Attempt atomic hold; idempotency key | `201 hold`, `409 SLOT_UNAVAILABLE` |
| `POST /v1/appointments` | Patient/reception | Confirm with hold token, patient and consent to booking terms | `201` committed appointment, no fake success |
| `PATCH /v1/appointments/{id}/reschedule` | Authorized actor | New slot atomic swap + appointment event | Conflict `409`, policy reason |
| `POST /v1/appointments/{id}/check-in` | Reception | Record attendance with audit | No automatic clinical diagnosis |
| `GET /v1/patient/appointments` | Own patient | Private list | Tenant-safe projection |
| `POST /v1/conversations/requests` | Patient | Initiate doctor chat without booking if doctor accepts new requests | anti-spam controls |
| `POST /v1/conversations/{id}/messages` | Participant | Send text within policy | strict participant validation |
| `POST /v1/qa/questions` | Patient | New question stored private pending moderation | No author ID in public DTO |
| `GET /v1/qa/questions` | Public | Only approved/sanitized public records | Derived `answerCount` |
| `POST /v1/qa/questions/{id}/answers` | Verified practitioner | Subject to publication moderation | No private author details |
| `POST /v1/reviews` | Patient | Visit-proof eligible clinic or doctor review | max one per visit per target |
| `POST /v1/admin/moderation/{id}/decision` | Moderator | Publish/hide/reject with audit and policy | Cannot blanket read private messaging |

**Envelope:** `{ data, meta: { requestId, pagination? } }`; errors `{ error: { code, message, details? }, requestId }`. Errors never contain another tenant's object existence or personal details. Standard codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`, `SLOT_UNAVAILABLE`, `INVALID_STATE`, `VERIFICATION_REQUIRED`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`. Avoid large speculative endpoint generators; define DTO/OpenAPI and contract tests as each slice is built.

## 11. Non-destructive implementation plan — vertical slices

**Execution flow:** discovery/repo audit → safe migrations and foundations → thin public/admin vertical features → booking invariants → portals/chat/Q&A/reviews → staging full walkthrough → security/legal go-live gate. For every slice: plan, schema & constraints, API, UI, tests, negative authorization checks, i18n, audit, docs, screenshot or manual test evidence, PR review.

| Slice | Concrete done definition | Depends on |
|---|---|---|
| S0 Audit & foundation | Document actual repo topology, scripts/tests/deploy, source gap matrix; establish PR/branch, isolated local fixtures, OpenAPI contract, ADRs, CI and no-prod protections | none |
| S1 Identity/tenant | Register/sign in or adopted provider, scoped memberships, sessions, platform/clinic roles, tenant denial tests, audit | S0 |
| S2 Organizations & verification | Org + branch CRUD, owner invitation, staff scopes, private verification review, platform approval, public visibility policy | S1 |
| S3 Practitioner + catalog + public | Professional credentials/affiliations, service definitions/offerings, public clinic/doctor profile and search with filters, HY/RU/EN structure | S2 |
| S4 Resource scheduling + booking | Work schedules/exceptions, atomic holds, cross-org practitioner conflict, request/confirm/cancel/reschedule/check-in/admin completion, race tests | S1–S3 |
| S5 Patient/doctor/clinic portals + notifications | Operational dashboards, appointment history, favorites, branch reception controls, configurable reminders, durable job retries | S4 |
| S6 Private chat | Profile-initiated request, doctor accept/disable, thread state and waiting marker, notifications, harassment/report path, private access tests | S1, S3, S5 |
| S7 Anonymous Q&A + archive | Private author mapping, prepublication PII review, doctor verification, multiple moderated answers, public archive/SEO, anonymous leakage tests | S1, S3 |
| S8 Reviews + admin CMS + acceptance | Attendance eligibility, first-party reviews and replies, moderation cases, confidence-aware ranking **only after owner approves formula**, policies/about pages, integrated E2E/staging/security tests | S3–S7 |
| S9 Go-live gate | Legal/provider agreements as needed, tenant audit, threat model, restored backup, load/UX pilot, runbook, deployment owner approval; if gate missing, do not launch | S0–S8 |

**Phase 2 sequence:** contract approved → financial model and refunds → gateway sandbox → live payments after approval → advanced clinic dashboards and reporting → subscriptions/provider review connectors. **Phase 3:** clinical data decision & clinician co-design → legally supported data model, medical record lifecycle and signed notes → referral/diagnostic partner pilot → imaging integration → surgical and lab workflows. Each Phase 3 activity requires its own acceptance spec; do not extrapolate from booking.

## 12. Test matrix / quality gate (minimum evidence, not optional)

| Test ID | Behavior | Expected result |
|---|---|---|
| AT-001 | Guest opens unpublished/suspended doctor or clinic URL | No false verified/bookable claim, consistent 404/unavailable |
| AT-002 | Practitioner serves Org A and Org B | Separate memberships, proper per-org schedule, no Org A patient leakage |
| AT-003 | Org A receptionist guesses Org B booking ID | Denied without existence/data disclosure and protected audit |
| AT-004 | 25 concurrent hold/confirm attempts for last chair+doctor slot | At most one valid confirmed allocation; deterministic conflicts |
| AT-005 | Existing booking rescheduled to newly occupied time | Existing booking remains valid; failed attempt audited |
| AT-006 | Temporary hold expires; worker delayed | Slot becomes bookable with DB-backed expiry, no double confirmation |
| AT-007 | SMS/email provider unavailable on successful booking | Appointment remains confirmed; retryable delivery/error visible |
| AT-008 | Patient requests doctor chat without booking | Allowed when doctor's messaging setting permits and abuse checks pass |
| AT-009 | Nonparticipant or clinic admin opens private conversation | Forbidden; no content or metadata beyond permitted admin incident summary |
| AT-010 | Public Q&A question with pasted name/telephone/images | Never published unreviewed; ask removal/redaction; author hidden in all public surfaces |
| AT-011 | Verified doctor answers anonymous question | Public answer contains doctor public profile; author identity remains private |
| AT-012 | Suspended/unverified doctor attempts public answer | Rejected by server guard and recorded |
| AT-013 | Review before verified visit or duplicate same target | Rejected; different allowed targets handled according to policy |
| AT-014 | Critical negative review with no policy violation | Cannot be removed purely due to rating; dispute trail retained |
| AT-015 | Search ranking with few perfect reviews vs established samples | Confidence-aware method test uses owner-approved formula; not assumed automatic |
| AT-016 | Doctor credential revoked / org suspended | Future public booking removed, prior events preserved, outstanding appointments enter approved handling queue |
| AT-017 | Q&A content hidden after publication | Removed from public API, index, cached routes, sitemap after bounded invalidation |
| AT-018 | Patient account exists without clinic membership | Can browse/book but cannot enter clinic backoffice |
| AT-019 | Platform superadmin probes private clinical data / chats | Denied by default, no magic bypass |
| AT-020 | Staging DB restored from encrypted backup | Verified record counts and tenant separation, restore playbook updated |
| AT-021 | Replay outbox event twice | No double reminder / review grant / invoice |
| AT-022 | Public search and analytics tracing | No patient contacts, private author maps or health content in logs/index |
| AT-023 | Locale and timezone | Armenian default, translated navigation/fallbacks, UTC-safe booking across branch timezones |
| AT-024 | End-to-end pilot | Patient finds verified clinic → doctor/service → books → receives reminder → check-in → completed visit → submits review; private chat/Q&A independently verified |

Require unit tests for state transitions, policy authorization, date/time calculations; integration tests for DB constraints and worker idempotency; Playwright E2E across patient/doctor/reception/moderator; security regression tests for all tenant-specific list/details/download/websocket surfaces. Run lint/typecheck/migrations/unit/integration/e2e on CI per environment. **If a test cannot be run, report it as unverified, never mark green.**

## 13. Release gates, observability and real-project definition

**Development-complete** means working slices and tests with seeded fictitious users only. **Staging-ready** means environment-specific config, monitoring, seeded demo workflows, backup restore and security review. **Production-ready** requires owner approval, qualified local legal review and responsible provider contracts for actual data, incident response, DPA/vendor due diligence, moderated public policies, real verification operating procedures, accepted pilot workflows and recovery rehearsal.

A genuine project is **not** complete if it has only mock interfaces, copied UI diagrams, TODO endpoints, placeholder providers, untested migrations, unscoped admin endpoints or manual spreadsheet data replacing required persistent operations. Document nonimplemented integrations as `NOT_IMPLEMENTED` with an explicit gate.

**Output expectations for Cursor on each PR:** exact changed paths, behavior delivered, migrations and rollback strategy, tests actually executed with results, security impact, unresolved decisions and next slice. Avoid any production writes or deployment unless separately instructed and approved.

## 14. Requirement-to-test traceability (summary)

- FR-001/002/003/004/005 → S2/S3 → AT-001/002/015/023/024.
- FR-006/007 → S4 → AT-002/003/004/005/006/016/024.
- FR-008/009/010 → S5 → AT-007/018/021/023/024.
- FR-011 → S6 → AT-008/009/019.
- FR-012/013 → S7 → AT-010/011/012/017/022.
- FR-014 → S8 → AT-013/014/015/024.
- FR-015/016/017 → S1/S2/S8 → AT-001/003/016/018/019/020.

Detailed decision register, user-facing Armenian overview, diagram sources, Cursor kickoff and legal reference index ship beside this master file. When implementation reveals a necessary deviation, write an ADR and update this master through owner-approved change control—not by quietly editing code to differ from the requirements.

## 15. Supporting implementation references in this package

- `docs/DATA_MODEL_AND_CONSTRAINTS.md`: concrete entity relationships, temporal integrity, uniqueness and recommended storage boundaries. **Proposed** schema: inspect current migrations before implementing.
- `docs/ARCHITECTURE_DIAGRAMS.md`: editable context/class/sequence/state diagrams; textual rules here override diagram simplifications.
- `docs/THREAT_MODEL_AND_RELEASE_GATES.md`: explicit threat boundaries and environment-specific deployment gates.
- `docs/DECISIONS.md`: documented open business and vendor choices with safe defaults; requires named owner approval.
- `docs/PROGRESS.md`: live implementation truth; starts unimplemented until actual code inspection and tests occur.
- `docs/REFERENCES.md`: preserved source provenance and official design/legal references. Always recheck currently effective law with qualified counsel before production.
