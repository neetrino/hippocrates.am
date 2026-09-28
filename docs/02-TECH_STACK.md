# Technology Stack: Hippocrates.am

> Hippocrates.am V1 is a multi-organization dental and oral/maxillofacial marketplace with clinic operations, appointments, private patient–doctor text chat, anonymous public Q&A, reviews, and basic administration. This document proposes a **small TypeScript stack** for the approved V1 scope. It is a technology decision draft, **not evidence of an implemented system or authorization to provision infrastructure**.

**Project size:** C (product/domain complexity); simple initial runtime  
**Current target:** Version 1 / MVP  
**Last updated:** 2026-09-28  
**Document version:** 1.0-draft  
**Status:** DRAFT — technology and vendor choices require the project owner's approval in `TECH_CARD.md`.  
**Document boundary:** Product scope belongs in the approved `BRIEF.md`; module ownership, workflows, and security invariants belong in `ARCHITECTURE_TEMPLATE.md` (or its approved successor); this file describes proposed tools, compatibility policy, runtime roles, and providers. Implementation progress belongs in `PROGRESS.md`.

**Repository check:** At drafting time, the connected `neetrino/hippocrates.am` default branch contains an **onboarding/template repository** with an unfilled `docs/BRIEF.md`; no approved `TECH_CARD.md` was found. Its sample `.env.example` is not evidence that any provider or application framework is approved or deployed. Inspect the current repository again before implementation.

---

## Status legend

| **Status** | **Meaning** |
| --- | --- |
| Proposed | Suitable for V1, but requires project-owner approval before implementation. |
| Conditional | Add only when an approved V1 feature or measured need requires it. |
| TBD | Requires a decision or compatibility/security verification. |
| Required practice | Applies regardless of the selected library or provider. |

---

## Stack summary

| **Layer** | **Proposed technology** | **Version policy** | **Status** | **V1 responsibility** |
| --- | --- | --- | --- | --- |
| Repository | Simple monorepo using pnpm workspaces | Pin in lockfile | Proposed | One web app and one API; share packages only when needed. |
| Language/runtime | TypeScript + Node.js LTS | Select mutually compatible supported versions | Proposed | Strict typing across web, API, and optional worker. |
| Web | Next.js App Router + React | Compatible stable releases; pin together | Proposed | Six UI surfaces, public SEO pages, authorized portals. |
| API | NestJS | Compatible stable release | Proposed | Versioned REST, auth, tenant checks, booking and module boundaries. |
| Database | PostgreSQL | Supported stable version; provider TBD | Proposed | Authoritative identity, clinic, booking, chat, Q&A, review, session and audit data. |
| Database access | Prisma ORM + versioned SQL migrations | Verify PostgreSQL/Node compatibility | Proposed | Typed persistence; hand-written SQL migrations where advanced DB constraints require them. |
| Sessions | Opaque, revocable, server-side sessions in PostgreSQL | Application/security design TBD | Proposed | Immediate revocation and current clinic-membership enforcement without a separate cache service. |
| Background work | PostgreSQL outbox/job table + small worker | No extra broker initially | Conditional for reliable reminders | Durable notification intents, scheduled reminders, bounded retries. |
| API contract | OpenAPI using NestJS Swagger integration | Match NestJS version | Proposed | Inspectable REST contracts and stable error shapes. |
| Validation | NestJS DTO validation or one consistent schema library | Select one validated approach | TBD | Validate all external requests at runtime. |
| Styling | Tailwind CSS or existing design system | Compatible with selected Next.js | Proposed | Responsive public and authenticated interfaces. |
| UI primitives | Existing/custom accessible components | Select before major UI work | Proposed | Reusable forms, calendars, dialogs, and accessible navigation. |
| Testing | Framework-compatible unit runner, Supertest, React Testing Library, Playwright | Pin tested versions | Proposed | Verify permissions, concurrent booking, anonymity and end-to-end journeys. |
| Logging | Structured JSON logger (Pino-compatible) | Compatible version TBD | Proposed | Operational diagnostics with patient-data redaction. |

**Simplicity rule:** Redis, BullMQ, Turborepo, a standalone scheduler, WebSocket gateway, specialized search, and microservices are **not mandatory V1 components**. A technology may be added only after its need is documented and approved. Exact package versions must be pinned after verifying the selected versions' official compatibility matrices; version labels from another project are not automatic decisions for Hippocrates.

---

## Foundation and repository tooling

| **Concern** | **Proposed choice** | **Status** | **Notes** |
| --- | --- | --- | --- |
| Repository model | Monorepo with `apps/*`; add `packages/*` only when shared code exists | Proposed | Matches the simple modular-monolith architecture. |
| Package manager | pnpm workspaces | Proposed | One lockfile; frozen installs in CI. |
| Task orchestration | Native pnpm scripts | Proposed | Introduce Turborepo only when build time/complexity justifies it. |
| TypeScript | `strict: true` | Required practice | Avoid unchecked `any`; perform runtime validation at external boundaries. |
| Formatting | Prettier | Proposed / existing template | Preserve any compatible repository configuration. |
| Linting | ESLint | Proposed / existing template | Use framework-compatible configuration. |
| Commits | Existing repository convention | Proposed | Do not rewrite agent or repository rules in a stack document. |
| Git workflow | Reviewed short-lived branches and PRs | Proposed | Follow repository protection; no automatic pushes or production actions. |

### Proposed workspace ownership

```text
apps/web/               Next.js application: public site and portals
apps/api/               NestJS REST API and functional modules
apps/worker/            Optional durable reminders and retries
packages/contracts/     Only truly shared typed contracts, if needed
packages/database/      Only if a shared migration/ORM package is approved
```

Do **not** create empty folders or restructure an existing application just to match this proposed layout. Actual paths belong in `03-STRUCTURE.md` once approved.

---

## Frontend — Next.js

| **Concern** | **Proposed choice** | **Status** | **Reason / V1 boundary** |
| --- | --- | --- | --- |
| Framework | Next.js App Router | Proposed | Public discovery plus authenticated portals in one application. |
| Rendering | Server Components by default; minimal Client Components | Required practice | Public clinic/doctor pages should be indexable; private pages must not leak data into static output. |
| Styling | Tailwind CSS + project design tokens | Proposed | Simple reusable responsive styling; do not infer an approved UI design. |
| UI components | Accessible custom/existing components; shadcn/ui only if chosen | Conditional | Keep library choices replaceable. |
| Server data | Server-side REST calls to NestJS when appropriate | Proposed | Web clients never access PostgreSQL or secrets directly. |
| Client data | Native route refresh/fetch first; TanStack Query if necessary | Conditional | Add client cache only for real interactive needs. |
| UI state | React state/context first | Proposed | Do not mirror authoritative booking or permission state into a global store. |
| Forms | Simple form handling plus approved schema/DTO approach | TBD | API remains the final validation authority. |
| Localization | Internationalization-ready routing, translations, date/time formats | Required V1 capability; library TBD | Confirm launch languages and fallback rules; do not assume a fixed locale list from a language-switcher requirement. |
| Public SEO | Next.js Metadata API and safe structured data | Proposed | Index only approved published clinic, doctor, service, and moderated Q&A content. |
| Messaging UI | Polling/refetch initially; realtime only if required | Proposed / Conditional | Message delivery and permission checks live in API, not in browser state. |

**Six UI surfaces:** Public Space, Clinic Space, Patient Portal, Doctor Portal, Clinic Management, and Platform Administration. These are UI boundaries, **not separate backend deployments**. Anonymous Q&A author mappings and private message content must never appear in public HTML, metadata, search indexes, or public API payloads.

---

## Backend — NestJS

| **Concern** | **Proposed choice** | **Status** | **Responsibility / boundary** |
| --- | --- | --- | --- |
| Application | Single NestJS modular monolith | Proposed | All approved V1 capabilities share one API deployment. |
| API style | Versioned REST | Proposed | Contracts documented in `04-API.md` when adopted. |
| HTTP adapter | Framework-supported Express or Fastify | TBD | Choose once based on upload, auth, monitoring, and hosting needs. |
| Validation | One consistent DTO/schema strategy | TBD | Validate all input, including query filters and role-scoped identifiers. |
| API documentation | NestJS OpenAPI tooling | Proposed | Generated docs remain consistent with actual controllers. |
| Configuration | Environment parsing and startup validation | Proposed | Fail on missing required secrets/configuration. |
| Authorization | Server-side guards **and** owning-module resource policies | Required practice | Check identity, active clinic membership, role/permission and record scope on each request. |
| Errors | Typed errors mapped to safe, stable HTTP responses | Proposed | Never reveal stack traces, hidden author IDs, chat text, or tenant existence in errors. |
| Rate limiting | Simple edge/API rate limits; shared state if replicated | Proposed | Protect login, private chat requests, Q&A submission and reviews. |
| Health | Lightweight liveness/readiness endpoints | Proposed | Do not reveal secrets or sensitive dependency details. |

**Ownership:** Accounts & Access; Organizations/Branches/Verification; Doctor/Patient Profiles; Service Catalog; Search/Public CMS; Scheduling & Resources; Appointments; Private Messaging; Anonymous Public Q&A; Reviews; Notifications; Platform Administration/basic reports. Controllers stay thin. Cross-module calls use explicitly published services; direct cross-module private-table writes are forbidden.

**Not in V1:** electronic medical records, Dental Chart, clinical diagnosis, signed notes, treatment plans, surgical cases, CT/CBCT/PACS exchange, external-review synchronization, and advanced accounting unless later approved in the product scope.

---

## Data and persistence

| **Concern** | **Proposed choice** | **Status** | **Required constraints** |
| --- | --- | --- | --- |
| System of record | Single PostgreSQL primary | Proposed | Separate platform identity from clinic-owned operational data. |
| ORM / migrations | Prisma plus reviewed SQL migrations when necessary | Proposed | Commit migrations; test generated SQL and actual constraints. |
| Application credential | Least-privilege runtime DB role | Required practice | No production migration/admin rights in API or worker credentials. |
| Migration credential | Separate elevated release-time credential | Required practice | Available only to approved migration process. |
| Sessions | PostgreSQL-backed, revocable opaque session records | Proposed | Server-authoritative validity and immediate membership rechecks. |
| Tenant isolation | App-layer authorization, clinic-scoped foreign keys and constraints | Required practice | Prevent cross-organization references and access; RLS only after explicit design/approval. |
| Booking correctness | Transactions plus DB-enforced reservation-conflict strategy | Required practice | Prevent simultaneous bookings of the same doctor or required resource across clinics. |
| Search | PostgreSQL indexes/text search first | Proposed | Specialized search is conditional on an approved requirement or measured bottleneck. |
| Backup and restore | Provider backup/PITR where available + tested restore | Required capability | Region, retention and recovery objectives TBD. |

**Reservation design gate:** `Schedule` describes availability; `SlotHold` is temporary; `Appointment` is a durable booking; resource reservations enforce doctor/room/equipment occupancy. The database design must cover overlapping holds, expiry, cancellation, rescheduling, branch time zones, and the same doctor working at multiple clinics. Evaluate PostgreSQL range/exclusion constraints or an equivalent transaction/lock design; if Prisma cannot express a chosen constraint, use a reviewed SQL migration. Do not use an application-memory lock as the only protection.

Database schema, indexes, composite foreign keys, constraints, and migration ownership belong in `05-DATABASE.md`. Production migrations run **once per release**, not in every API process or during web builds.

---

## Authentication and authorization

| **Concern** | **Proposed choice** | **Status** |
| --- | --- | --- |
| Web sessions | Opaque high-entropy server-side tokens | Proposed; security review required |
| Session storage | PostgreSQL | Proposed; avoids mandatory Redis in V1 |
| Browser transport | `HttpOnly`, `Secure`, appropriately scoped cookies | Required practice |
| CSRF/Origin controls | Framework-appropriate server-side verification | Required practice |
| Credentials / password reset | Approved password flow with modern password hashing if password login is selected | TBD |
| External login | OAuth/OIDC only if approved | Conditional |
| Clinic authorization | Active membership + permission + branch/resource scope | Required practice |
| Patient authorization | Own-record checks; least-privilege explicit sharing | Required practice |
| Platform admin | Separate platform permissions, no default private-chat access | Required practice |
| Audit | Durable records for sensitive access and state changes | Required capability |

One doctor may work at multiple clinics; removal from Clinic A must deny subsequent Clinic A requests without revoking independent rights in Clinic B. Cross-clinic schedule checking reveals **busy/free only**. Public Q&A author identity must remain inaccessible to public readers and responding doctors. Moderation access to private chat must not exist as a routine unrestricted override; any exceptional workflow requires separate lawful approval and audit.

---

## Redis, queues, scheduling, and realtime

| **Capability** | **V1 direction** | **Status** | **Boundary** |
| --- | --- | --- | --- |
| Sessions | PostgreSQL, not Redis by default | Proposed | Authoritative revocation; no stale permission cache. |
| Cache | Next.js/application-safe caching for public data | Conditional | Never cache private content across users or clinics. |
| Redis | No initial deployment | Conditional | Add only for documented shared rate limits, measured cache need, or a selected compatible queue. |
| Queue | PostgreSQL-backed durable jobs/outbox + small worker | Conditional for reminders | Atomic booking + notification-intent commit; idempotent processing. |
| BullMQ | Not included by default | Conditional | Requires Redis with supported connection semantics; do not assume a REST-only Redis service is a compatible BullMQ transport. |
| Scheduler | One approved worker/platform scheduling owner | Conditional | Handles 24h/2h reminders when approved; prevent duplicate scheduling. |
| Realtime | Polling first; SSE/WebSocket only if required | Conditional | Revalidate participant rights; never substitute realtime events for stored messages. |

Notifications must not determine booking correctness. Repeated worker delivery must not create duplicate messages or erase a confirmed appointment. If an outbox is introduced, the business state and notification intent are committed in the same database transaction.

---

## Storage and external services

| **Service area** | **Proposed direction** | **Status** | **V1 boundary** |
| --- | --- | --- | --- |
| Public media | Approved image/object storage; S3-compatible service is a candidate | Conditional | Published clinic/doctor images only. |
| Private verification files | Private object storage with API-authorized short-lived access | Conditional when verification files required | Never store credentials or verification files in public buckets/URLs. |
| CDN and images | Next.js image processing or approved CDN path | Conditional | Allowlisted remote sources; safe published media only. |
| Email | Transactional email through one approved provider | Proposed capability; provider TBD | Registration/verification and booking reminders without unnecessary patient health details. |
| SMS | Provider adapter only for approved reminders | Conditional | Consent, suppression and failure handling. |
| Maps/geocoding | Approved provider only when proximity features require it | Conditional | Clinic location search; avoid collecting unnecessary precise patient location. |
| Online payments/deposits | Not a V1 default | Not approved | Product document mentions optional deposits but schedules payment integration later; resolve separately. |
| External review APIs | Deferred | Out of V1 | Display externally sourced reviews only after approved API/rights review. |
| Diagnostic/PACS/clinical integrations | Deferred | Out of V1 | Require separate clinical scope, privacy, retention, and interoperability review. |
| Error tracking | Managed provider or self-hosted equivalent after privacy review | Proposed capability; vendor TBD | Redact personal/chat content and set retention. |

External callbacks, when introduced, need verification, replay/deduplication controls, appropriate timeouts, bounded retries, and provider-specific retention review. Never treat sample `.env.example` vendor names as an approved purchasing decision.

---

## Testing and quality

| **Layer** | **Proposed tools** | **Critical V1 coverage** |
| --- | --- | --- |
| Unit | Vitest/Jest, consistent with selected framework | State transitions, pricing snapshots, authorization policies, anonymous question projection. |
| API integration | NestJS test utilities + Supertest | Validation, clinic membership removal, message-participant checks, moderation boundaries. |
| Database integration | Dedicated PostgreSQL test database | Concurrent slot holds/bookings, cross-branch doctor conflicts, tenant-safe FKs, migrations. |
| Frontend components | React Testing Library | Accessible clinic/doctor search, appointment flow, Q&A and private chat interactions. |
| End-to-end | Playwright | Visitor discovery → booking → reminders/attendance → verified-visit review; clinic onboarding; public Q&A. |
| Privacy regression | API/HTML/log review | No author identification in Q&A, no chat leakage, no private data in SEO/static output. |
| Contract | OpenAPI/schema validation | Web/API agreement and safe error formats. |

CI should run lockfile installs, formatting, lint, strict typechecks, applicable tests, and builds. Before V1 production launch, demonstrate concurrency safety, cross-tenant isolation, session revocation, anonymous Q&A protection, restore testing, and key user journeys. Coverage percentages alone are insufficient.

---

## Observability and operations

| **Concern** | **Proposed choice** | **Status** |
| --- | --- | --- |
| Structured logs | Pino-compatible JSON logs | Proposed |
| Correlation | Request IDs propagated through web, API, and optional worker | Required practice |
| Service metrics | API latency/errors, DB pool and slow queries, appointment conflict counts, worker job delays | Required capability |
| Health | Lightweight liveness/readiness endpoints for deployed runtimes | Required capability |
| Error tracking | Privacy-reviewed provider | Conditional |
| Distributed tracing | Add only if production debugging needs it | Conditional |
| Alerting | Actionable failures: unavailable booking, DB outage, delayed reminders, suspicious auth failures | Required before production |
| Security audit | Separate durable record of administrative, membership, verification, moderation and booking changes | Required capability |

Operational logs must omit passwords, tokens, cookies, private-chat message bodies, public-Q&A author mappings, unnecessary personal data, and any future medical contents. Audit access is restricted and retention is explicitly approved.

---

## Deployment and CI/CD

| **Component** | **Proposed deployment direction** | **Status** |
| --- | --- | --- |
| Next.js web | Approved Next.js-compatible hosting; Vercel is a candidate | Proposed; provider TBD |
| NestJS API | One managed container/runtime or approved VPS service | Proposed; provider TBD |
| Worker | Same hosting family as API, deployed separately only when required | Conditional |
| PostgreSQL | Single primary with provider-supported backups | Proposed; provider and region TBD |
| Redis | No V1 default | Conditional |
| Object storage | Managed private/public storage configuration as approved | Conditional |
| CI/CD | GitHub Actions or existing repository workflow | Proposed |
| Packaging | Docker if needed by selected runtime | Conditional |
| Edge/WAF | Hosting controls; additional WAF only if required | Conditional |

**Environments:** local development, a production-like staging environment, and production have separate databases and credentials. Use synthetic or explicitly approved test data outside production.

**Release flow:** reviewed change → frozen dependency install → lint/typecheck/tests/build → one authorized migration step (only if migrations exist) → controlled deployment → post-deploy smoke tests → monitoring. Document rollback/restore ownership before real patient traffic. No AI agent may deploy to production, modify real patient data, or make architecture-changing purchases without explicit authorization.

---

## Environment configuration

| **Variable/category** | **Owner** | **Notes** |
| --- | --- | --- |
| `DATABASE_URL` | API / approved worker runtime | Least-privilege runtime connection; never place in public web bundles. |
| Migration-only database URL | Approved release migration process | Separate privilege; actual variable name depends on selected ORM version/config. |
| Session signing/hash secrets | API | High entropy, rotatable, stored in environment secret manager. |
| Public URL and API base URL | Web/API | Public values only may use `NEXT_PUBLIC_*`. |
| Email provider credentials | Notification module / worker | Server-side, with suppression/consent rules. |
| SMS credentials | Notification module / worker | Only if SMS is approved. |
| Public and private file-storage credentials | Owning server-side module | Separate authorization and bucket/key policy as appropriate. |
| Redis connection details | API / worker only if approved | Not required in the minimal V1 baseline. |
| Error-tracker configuration | Approved runtimes | Filter personal data and set retention. |

Keep `.env.example` free of real secrets. The current repository's starter `.env.example` lists sample provider variables; do not treat it as project approval. Preview, local and staging systems must not point at the production database by default.

---

## Related documents

- [`BRIEF.md`](./BRIEF.md) — approved V1 product scope **once completed**; the checked repository currently has an unfilled starter template.
- [`TECH_CARD.md`](./TECH_CARD.md) — authoritative stack, provider, version, environment and deployment approvals **when created**.
- [`ARCHITECTURE_TEMPLATE.md`](./ARCHITECTURE_TEMPLATE.md) — V1 responsibility boundaries and architectural invariants, when added to the repository and approved.
- [`03-STRUCTURE.md`](./03-STRUCTURE.md) — real repository layout, if adopted.
- [`04-API.md`](./04-API.md) — documented REST contracts, if adopted.
- [`05-DATABASE.md`](./05-DATABASE.md) — schema, tenant integrity, reservations and migrations, if adopted.
- [`DECISIONS.md`](./DECISIONS.md) — pending/approved decisions and ADR index, if adopted.
- [`PROGRESS.md`](./PROGRESS.md) — V1 implementation slices and verification status, if adopted.
- [`reference/templates/ADR_TEMPLATE.md`](./reference/templates/ADR_TEMPLATE.md) — ADR writing template (not an accepted decision).

**Approval rule:** This is a **V1 proposal**, not an instruction to install every listed dependency. Follow the approved `BRIEF.md`, `TECH_CARD.md`, ADRs, and actual codebase when they differ. Resolve conflicts openly before implementing affected components. In particular, do not introduce clinical records, online payment capture, Redis/BullMQ, or realtime infrastructure without an explicit V1 decision.
