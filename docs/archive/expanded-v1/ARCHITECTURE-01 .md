# Project Architecture: Hippocrates.am

> Hippocrates.am is a multi-organization dental and oral/maxillofacial healthcare marketplace. **Version 1** connects patients, verified clinics, and doctors through public discovery, appointments, private text messaging, anonymous public Q&A, reviews, and simple clinic administration. This document uses the same section structure as the supplied Lobby architecture template; it describes a **proposed architecture, not an implemented system**.

**Project size:** C (product complexity); simple initial deployment  
**Current target:** Version 1  
**Last updated:** 2026-09-28  
**Version:** 1.0-draft  
**Status:** DRAFT — validate against the actual repository and obtain owner approval for decisions marked `PENDING`.  
**Document boundary:** This file defines architecture, ownership, interactions, and operating constraints. Detailed functional requirements belong in the original Hippocrates Project Overview v2.0 and the approved `BRIEF.md`; technology/vendor choices in `TECH_CARD.md` and `02-TECH_STACK.md`; delivery status in `PROGRESS.md`. Paths below are **proposed**: do not assume these files or directories already exist.

---

## 📋 OVERVIEW

### Purpose

Provide a single public platform for finding dental and maxillofacial clinics and doctors, and isolated workspaces for each participating clinic. Patients have one platform account and may book appointments across different organizations. Doctors may work at multiple clinics with separate schedules and local permissions.

**V1 is not a clinical electronic health record.** It manages appointment and operational data; diagnosis, dental charts, signed medical notes, treatment plans, surgery records, CT/CBCT exchange, and medical-image storage require separate future scope and approvals.

### Main capabilities

- Six user-facing areas: **Public Space**, **Clinic Space** (public clinic pages), **Patient Portal**, **Doctor Portal**, **Clinic Management**, and **Platform Administration**.
- Public directories and search for clinics, doctors, specialties, services, locations, published prices, and available booking times.
- Clinic/doctor identity and credential verification with separate statuses; service catalogs, branches, schedules, and resource-safe appointments.
- Text-only **private patient–doctor chat initiated from a doctor's public profile**; a prior booking is **not** required.
- **Separate anonymous public dental Q&A and searchable public archive**, with approved answers by verified doctors.
- Verified-visit reviews, basic administrative/operational dashboards, reminders, and platform content moderation.

**Scope control:** The module list describes ownership. Version 1 follows the source v2.0 product scope. Online payment capture, automated external-review synchronization, advanced accounting, and clinical/diagnostic workflows are later points. The source mentions optional booking deposits but places real payment integration on the finance point; booking does not require online prepayment before that point is approved.

### Users

| **Actor** | **Responsibility in V1** |
| --- | --- |
| Visitor | Search published providers/services, read published reviews and anonymous Q&A. |
| Patient | Maintain own profile, book/cancel eligible appointments, chat, ask anonymous public questions, review verified visits. |
| Doctor | Maintain permitted public profile, view authorized work schedules/bookings, answer chats and approved public questions. |
| Receptionist | Manage permitted branch bookings and minimum operational contact information. |
| Clinic owner/admin | Set up and manage only their clinic, branches, staff, services, schedules, and basic reporting. |
| Platform moderator | Review published profiles, public Q&A, reviews, and reported content through restricted tools. |
| Platform operator (Super Admin) | Verify organizations/doctors, govern public platform and see platform operational metrics; **no blanket access to private chats or future clinical records**. |

One person may be a patient and a doctor, or a doctor at several clinics. Identity, professional profile, and organization membership are different objects.

---

## 🏗️ ARCHITECTURE

### High-level diagram — current V1 target

```text
        Public visitor / Patient / Doctor / Clinic staff / Platform operator
                                      |
                                  HTTPS
                                      |
                         +------------v------------+
                         | Next.js web application  |
                         | six UI areas; public SEO |
                         +------------+------------+
                                      | REST
                         +------------v------------+
                         | NestJS modular monolith  |
                         |                            |
                         | Identity / Organizations   |
                         | Profiles / Catalog / Search|
                         | Scheduling / Appointments  |
                         | Private Chat / Public Q&A  |
                         | Reviews / Admin / Notify   |
                         +-------------+-------------+
                                       |
                              +--------v---------+
                              | PostgreSQL        |
                              | authoritative data|
                              | sessions / audit  |
                              | outbox (if needed)|
                              +--------+---------+
                                       |
                              +--------v---------+
                              | Small worker*     |
                              | reminders/retries |
                              +--------+---------+
                                       |
                                Email / SMS*

        Optional private storage* <- API-authorized access only
        *Use only when an approved V1 requirement needs it.
```

This is a logical diagram, not a claim about the existing deployment. Start with one web app, one API, and one primary database. A worker is justified by reliable reminder delivery. **Do not deploy Redis, microservices, a realtime gateway, or separate search infrastructure solely because they appear in other projects.** Select them only when a V1 requirement and the approved `TECH_CARD.md` warrant them.

### Architectural style

**Simple modular monolith.** One backend application contains clearly separated functional modules. The public site, patient/doctor portals, clinic management, and admin area are UI surfaces—not separate backend services. Each module owns its business rules and writes; shared PostgreSQL is the initial system of record. A small independently runnable worker may handle reminders and retries.

**Why:** Ship the complete approved V1 user journey with minimal operations while keeping clear boundaries for later medical, diagnostic, or laboratory modules. Future clinical features are **not** partially implemented in V1.

### Architectural invariants

| **Rule** | **Mandatory constraint** |
| --- | --- |
| `HIP-MOD-001` | Every V1 capability has one named owning module; no module writes another module's private data directly. |
| `HIP-TEN-001` | Clinic-scoped operations verify live session, selected clinic, active membership, permission, and branch/resource scope. |
| `HIP-TEN-002` | A patient has one platform identity but each clinic's private operational information is isolated. Cross-clinic scheduling reveals **busy/free**, not another clinic's patient details. |
| `HIP-SEC-001` | Sessions are revocable and verified server-side; loss of clinic membership blocks subsequent clinic-scoped access. No UI-only authorization. |
| `HIP-PRV-001` | Public pages, search indexes, logs, Q&A, and notifications contain only explicitly permitted data. Public Q&A author identity stays private, including from responding doctors. |
| `HIP-PRV-002` | Super Admin and moderators have no routine bypass to private chats or future medical records. Exceptional disclosure requires separate lawful approval and auditing. |
| `HIP-BOOK-001` | A confirmed booking cannot overlap the same doctor or required resource. Authoritative database transactions/constraints enforce collision safety. |
| `HIP-BOOK-002` | `Appointment` is organizational; marking it complete does **not** create a clinical diagnosis, encounter, or treatment record. |
| `HIP-EVT-001` | Notifications cannot determine booking correctness; if durable async events are used, save state + outbox intent atomically and make retries idempotent. |
| `HIP-RUN-001` | Critical business correctness must not depend on a single API process's memory, browser cache, or successful email/SMS delivery. |
| `HIP-SCALE-001` | Introduce new infrastructure only after an approved need, measurements, tests, and a recovery plan. |

---

## 🧩 SYSTEM COMPONENTS

The following are simple V1 logical components. Provider names, exact versions, and unapproved tooling remain decisions for `TECH_CARD.md`.

| **Component** | **Responsibility** | **Proposed location** | **Technology / decision state** | **Runtime relationship** |
| --- | --- | --- | --- | --- |
| Web application | Public pages and six authorized user areas; never authoritative for access decisions. | `apps/web/` | Next.js + TypeScript, proposed | HTTPS to API; no direct DB connection. |
| API application | Input validation, auth/policy checks, module commands/queries, database transactions. | `apps/api/` | NestJS REST, proposed | Calls module public interfaces. |
| Functional modules | Independently owned business behaviors and data writes. | `apps/api/src/modules/<name>/` | Modular monolith, proposed | Synchronous contracts; minimal async events where needed. |
| Primary database | Identity, clinic, booking, messages, Q&A author mapping, audit and approved operational data. | `packages/database/` if approved | PostgreSQL, proposed | Authoritative database for API/worker. |
| Background worker | Send reminders and retry failed notifications without blocking API requests. | `apps/worker/` if needed | Simple durable worker; tooling pending | Consumes committed jobs/events; never invents booking status. |
| Private file storage | Verification evidence and published media only where approved. | Storage adapter | Optional; provider pending | API-authorized short-lived access; never publicly exposes verification files. |
| Monitoring & audit | Health signals, error rates, security events, data change history. | Shared instrumentation | Required capability; vendors pending | Redact patient content; business audit separate from app logs. |

### Frontend

One web app serves the six V1 surfaces. Public pages expose allowlisted clinic/doctor information and safe SEO content. Authenticated portals render only server-authorized data. Keep private Q&A author mapping and chat contents out of public bundles, page metadata, static generation, and search indexes. A doctor's public profile can open a new private chat request without an appointment.

### Backend

One REST API holds all approved V1 modules. API handlers must validate inputs, call the owning module, enforce permissions server-side, and return minimal role-specific responses. Never use clinic admin or platform admin role labels as automatic access to all sensitive data.

### Database

PostgreSQL is the **proposed** V1 source of truth. Use separate `User`, `PatientProfile`, `DoctorProfile`, `OrganizationMembership`, `Organization`, `Branch`, and appointment/resource tables. Each clinic-private row must have a defensible ownership path; foreign keys/constraints should prevent accidental cross-clinic references. Concurrent slot confirmation requires transaction-backed serialization and tests. Migrations must be versioned and run once in the approved release process. Exact indexes, schema, pooling, and backup setup belong in `05-DATABASE.md` and `TECH_CARD.md`.

### Cache

**No dedicated cache is required by default in V1.** Use database-backed revocable sessions and appropriate basic application caching only where safe. If measurements justify Redis later, define key scope, TTL, invalidation, outage behavior, and authorization revocation before enabling it. Never cache permission decisions so that removed members retain access.

### Functional modules

These are **ownership boundaries**, not separate processes. Keep implementations small; split further only when tests and complexity justify it.

| **Area** | **Modules / responsibility** |
| --- | --- |
| Identity & organization | Accounts & Access; Organizations & Verification; Doctor/Patient Profiles; Clinic Staff & Branches |
| Discovery | Service Catalog (`Service` vs `ServiceOffering`); Marketplace Search & Public CMS |
| Appointments | Scheduling & Resources; Appointments & Attendance History |
| Communication | Private Messaging; Anonymous Public Q&A & Archive; Notifications |
| Trust | Reviews & Ratings; Platform Moderation & Admin |
| Insights | Basic patient/doctor/clinic/platform dashboards using authorized V1 data |

**Avoid one large generic “management” module.** If implementation folders are consolidated for simplicity, maintain the ownership boundaries above. Future diagnostic/CT, dental chart, medical notes, treatment planning, surgery, lab, advanced finance, and external review synchronization are outside V1.

### Module communication

- **Synchronous:** Appointments queries Scheduling for a valid slot; Scheduling checks all Hippocrates affiliations for doctor conflicts while returning only busy/free to clinics. Reviews checks approved proof of a completed visit without editing Appointment data.
- **Asynchronous:** confirmed/changed bookings produce minimal notification intents; question answers notify their author through a privacy-safe internal identifier.
- **Forbidden:** a module directly changes another module's tables; no read of public Q&A author identity from public/doctor endpoints; private chat never auto-publishes to Q&A.
- **Contracts:** keep typed, validated public interfaces; document payloads before adding unnecessary queues, brokers, or shared event buses.

### Supporting infrastructure

A single database and a small reminder worker are sufficient to begin. Outbound Email/SMS, media storage, and basic monitoring are integrated only for approved user journeys. Use a local development environment and one production-like staging environment before any real patient bookings. This document does not specify vendors or deployment credentials.

---

## 📁 PROJECT STRUCTURE

**Proposed repository layout; inspect the real repository before creating or moving directories.** The authoritative actual layout should be recorded in `03-STRUCTURE.md` if that document is adopted.

```text
hippocrates/
├── apps/
│   ├── web/                    # Public pages and five authenticated areas
│   ├── api/
│   │   └── src/modules/        # Named module owners and contracts
│   └── worker/                 # Only if durable reminders require it
├── packages/
│   ├── contracts/              # Only genuinely shared typed contracts
│   └── database/               # Only if shared DB package is approved
├── docs/
│   ├── BRIEF.md                # Product features and phase scope
│   ├── TECH_CARD.md            # Approved stack and deployment choices
│   ├── ARCHITECTURE_TEMPLATE.md # This architecture document
│   ├── 02-TECH_STACK.md        # Optional technology detail
│   ├── 03-STRUCTURE.md         # Optional real repository tree
│   ├── 04-API.md               # Detailed API contracts, when needed
│   ├── 05-DATABASE.md          # Detailed schema and invariants
│   ├── DECISIONS.md            # Approved decisions and open questions
│   └── PROGRESS.md             # Delivery slices and verification
└── .cursor/rules/              # Cursor-specific agent rules, if used
```

### Folder descriptions

| **Folder** | **Purpose** |
| --- | --- |
| `apps/web/` | Public SEO pages, clinic public pages, patient/doctor portals, clinic operations, and platform admin UI. |
| `apps/api/` | REST entry point, server-only policy checks, module orchestration and transactions. |
| `apps/api/src/modules/` | Per-feature domain logic, owned persistence, exposed application contracts and tests. |
| `apps/worker/` | Conditional background notifications, scheduled reminders and bounded retries. |
| `packages/contracts/` | Optional framework-light DTO and event contracts needed by more than one application. |
| `packages/database/` | Optional centrally managed schema/migrations; module ownership still applies. |
| `docs/` | Product scope, accepted architecture, pending decisions and delivery status. |
| `.cursor/rules/` | Persistent development policy, separate from product requirements. |

Do not generate placeholder services or empty directories just to match this illustration. Keep any existing working repository structure unless a documented decision approves a change.

---

## 🔄 DATA FLOWS

### User request

```text
Browser → Web → REST API → session check → user + context
        → role / organization membership / branch scope check
        → module validation → owning module transaction → response
```

Anonymous public searches access **published public projections only**. Authenticated patient operations check record ownership; clinic operations check active membership. Sensitive reads are checked just as strictly as writes.

### Authentication and revocation

```text
Login → verify identity → create server-side opaque, revocable session
Request → load current session → resolve chosen clinic context if needed
        → check membership + permission + resource scope → execute
Clinic removes doctor/receptionist from Clinic A
        → A membership becomes inactive immediately
        → later A requests denied (including chat/bookings as applicable)
        → Clinic B rights remain intact if separately authorized
```

Exact session store, cookie attributes, expiration and CSRF policy need a security design in `TECH_CARD.md`. The UI must never be considered an authorization boundary.

### Reliable domain events

```text
Booking transaction → commit Appointment + reservations + notification intent
                   → worker reads committed intent → send email/SMS
                   → record outcome → bounded retry if temporary failure
Doctor answer published → internal author notification intent
```

V1 may use a **simple PostgreSQL-backed outbox/job table** instead of adding a message broker. Notification failures do not revert a confirmed booking. Jobs need stable IDs and duplicate-delivery prevention. Do not emit patient health details in generic notifications or logs.

**Other critical flows:**

| **Flow** | **Behavior and owner** |
| --- | --- |
| Clinic onboarding | Organizations creates `PENDING` verification; platform operator verifies clinic; approved public profiles appear in Marketplace only when published. Doctor verification is independent. |
| Booking | Catalog supplies published offering/price/duration; Scheduling calculates real availability; Appointments atomically consumes hold/reserves doctor and resources, then records state changes. |
| Private chat | Patient requests text conversation directly from doctor profile; doctor accepts/declines; Messaging restricts all reads to permitted participants and captures spam/block states. |
| Anonymous Q&A | Signed-in author submits; private author link is never serialized publicly; moderation screens identifying text before publishing; verified doctors answer; public archive shows safe content. |
| Reviews | Completion/attendance evidence is checked before granting review eligibility; disputes use a review-specific moderation workflow. |

**Minimal states** (full transition guards/tests live in module specifications): `Organization: REGISTERED → UNDER_REVIEW → VERIFIED → ACTIVE` (also rejected/suspended); `Appointment: HELD/REQUESTED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED` (also cancelled/no-show/hold expired); `Conversation: REQUESTED → ACTIVE → CLOSED` (also declined/blocked); `PublicQuestion: PENDING → PUBLISHED → ANSWERED/CLOSED` (also rejected/hidden); `Review: SUBMITTED → PUBLISHED` (also flagged/rejected/hidden). `ANSWERED` can be derived from approved answers if the team chooses not to persist it as a state.

---

## 📊 DATABASE

### Main entities

| **Group** | **Representative entities** |
| --- | --- |
| Identity and clinics | `User`, `Session`, `Organization`, `Branch`, `Membership`, `DoctorProfile`, `DoctorAffiliation`, `PatientProfile`, `VerificationCase` |
| Discovery and booking | `Specialty`, `Service`, `ServiceOffering`, `Schedule`, `ScheduleException`, `Resource`, `SlotHold`, `ResourceReservation`, `Appointment`, `AppointmentEvent` |
| Communication | `Conversation`, `ConversationParticipant`, `Message`, `PublicQuestion`, `PrivateQuestionAuthor`, `PublicAnswer`, `Notification` |
| Trust and platform | `Review`, `ReviewReply`, `ReviewReport`, `PublishedProfile`, `ContentPage`, `ModerationCase`, `AuditEvent`, `OutboxEvent` (if used) |

V1's `PatientProfile` contains only information necessary for the approved service. **Do not add** `MedicalRecord`, `DentalChart`, `ClinicalNote`, `SurgicalCase`, or `ImagingStudy` tables as unapproved placeholders.

### ER diagram

```text
User ──0..1── PatientProfile
User ──0..1── DoctorProfile
User ──< Membership >── Organization ──< Branch
DoctorProfile ──< DoctorAffiliation >── Branch
Service ──< ServiceOffering >── Branch
DoctorAffiliation ──< Schedule ──< ScheduleException
PatientProfile ──< Appointment >── DoctorAffiliation
Appointment >── ServiceOffering / Branch / ResourceReservation
PatientProfile ──< Conversation >── DoctorProfile
PublicQuestion ──< PublicAnswer >── DoctorProfile
PublicQuestion ──1── PrivateQuestionAuthor (restricted storage)
Completed Appointment ──< eligible Review >── DoctorProfile or Organization
```

This is a **conceptual** diagram showing ownership and principal associations, not an executable relational schema. Physical indexes, constraints, and migration strategy belong in `05-DATABASE.md`.

### Detailed schema

- Use stable IDs and explicit clinic/branch ownership on private operational records; prevent cross-organization references through application checks and appropriate composite constraints.
- Doctor is a global profile; `DoctorAffiliation` binds it to a branch. Booking conflict detection covers **all known Hippocrates affiliations** of a doctor but does not promise conflict detection for unsynchronized external calendars.
- `Service` is the shared definition; `ServiceOffering` is a particular branch's price, duration and eligibility. Capture agreed booking price/terms at booking time to preserve history.
- Use DB-backed unique/overlap-conflict strategies for `SlotHold` and confirmed reservations; race tests must include two simultaneous booking attempts.
- Keep `PrivateQuestionAuthor` inaccessible to public/doctor queries; published Q&A has its own strictly allowlisted read model. Retain review eligibility independently from public review content.
- Keep `AppointmentEvent` as an append-only status history; never equate `Appointment.COMPLETED` with completed clinical treatment.

---

## 🔌 INTEGRATIONS

Only enable an external provider when needed for an approved V1 flow and when owner/security decisions have been made. Detailed providers, secrets, and HTTP/webhook contracts live in the technology/API documentation.

| **Integration boundary** | **Purpose** | **V1 status** | **Architectural requirements** | **Detailed documentation** |
| --- | --- | --- | --- | --- |
| Email / optional SMS | Booking confirmation, reminders, Q&A/chat notifications | Email proposed; SMS conditional | Consent/preferences, deduplicated sends, retry policy, no medical details in generic messages | `TECH_CARD.md`, `04-API.md` |
| Media / verification storage | Approved clinic public images and restricted verification evidence | Conditional | File checks, restricted object access, expiry/retention and separate public/private buckets or key policies | `TECH_CARD.md` |
| Maps / geocoding | Search by location and distance | Optional | Provider terms, minimal location data, graceful fallback | `02-TECH_STACK.md` |
| Payment gateway | Actual online deposits, payments, refunds | **Not in V1 by default** | Separate approved reconciliation and refund design before production use | Future payment ADR |
| External review sources | Third-party rating import/sync | **Phase 2** | Official API/content license, source provenance, no mixing with native rating score | Future review ADR |
| Diagnostic CT/PACS/ArMed | Referrals, images, results, electronic clinical exchange | **Future clinical phase** | Separate clinical/legal scope, patient rights and applicable interoperability analysis | Future clinical architecture |

There must be no fake payment success state or scraped external rating shown as a verified Hippocrates rating. Provider failures must not silently corrupt booking state.

---

## 🔐 SECURITY

### Authentication

Use a **proposed** high-entropy, opaque, revocable server-side session for web users and properly scoped secure cookies. Implement appropriate password/reset protections, rate limits, CSRF/origin checks and session termination. Exact persistence location and lifecycle are pending technical security review. No long-lived self-contained browser authorization claim may substitute for live membership checks.

### Authorization

- Platform roles, patient ownership, practitioner affiliation, and clinic memberships are separate authorization scopes.
- Every clinic-private read and write requires active membership + requested action + branch/resource scope. A person removed from Clinic A may still access Clinic B when separately authorized.
- Doctors and receptionists see only the minimum permitted booking data. A doctor's cross-clinic occupancy check may reveal **busy/free** but not other patients or organization-private appointment data.
- Moderators verify public content using redacted reports. Private messaging is accessible to conversation participants only by default; exceptional lawful access requires separate auditable procedures.
- `PrivateQuestionAuthor` is private even to responding doctors. Published question text must pass moderation because hiding the account ID alone cannot prevent self-identification.

### Protection

- Encrypt transport and sensitive stored material appropriately; use restricted credentials and environment-managed secrets.
- Separate public profile images from confidential verification files; do not place raw private documents under public URLs.
- Rate-limit account/login/chat/Q&A/review operations and provide abuse reporting.
- Record auditable booking, verification, moderation, session, and permission changes while redacting sensitive message/body content from technical logs.
- Define retention/deletion, incident response, backup/restore validation, and a legal/privacy review **before real patient information is processed**.
- V1 is an appointment/communication platform, **not certified medical record software**. New clinical processing requires an approved safety/privacy design.

---

## 🚀 DEPLOYMENT

### Environments

| **Environment** | **Endpoint** | **Purpose** | **Promotion/data policy** |
| --- | --- | --- | --- |
| Development | Local / TBD | Code changes and automated tests | Synthetic test profiles; do not copy production medical/patient data. |
| Staging | TBD | Production-like functional, privacy, race-condition, and release tests | Reviewed commits; non-production or explicitly approved sanitized data only. |
| Production | TBD | Verified clinic/patient traffic | Controlled approvals; backup restore demonstrated before go-live. |

### Infrastructure

The **proposed** V1 topology is one web deployment + one modular API + one primary PostgreSQL database, and a small worker where reliable reminders justify it. Storage/email providers are selected separately. Separate staging/prod data and credentials; run DB migrations through one release-controlled job, not on each API startup. Every runtime needs basic health checks, restricted secret access, error/latency monitoring, and a documented rollback or restore procedure. Hosting region, availability goals, and data-processing agreements are **PENDING**.

---

## 📈 SCALING — SIZE C

### Current baseline

There is **no verified capacity baseline in the supplied product documents**. Record measured staging and production request rates, appointment concurrency, API latency, database load, reminder lag, and error rates before proposing scaling work. Do not claim a fixed user capacity.

### Scaling plan

| **Stage** | **Conditional evolution** |
| --- | --- |
| 1 — V1 | One modular API, one database, basic worker/monitoring, safe booking constraints and tenant checks. |
| 2 — Growth | Add stateless API/worker instances or caching only after measuring actual bottlenecks and proving revocation safety. |
| 3 — Scale | Tune queries/indexes; adopt specialized search, queues, or read replicas only for demonstrated needs. |
| 4 — Advanced clinic workflows | Introduce clinically approved data isolation, diagnostic interoperability or selectively extracted services **only with approved new product scope**. |

**Change gate:** measure → identify bottleneck/risk → record options → owner approval → test performance/security/restore → deploy → update architecture. Microservices and extra Redis clusters are not automatic milestones.

---

## 📋 KEY DECISIONS

This file records **proposed architectural positions**, not approvals. Add a decision log entry in `DECISIONS.md` when each item is confirmed.

| **Decision** | **Architectural position** | **Rationale** | **Status** | **ADR reference** |
| --- | --- | --- | --- | --- |
| V1 scope | Marketplace + booking + basic clinic workspaces + private text chat + anonymous public Q&A + internal reviews | Matches supplied v2.0 rather than the later clinical ecosystem | Derived from source | `DEC-001-v1-scope`, planned |
| Initial architecture | Simple modular monolith | Minimal deployment, explicit business boundaries | Proposed | `DEC-002-modular-monolith`, planned |
| Data separation | Shared PostgreSQL with strict clinic-aware ownership and server authorization | Supports one patient account across organizations while isolating private records | Proposed; privacy review required | `DEC-003-tenancy`, planned |
| Session management | Server-side revocable opaque sessions | Supports access revocation across multiple clinic memberships | Proposed; tech review required | `DEC-004-sessions`, planned |
| Booking conflict policy | Transactional doctor/resource allocation, clinic approval when configured | Prevents collisions between simultaneous bookings; protects cross-clinic privacy | Proposed; detailed constraints pending | `DEC-005-booking`, planned |
| Notifications | Simple committed outbox/job worker when needed | Reliable reminders without premature queue infrastructure | Proposed | `DEC-006-notifications`, planned |
| Deposit/payment conflict | No required live online deposit in V1 until explicitly approved | v2.0 mentions optional deposit but live payment integration is in Phase 2 | **PENDING owner decision** | `DEC-007-payments`, planned |
| Diagnostic-center timing | Architecturally reserved but **not implemented in V1** | Original v2.0 places diagnostic partners in the later ecosystem despite prior discussion | **PENDING owner decision** | `DEC-008-diagnostics`, planned |
| Future clinical records | No clinical EHR, surgery documentation or CT file exchange in V1 | Safety, legal, and clinical workflow design require separate approvals | Future phase, gated | `DEC-009-clinical`, planned |
| Scaling | Evidence-based, no invented capacity tiers | Avoid unjustified infrastructure expense | Proposed | `DEC-010-scaling`, planned |

---

## 🔗 RELATED DOCUMENTS

- Original **Hippocrates.am Project Overview & Functional Requirements v2.0** — upstream product scope supplied by the owner.
- `HIPPOCRATES_MASTER_SPEC.md` — normalized Cursor-ready specification, **only if adopted**; do not silently elevate proposed design choices into approved requirements.
- `BRIEF.md` — approved product boundaries and acceptance criteria (**create/confirm**).
- `TECH_CARD.md` — approved stack, infrastructure, data protection and deployment decisions (**create/confirm**).
- `02-TECH_STACK.md`, `03-STRUCTURE.md`, `04-API.md`, `05-DATABASE.md` — optional detailed reference documents as complexity requires.
- `DECISIONS.md` — open questions, owner decisions and architecture decision records.
- `PROGRESS.md` — implementation slices, evidence, testing, and release status.

**Cursor handoff:** Inspect the actual repository first. Compare this draft with the approved `BRIEF.md` and `TECH_CARD.md` if present. Surface conflicts (particularly online deposits and diagnostic-center timing) **in Armenian or Russian understandable to the product owner** before irreversible implementation. Do not change real data, production infrastructure, access controls, or integration credentials during discovery. Do not generate unapproved clinical functionality or silently convert `PENDING` items to approved decisions.
