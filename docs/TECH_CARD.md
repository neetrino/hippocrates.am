# Hippocrates.am — V1 Technical Approval Card

> A **draft approval worksheet**, not approved architecture. The existing repository `docs/BRIEF.md` is still a template at the time of drafting. Review the source v2.0 product requirements and approve the BRIEF before accepting this card. No app, infrastructure or production configuration must be created merely because a row below names a candidate.

**Project:** Hippocrates.am  
**Size:** C domain complexity, simple initial deployment  
**Target:** Version 1 (MVP)  
**Version:** 1.0-draft  
**Date:** 2026-09-28  
**Approval state:** NOT APPROVED  
**Approver / approval date:** PENDING

**Legend:** `PROPOSED`, `REQUIRED PRACTICE`, `CONDITIONAL`, `TBD`, `APPROVED` (only after sign-off).

## 1. Foundation

| Concern | V1 proposal | State | Owner decision / evidence |
| --- | --- | --- | --- |
| Application shape | Simple monorepo, one Next.js web + one NestJS API | PROPOSED | Confirm existing repo and architecture. |
| Language/runtime | Strict TypeScript + supported compatible Node.js LTS | PROPOSED | Pin exact tested versions. |
| Package manager | pnpm workspaces | PROPOSED | Use one locked install. |
| Task runner | pnpm scripts; no Turborepo initially | PROPOSED | Add tooling only with need. |
| Working practice | Reviewed branches/PRs; protect main | PROPOSED | Existing repo policy governs. |

## 2. Frontend and UX

| Concern | V1 proposal | State | Approval needed |
| --- | --- | --- | --- |
| Framework | Next.js App Router and compatible React | PROPOSED | Compatible pin and actual repo check. |
| Styling | Tailwind CSS or existing approved design system | PROPOSED | Design/token approval. |
| Rendering | Server-first public pages and private portal boundaries | REQUIRED PRACTICE | Test SEO privacy and private caching. |
| Data loading | Server fetch/refresh; optional client cache for heavy interaction | PROPOSED | TanStack Query only after need shown. |
| Locale/i18n | Internationalization-ready, library TBD | TBD | Launch languages, fallbacks and owner. |
| Chat UI | Polling/refetch first; realtime conditional | PROPOSED | Decide UX latency and scale. |
| Public SEO | Safe published-only metadata/structured data | REQUIRED PRACTICE | No private chat or Q&A author leakage. |

## 3. API and data

| Concern | V1 proposal | State | Approval needed |
| --- | --- | --- | --- |
| API | One NestJS modular monolith and versioned REST | PROPOSED | HTTP adapter/validation strategy. |
| API documentation | NestJS OpenAPI | PROPOSED | Generate from reviewed handlers, not draft route tables. |
| Database | One PostgreSQL primary | PROPOSED | Provider, region and supported version. |
| ORM | Prisma + reviewed SQL for DB-only constraints | PROPOSED | Version compatibility, migration ownership. |
| Tenant model | Strong clinic/branch scoping, current memberships, composite integrity | REQUIRED PRACTICE | Threat/DB design review. |
| Booking | DB-serialized canonical doctor/resource occupancy across clinics | REQUIRED PRACTICE | SQL constraints/locking, concurrency tests. |
| Sessions | Opaque server-revocable records in PostgreSQL | PROPOSED | Security review, cookie/CSRF/expiry. |
| Redis | Omit in baseline V1 | CONDITIONAL | Only add with approved measured/technical need. |
| Worker/outbox | Small PostgreSQL-backed worker for reliable reminders if approved | CONDITIONAL | Due-time/retry/deployment strategy. |

## 4. Files and external services

| Concern | V1 proposal | State | Approval needed |
| --- | --- | --- | --- |
| Public media | Approved object storage (S3-compatible candidate) | CONDITIONAL | Provider/region/image restrictions. |
| Verification documents | Separate protected access and retention | REQUIRED PRACTICE | Legal/security storage review. |
| Email | Transactional provider adapter | PROPOSED | Provider, domain, consent and templates. |
| SMS | Optional reminders only | CONDITIONAL | Costs/consent/cadence. |
| Map/geocoding | Optional to satisfy distance-based discovery | CONDITIONAL | Provider/privacy review. |
| Online payment | Not mandatory in baseline V1 | PENDING | Resolve source's optional-deposit vs Phase-2 gateway conflict. |
| External reviews | Defer API-based import | OUT OF V1 | Separate source-rights review in future. |
| CT/PACS/clinical records | No default V1 storage or integration | OUT OF V1 | New medical/legal/clinical approval required. |

## 5. Deployment, operations and security

| Concern | V1 proposal | State | Approval needed |
| --- | --- | --- | --- |
| Web host | Host supporting selected Next.js version | TBD | Provider, region, build/deploy policy. |
| API/worker host | Managed container or approved VPS | TBD | Privacy, availability, networking. |
| PostgreSQL | Provider with appropriate backups/restore | TBD | RPO/RTO, retention, region and credentials. |
| CI/CD | Existing repository's protected PR checks + migration owner | PROPOSED | Confirm workflow and environment secrets. |
| Environments | Separate dev, staging and production | REQUIRED PRACTICE | No unauthorized live-data copies. |
| Monitoring | Correlation IDs, redacted logs, alerting, safe audit | REQUIRED PRACTICE | Choose tools and retention. |
| Auth/privacy | TLS, origin/CSRF/rate limiting, principle of least privilege | REQUIRED PRACTICE | Review with patient privacy constraints. |
| Launch gate | Cross-tenant, anonymity, booking concurrency and backup restore tests | REQUIRED PRACTICE | Evidence and owner approval. |

## 6. Decisions that block implementation

1. [ ] Adopt a reviewed `BRIEF.md` with unambiguous V1 features and exclusions.
2. [ ] Confirm identity provider/login/verification, session lifecycle and recovery.
3. [ ] Approve appointment state machine, clinic confirmation, cancellation and no-show rules.
4. [ ] Confirm review eligibility and off-platform proof decision.
5. [ ] Decide launch languages and user-interface expectations.
6. [ ] Resolve any online deposit/payment requirement for V1.
7. [ ] Approve provider/region/retention, backups and incident ownership.
8. [ ] Review clinic/doctor verification evidence and anonymous Q&A moderation/privacy.
9. [ ] Verify chosen tool versions against official compatibility at initialization and pin lockfile.

## 7. Required final verification (not yet performed)

- [ ] Locked dependencies install, lint, strict typecheck, test and build pass.
- [ ] Backend returns only authorized fields; no cross-tenant read/write failures.
- [ ] Concurrent same-doctor cross-clinic booking and reschedule safety are proven against test PostgreSQL.
- [ ] Q&A identity and private-chat protections pass API/HTML/log regression tests.
- [ ] Session removal blocks revoked organization access without affecting unrelated memberships.
- [ ] Reminders are retryable and cannot change authoritative booking status.
- [ ] Migrations are reviewed and applied once by designated release job, never API startup.
- [ ] Backup restore rehearsal and production release/rollback owner approved.
- [ ] This card has a named approver, date and explicit status `APPROVED`.

**References:** `BRIEF_V1_DRAFT.md` (until approved BRIEF exists), `ARCHITECTURE_TEMPLATE.md`, `02-TECH_STACK.md`, `03-STRUCTURE.md`, `04-API.md`, `05-DATABASE.md`, `DECISIONS.md`.
