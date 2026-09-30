# ADR-004: Four roles and registration links

**Status:** ACCEPTED  
**Date:** 2026-09-30  
**Decision owner:** Product owner, this chat. Name not recorded.  
**Supersedes for current work:** chat in the current delivery sequence (`FR-011`). The rest of ADR-003 stays. Password storage stays hashed; nobody can read a password back.

## Decision

Roles are exactly these four:

| Role | Who | What they do |
| --- | --- | --- |
| `SUPER_ADMIN` | The platform operators | Register a clinic. The clinic owner created in that step is the clinic `ADMIN`. |
| `ADMIN` | The owner of one clinic | Register doctors for that clinic only. |
| `DOCTOR` | A doctor of that clinic | Account exists because that clinic's Admin registered them. |
| `PATIENT` | A person who registers on the public site | From the home page, can book at any clinic. |

Chat is not part of the current work. Do not add conversation tables, routes, or screens until the owner puts it back on the sequence.

## Consequences

- A Patient does not need an Admin to create their account.
- An Admin cannot register a doctor for another clinic.
- A Super Admin does not book patients and does not act as a clinic Admin.
- Point 1 in `PROGRESS.md` is this registration model. Point 6 is paused.
