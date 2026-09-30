# ADR-XXX: [Decision Title]

> **Hippocrates.am — Architecture Decision Record Template**
>
> When using this template, copy it to `docs/architecture/ADR-XXX-<slug>.md` and replace all placeholders.
> A `Proposed` decision is not approved. Cursor must not independently implement it or change its status to `Accepted`.

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY  
**Date:** YYYY-MM-DD  
**Authors:** [Names]  
**Project phase:** Hippocrates.am V1  
**Affected modules:** [Modules / user roles / organizations]  
**Approver:** [Responsible project owner, once approved]

---

## Context

[Describe the actual V1 problem and why a decision is needed now. Clearly distinguish approved requirements from assumptions.]

**Requirement source:** [Approved BRIEF.md section / TECH_CARD.md / recorded decision]  
**Scope boundaries:** [What belongs in V1 and what belongs in later phases. Do not include CT/PACS, Dental Chart, or comprehensive medical records in V1 unless the approved BRIEF explicitly requires them.]

**Questions to resolve:**
- [Question 1]
- [Question 2]

**Constraints:**
- [Constraint 1]
- [Constraint 2]
- [When relevant: clinic/tenant data isolation and current membership/permission checks]
- [When relevant: restricted access to personal/medical data, appropriate legal approval, and auditing]
- [For scheduling decisions: protection against concurrent requests and double booking]

---

## Decision

[Describe ONE decision precisely, including module ownership, interactions, and limitations. If the status is `Proposed`, describe the solution as a proposal rather than an approved choice.]

**Module contracts:** [Public interfaces, APIs, events, or "None"]  
**Data changes:** [New entities / migrations / "None"]  
**Security impact:** [Required checks or "None"]

```
[Code, diagram, or schema, if needed]
```

---

## Alternatives Considered

### Option A: [Name]

**Description:** [What this option entails]

**Advantages:**
- [Advantage 1]
- [Advantage 2]

**Disadvantages:**
- [Disadvantage 1]
- [Disadvantage 2]

---

### Option B: [Name] [Mark as SELECTED only after approval]

**Description:** [What this option entails]

**Advantages:**
- [Advantage 1]
- [Advantage 2]

**Disadvantages:**
- [Disadvantage 1]
- [Disadvantage 2]

**Selection rationale:** [Complete only after an option has actually been selected and approved. Explain why it fits V1.]

---

### Option C: [Name]

**Description:** [What this option entails]

**Advantages:**
- [Advantage 1]

**Disadvantages:**
- [Disadvantage 1]

---

## Consequences

### Positive
- [Consequence 1]
- [Consequence 2]

### Negative
- [Consequence 1]
- [Mitigation: how the impact will be reduced]
- [When relevant: residual privacy, tenant-isolation, booking-correctness, or data-migration risks]

### Neutral
- [Change 1]
- [Any impact on later clinical or diagnostic phases]

---

## Implementation

### Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Add appropriate unit and integration tests; where applicable, include concurrency, tenant-isolation, and privacy tests.]
5. [Update related requirements and technical documentation only within the scope of the approved change.]

### Changed Files / Modules
- `path/to/file1`
- `path/to/file2`
- [Use actual repository paths. Do not create files merely because they appear in this template.]

---

## Related Decisions

- [ADR-YYY: Related Decision](../ADR-YYY-<slug>.md) — [Dependency / extension / supersession]
- [If none exist, write "None" and remove the example link above.]

---

## Notes

[Additional details, discussion records, and requirement sources]

**Verification and acceptance criteria:**
- [How will the team verify that the decision was implemented correctly?]
- [For production-impacting changes: rollback and recovery steps]

**Cursor rule:** This file is a template, not an approved architectural decision. An incomplete or `Proposed` ADR does not authorize implementation, modification of real data, or production changes.

**Related documents:**
- [BRIEF.md](../../BRIEF.md) — V1 functional scope (when completed and approved)
- [TECH_CARD.md](../../TECH_CARD.md) — technical decisions (when available and approved)
- [DECISIONS.md](../../DECISIONS.md) — decision and approval history (if maintained)
