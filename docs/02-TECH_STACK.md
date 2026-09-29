# Technology Stack — Hippocrates.am Minimum MVP

> **Local versions are pinned in `TECH_CARD.md` on 2026-09-29.** Production host and region are not chosen. Follow `TECH_CARD.md` if this table differs.

| Area | Minimum suggested selection | Why / limit | Status |
| --- | --- | --- | --- |
| Language | Strict TypeScript on a supported Node.js LTS | One type-checked web/API language | Proposed |
| Repo/package manager | Existing repo layout or lightweight pnpm workspaces | Avoid migration solely for aesthetics | Proposed |
| Web | Next.js App Router + compatible React | Server-first public discovery; protected role-specific portal | Proposed |
| UI | Existing approved design system; Tailwind CSS if selected | Responsive, accessible booking screens | Proposed |
| API | NestJS REST under `/api/v1` | Central role and clinic authorization; OpenAPI contracts | Proposed |
| DB | One PostgreSQL primary | Scheduling correctness and strong relational constraints | Proposed |
| ORM | Prisma with reviewed SQL migrations where needed | Typed queries; DB-level overlap constraints may need raw SQL | Proposed |
| Sessions | Revocable opaque sessions in PostgreSQL + secure cookies | No additional Redis dependency for small MVP | Proposed |
| Search | PostgreSQL indexed name/specialty queries | Only simple published-content search | Proposed |
| Notifications | DB-backed in-app events; email adapter only if approved | No mandatory third-party service or reminder scheduler | Working assumption |
| Public images | Existing approved image stack / object storage only if needed | Profile images only, separate from verification evidence | Conditional |
| Observability | Structured redacted logs + request ID + health checks | Minimal actionable monitoring | Required practice |
| Tests | Unit runner compatible with selected repo, API/DB integration tests, Playwright E2E | Concurrency/tenant/privacy testing is a hard requirement | Proposed |
| CI/CD | Existing protected PR pipeline, reproducible build and reviewed migrations | No auto-production changes by agent | Proposed |
| Hosting | Any owner-approved compatible web/API/PostgreSQL environment | Provider and residency TBD | TBD |

## Avoid unnecessary MVP dependencies

Do not install Redis/BullMQ, separate scheduler, realtime gateway, Elasticsearch, payment SDK, DICOM/PACS client, chat transport, public Q&A search stack, financial analytics pipeline or multi-region services unless a separately approved scope/operational requirement demands them.

## Server and rendering boundaries

- Public Next.js pages may be cached only for published/approved providers and native rating aggregates; clinic-admin, patient and doctor pages are never shared across identities.
- API uses server-side DTO validation, safe error codes and current membership/record ownership on every protected request.
- PostgreSQL enforces overlapping active doctor reservations under transaction-safe rules. Real DB concurrency tests are mandatory.
- Store booking times in UTC and render against the clinic's approved time-zone value. Even one-clinic scheduling requires DST/offset correctness where applicable.
- Keep login secrets, DB credentials, optional email keys and verification evidence access exclusively server-side; `.env.example` contains placeholders only.

## Runtime proposal

```text
apps/web                 Next.js public + protected role layouts
apps/api                 NestJS API with all 10 logical business owners
PostgreSQL               identity, published data, scheduling, booking, review, notices
public media             only if approved profile uploads are in scope
notification worker      only if approved external delivery requires retries
```

An optional worker can share the API's project/database contract without creating an independent microservice architecture. If a complex queue is not necessary, use a simple PostgreSQL-backed due-job/outbox process rather than introducing Redis solely for booking notices.

## Version and provider checklist

- [ ] Inspect repository `package.json`, lockfile, actual build/test scripts and environments.
- [ ] Verify selected Node/Next/React/Nest/Prisma versions are mutually supported; lock them reproducibly.
- [ ] Confirm PostgreSQL version/provider/region, TLS and tested backup/restore.
- [ ] Approve cookie/session design, CSRF/origin validation, password/OAuth decision, rate limits.
- [ ] Approve whether MVP notifications are in-app only or also email; choose provider if needed.
- [ ] Approve public image storage and isolated restricted evidence storage only if needed.
- [ ] Check migration permissions, secrets management, error tracking redaction and deployment approvals.

**Non-negotiable:** source requirements in `BRIEF.md`; state/transitions/API in `04-API.md`; DB invariants in `05-DATABASE.md`. No technology is automatically approved by being listed here.
