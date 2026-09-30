# ADR-003: Full product, delivered point by point

**Status:** ACCEPTED  
**Date:** 2026-09-30  
**Decision owner:** Product owner, this chat. Name not recorded.  
**Supersedes:** the reduced release boundary in ADR-001 and the scope cuts in ADR-002 (no reviews, one clinic per doctor account, in-app notices only, Armenian-only UI, no branches, no chat, no Q&A, no reschedule). Password handling in ADR-002 stays: the doctor sets the password, and admins cannot read or set it.

## Context

The 2026-09-29 and 2026-09-30 documents narrowed Hippocrates.am to a reduced first release and told agents to leave the canonical product in the archive. The owner then required the whole product, advanced one point at a time, and asked to remove that reduced framing from the project files before implementation starts.

## Decision

1. The active product is the canonical specification: `docs/archive/expanded-v1/HIPPOCRATES_MASTER_SPEC (1).md`, features `FR-001` through `FR-017`, then the later finance point, then the later clinical point.
2. There is no reduced first release. Do not omit chat, public Q&A, reviews, branches, richer search, reschedule, reminders, or a doctor working at more than one clinic on the grounds that they were cut earlier.
3. Work still proceeds one point at a time. A later point is not coded inside an earlier point. Empty modules, routes, and tables for a point that has not started are not added in advance.
4. Clinical records, imaging exchange, and live payment capture stay on their own later points. They are part of this product. They are not built from assumptions before that point has its own acceptance spec.
5. Local stack choices stay: `apps/web`, `apps/api`, Next.js, NestJS, PostgreSQL, Prisma, email-and-password sessions. Production host, region, backup owner, and deploy owner stay unnamed.

## Consequences

- `BRIEF.md`, `PROGRESS.md`, and the architecture, API, and database notes follow this ADR when they disagree with the reduced pack.
- ADR-001 and ADR-002 remain in the repository as history. They are not implementation instructions where they shrink the product.
- No application code existed when this decision was recorded.
