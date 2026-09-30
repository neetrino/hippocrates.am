# ADR-001: Reduced pack (withdrawn)

**Status:** SUPERSEDED by ADR-003 on 2026-09-30. This record is history. Do not implement the reduced boundary.  
**Date:** 2026-09-29  
**Decision owner:** Product owner, chat confirmation 2026-09-29. Name not recorded.  
**Affected docs:** BRIEF, TECH_CARD, 01-ARCHITECTURE, 02-TECH_STACK, 03-STRUCTURE, 04-API, 05-DATABASE, DECISIONS, PROGRESS

## Context

An earlier expanded draft documented messaging and anonymous public Q&A. The owner then supplied a short function list and asked to narrow the documents. That narrowing is withdrawn by ADR-003.

## Proposed decision

Treat the short list as history only. Do not use it as the release boundary. The canonical specification is the active product.

## Consequences

- This ADR no longer limits the product. Follow ADR-003.
- No application code existed when the reduction was recorded.

## Alternatives

Kept as history. ADR-003 chose the full product, delivered point by point.

## Acceptance gate

The 2026-09-29 acceptance of a short boundary is withdrawn. This file is not the build contract. Production host, region, backups, and the deploy owner remain open.
