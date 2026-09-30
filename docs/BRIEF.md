# Hippocrates.am — Product brief

> **Status:** FULL PRODUCT ACCEPTED, 2026-09-30. The reduced first-release pack is withdrawn. **Implementation:** not started. **Authority:** [ADR-003](architecture/adrs/ADR-003-FULL-PRODUCT-SCOPE.md) and the canonical specification `docs/archive/expanded-v1/HIPPOCRATES_MASTER_SPEC (1).md`.

## Product purpose

A multi-organization platform for dental and oral/maxillofacial care in Armenia. Visitors discover clinics and doctors. Patients book visits, message doctors, ask public questions, and leave reviews after a verified visit. Clinics run branches, staff, schedules, bookings, and operational records. The platform verifies organizations and professionals and moderates public content.

This is the whole product, built one point at a time. It is not a throwaway prototype and not a compliant EHR on the first points.

## Product points

IDs are `FR-001` … `FR-017` in the canonical specification. Delivery order is in `PROGRESS.md`.

| ID | Point |
| --- | --- |
| FR-001 | Public home, navigation, localized content, search entry, registration and sign-in |
| FR-002 | Clinic and doctor directories with filters: area where permitted, specialty, services, prices, ratings, availability, languages |
| FR-003 | Public clinic profile: branches, practitioners, prices, equipment claims, certificates, reviews, contact, booking |
| FR-004 | Public doctor profile: credentials, specialties, work locations, languages, prices, availability |
| FR-005 | Shared service definitions and location-specific offerings with price, duration, and publish lifecycle |
| FR-006 | Branch and practitioner schedules, exceptions, resources, and availability that blocks overlapping allocations |
| FR-007 | Booking with hold, confirm, cancel, reschedule, no-show, attendance, and immutable history |
| FR-008 | In-app and email notices, including reminder templates. SMS only with a configured provider and consent |
| FR-009 | Patient portal: appointments, favorites, chat, own questions and reviews, notices, settings |
| FR-010 | Doctor portal: schedule, bookings in the selected organization, chat, public answers, operational metrics |
| FR-011 | Private text chat requested from the doctor profile, without a required prior booking. The doctor may decline |
| FR-012 | Anonymous public questions, moderation, verified doctor answers, author notices |
| FR-013 | Public searchable Q&A archive. The author stays hidden from the public and from answering doctors |
| FR-014 | First-party reviews after verified attendance, replies, and a dispute path |
| FR-015 | Clinic management: branches, staff permissions, operational patient records, catalog, calendars, bookings, reviews, basic metrics |
| FR-016 | Platform administration: verification, CMS, moderation, plan visibility, stats, audit |
| FR-017 | Organization and professional registration, verification, expiry, and revocation |

## Later points of the same product

- **Finance point:** real online payments, refunds, invoices, and subscriptions. Booking does not pretend to take a card before this point is approved.
- **Clinical point:** charts, notes, treatment plans, surgery workflows, and imaging exchange. Each of these needs its own acceptance spec. Do not invent clinical forms on an earlier point.

## Rules that still hold

- Email and password, Argon2id, revocable server session, HttpOnly cookie. The doctor sets the password. Admins cannot read or set it.
- One web application, one API, one PostgreSQL database. Add a worker only on the point that needs reliable outbound delivery.
- A doctor may work at more than one clinic. Each clinic sees only its own patients and bookings.
- Public pages show published, approved records only. Verification files stay private.
- Two concurrent requests cannot both take the same active slot.
- Production host, region, backup owner, and deploy owner are still unnamed. No production deploy is authorized.

## Reading order

`FUNCTIONALITY_HY.md` → this brief → canonical specification → `ADR-003` → `TECH_CARD.md` → `01-ARCHITECTURE.md` → `PROGRESS.md`.
