# Hippocrates operations

> Production hosting is not selected. This file records release gates without inventing vendor-specific configuration, credentials, alert thresholds, RPO, or RTO.

## Runtime configuration

- Store production values in the hosting provider's secret manager. Never copy them into `.env` or the repository.
- The API validates its environment before opening a port. Production requires:
  - a PostgreSQL `DATABASE_URL`;
  - an HTTPS origin-only `WEB_URL`;
  - complete Resend configuration;
  - complete R2 endpoint, access key, secret key, bucket, and HTTPS public URL configuration.
- Development may omit mail and R2, but partially configured providers are rejected.
- Use separate credentials and data for development, staging, and production.

## Deploy sequence

1. Build and test the exact release commit.
2. Take or verify a recoverable database backup.
3. Run `prisma migrate deploy` once as a dedicated release job with the non-pooled production migration URL.
4. Deploy the API and web artifacts only after the migration succeeds.
5. Check liveness, readiness, login, and one read-only tenant-scoped flow.

Do not run production migrations from a developer machine or on API process startup.

## Health and alerting

- `GET /health` is the compatibility readiness check and verifies PostgreSQL.
- `GET /api/v1/health/live` verifies that the API process can serve requests.
- `GET /api/v1/health/ready` verifies that the API can query PostgreSQL.
- Route liveness and readiness to the hosting platform's probes.
- Alert on sustained readiness failures, HTTP 5xx growth, authentication abuse, migration failure, reminder-job failure, and backup failure.
- Choose alert windows and thresholds from measured traffic before launch; do not use arbitrary defaults.

## Backup and restore

- CI verifies that a PostgreSQL dump containing migrations can be restored into a clean database.
- The production owner must select backup retention, RPO, and RTO before patient onboarding.
- Perform a staging restore drill from a real encrypted production backup before launch and after material schema changes.
- Record the backup identifier, restore duration, integrity checks, and responsible operator without including credentials or patient data.

## Release blockers

Production is blocked until hosting, region, migration owner, backup owner, incident contacts, alert thresholds, RPO, and RTO are explicitly approved in `docs/TECH_CARD.md`.
