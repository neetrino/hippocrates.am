# ADR-001: Minimum MVP Scope Reduction to 23 Functions

**Status:** ACCEPTED for the 23-function boundary, deferred list, one location per clinic, and one active clinic per doctor. Booking confirmation and notifications are not part of this acceptance.  
**Date:** 2026-09-29  
**Decision owner:** Product owner, chat confirmation 2026-09-29. Name not recorded.  
**Affected docs:** BRIEF, TECH_CARD, 01-ARCHITECTURE, 02-TECH_STACK, 03-STRUCTURE, 04-API, 05-DATABASE, DECISIONS, PROGRESS

## Context

An earlier expanded V1 draft documented 46 functions including messaging and anonymous public Q&A. The user subsequently supplied `Hippocrates_Minimum_MVP_Functions_HY.pdf`, retaining 23 minimum functions. The earlier documentation must be narrowed consistently to avoid AI agents implementing deferred features as though they still belong to the immediate release.

## Proposed decision

Treat the user's 23-item list as the **proposed minimum release boundary**. Retain only the supporting security, consistency, verification, audit and recovery mechanisms required for those features. Historical full-V1 descriptions remain archived for potential later phases, not active minimum-MVP tasks.

## Consequences

- Reduced public and clinic operations and lower integration burden; no baseline chat/Q&A/reminder platform.
- Confirmation, cancellation, visit completion and transaction-safe slot reservation remain necessary to make booking and post-visit reviews legitimate.
- Doctor affiliation and clinic branch limits are **separate open decisions**; do not silently decide from the 23-item names alone.
- Any already-built removed feature must be inventoried and de-scoped through a separate approved migration plan, not deleted automatically.

## Alternatives

1. Continue expanded 46-function V1 unchanged — inconsistent with latest minimum list.
2. Ship only the 23 chosen functions with necessary internal safeguards — proposed here.
3. Change requirements again after explicit owner review — would require a superseding scope record.

## Acceptance gate

On 2026-09-29 the owner accepted the 23-function boundary, the deferred list, one location per clinic, and one active clinic per doctor. The owner then delegated the booking choice: `REQUESTED` occupies the slot, the clinic confirms, cancellation has no cutoff and no auto-expiry, and notices are in-app only. The repository audit found no application code. A personal name was not recorded. This ADR does not authorize deleting data, creating the application, or deploying to production. The accepted documents are the build contract for a later implementation task. Production host, region, backups, and the deploy owner remain open.
