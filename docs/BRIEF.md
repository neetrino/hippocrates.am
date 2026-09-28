# Hippocrates.am — Product Brief (Version 1)

> **Hippocrates.am V1** is a dental and oral/maxillofacial healthcare marketplace with a small, organization-aware operations system. It connects patients with verified clinics and doctors for discovery, appointment booking, private text communication, anonymous public Q&A, and verified-visit reviews. **This file defines the proposed V1 PRODUCT SCOPE, not approved technical choices or evidence of implemented features.**

**Project:** Hippocrates.am  
**Product category:** Multi-organization healthcare marketplace + basic clinic operations  
**Target release:** Version 1 / MVP  
**Project complexity:** Size C as a product; simple initial deployment is proposed separately  
**Document version:** 1.0-draft  
**Last updated:** 2026-09-28  
**Status:** DRAFT — product-owner approval required  
**Source:** *HIPPOCRATES.AM — Project Overview & Functional Requirements v2.0* (especially its MVP, public marketplace, appointment, communication, review, and administration requirements).  
**Scope rule:** Approved product requirements take precedence over architectural/technology drafts. Explicit V1 exclusions and unresolved decisions below must not be silently implemented or changed by Cursor.

---

## 1. Product overview

### 1.1 Purpose

Create a single, searchable public platform focused on **dental clinics, oral/maxillofacial surgery clinics, and their doctors**, where patients can understand available services, compare published information, request appointments, communicate with doctors, read anonymized public expert answers, and share eligible visit reviews. Give clinics simple, permission-controlled tools to maintain their public presence, service offerings, doctor affiliations, schedules, and bookings.

The platform must support **one patient identity across clinics** and **one doctor profile with multiple clinic affiliations**. Each clinic's private operational information remains isolated. The public product and clinic operations are connected, but an organizational booking is **not** a clinical medical record.

### 1.2 V1 success definition

V1 succeeds when a patient can complete the following working journey without staff using a separate administrative backdoor:

`Discover a published clinic/doctor → inspect the clinic, doctor, services and published prices → view genuinely available times → submit and confirm a permitted appointment → receive appropriate updates → attend the visit → leave an eligible review.`

In parallel, patients can initiate **private text chat from a doctor's profile without a prior booking** and submit **anonymous public dental questions** to a separate moderated, searchable Q&A library. Clinics and verified doctors can maintain the parts of these journeys assigned to them; platform staff can independently verify providers and moderate public content without blanket access to private conversations.

### 1.3 Product boundaries

- **Healthcare Marketplace:** public provider discovery, published profiles, service information, native ratings/reviews, appointments, and public Q&A.
- **Basic Clinic Operations:** clinic/branch/staff access, service offerings, resource-aware schedules, appointments, and simple role-limited dashboards.
- **Shared Platform Capabilities:** identity, access control, provider verification, privacy controls, notifications, moderation, and operational audit.

These are product responsibility areas, **not** three separately deployed applications. Specific deployment and technology choices belong to the approved `TECH_CARD.md` and `02-TECH_STACK.md`.

**Not a V1 clinical EHR:** do not introduce diagnosis, dental charts, signed clinical notes, treatment plans, CT/CBCT/PACS, surgical records, diagnostic-center operations, or dental laboratory workflows as hidden V1 dependencies.

---

## 2. Target audience and user environments

| Actor | V1 job to be done | Access boundary |
| --- | --- | --- |
| Unregistered visitor | Find and compare public clinics, doctors, services, reviews and published Q&A | Published information only |
| Patient | Keep one account, manage appointments, message doctors, ask anonymous public questions, review eligible visits | Own records and authorized conversations |
| Doctor | Manage approved professional profile information, affiliated schedules/bookings, messages, and published expert answers | Own/assigned records under relevant affiliations; no automatic access to full patient history |
| Receptionist | Coordinate authorized clinic/branch appointments and necessary contact details | Assigned clinic/branch permissions; no automatic financial access |
| Clinic owner/admin/manager | Maintain approved clinic public profile, branches, memberships, offerings, schedules and basic activity data | Their own organization; delegated staff permissions |
| Content moderator | Moderate reported public questions, answers, reviews and provider content | Public-moderation scope only; no routine private-chat access |
| Platform administrator | Verify providers, administer the platform and review aggregate operational indicators | Separate platform permissions; no unrestricted patient/private/clinical access |

A single user may hold multiple roles, including patient and doctor. A doctor can work in several clinics with different permissions in each. The source also describes a finance role for the broader product; **advanced finance is outside baseline V1**.

**Six user-facing environments (one connected product):**

1. **Public Space:** homepage, provider directories, filters, public articles/information and Q&A archive.
2. **Clinic Space:** each clinic's published page, branches, doctors, offerings, prices and booking actions.
3. **Patient Portal:** profile, appointments/history, saved providers where approved, messages, own anonymous questions, reviews, notifications and settings.
4. **Doctor Portal:** relevant appointments/schedules, messages, public Q&A answers, permitted profile updates and basic activity overview.
5. **Clinic Management:** essential branches/staff/offerings/resources/schedules/appointments, reviews and simple operating summaries.
6. **Platform Administration:** clinic and doctor verification, approved public content, reports/moderation and safe platform operations.

An environment is a UI access surface; it does not imply an independently deployed backend.

---

## 3. V1 functional requirements (source-derived scope)

The IDs below provide stable references for Cursor plans, API contracts, test cases and acceptance records. **Do not mark a requirement complete merely because its architectural module or screen exists.** Each requirement needs a working authorized journey.

### P0 — Essential marketplace and appointment journey

| ID | Capability | Required V1 behavior |
| --- | --- | --- |
| `V1-001` | Public homepage and provider discovery | Display published clinics and doctors; allow direct doctor search without first choosing a clinic; link to services, appointments, Q&A and required public information pages. |
| `V1-002` | Search, filtering and ranking | Search clinics/doctors by name, specialty and service; combine relevant location, distance, provider type, comparable published price, native rating, availability and language filters where corresponding data exists. Ranking must use native-review credibility principles; **exact formula is pending approval**. |
| `V1-003` | Clinic public pages | Show approved clinic identity, branch/contact information, affiliated doctors, specialties, offerings, published prices, approved images, native reviews, verification information and booking entry points. Clearly distinguish clinic-declared equipment/materials from independently verified fields. |
| `V1-004` | Doctor public profiles | Independent doctor profile with permitted professional biography, specialties, experience, qualifications, languages, approval status and clinic affiliations. Show branch/clinic-specific services, prices and available booking opportunities. |
| `V1-005` | Identity and provider verification | Support patient accounts, doctor identities, separate clinic and doctor verification, and current organization memberships/permissions. Do not treat an identity check as a guarantee of medical quality. |
| `V1-006` | Services and published prices | Maintain a shared service taxonomy and clinic/branch-specific offerings. Indicate when a price or duration is an estimate requiring consultation rather than a fixed final cost. |
| `V1-007` | Schedules and availability | Calculate bookable options using doctor affiliation/branch schedule, service duration, breaks, leave, existing bookings and required limited rooms/equipment. Detect overlapping commitments for the same doctor across participating clinics without exposing the other clinic's patients. |
| `V1-008` | Appointment lifecycle | Patient selects a provider, offering, location and real available time; enters/confirms contact details; creates a booking; receives the approved confirmation path; views, reschedules/cancels when permitted; clinic/doctor staff record check-in, completion or no-show with retained change history. Expired temporary holds release their slot. |
| `V1-009` | Patient and doctor workspaces | Patients see their own upcoming and past organizational appointments; doctors see assigned appointments and their permitted multi-clinic work calendar. A completed appointment does **not** produce a clinical chart or diagnosis. |
| `V1-010` | Essential clinic operations | Clinics manage basic branches, affiliated doctors/staff permissions, service offerings and prices, limited resources, schedules and appointments. Clinic-private records are inaccessible to other clinics. |
| `V1-011` | Basic notifications | Provide in-app and approved outbound notification channels for created/confirmed/changed/canceled bookings, reminders, relevant messages, public-question answers and post-visit review requests. Record delivery outcomes and avoid unnecessary duplicates. |

**Appointment product states in the source:** `Held`, `Requested`, `Confirmed`, `Checked In`, `In Progress`, `Completed`, `Cancelled`, `No Show`. Exact allowed transitions, clinic-approval policy, hold duration, reschedule windows and notification timing must be approved in the booking specification; the presence of a state in this brief is **not** approval of every possible transition.

### P1 — Required V1 communication, trust and administration

P1 is an **implementation sequencing priority**, not permission to omit these features from the completed V1 scope described in source v2.0.

| ID | Capability | Required V1 behavior |
| --- | --- | --- |
| `V1-012` | Private patient–doctor text chat | A signed-in patient can start a private conversation directly from a doctor's public profile **without an existing appointment**; doctor can receive/respond and manage availability/close/block behavior. Participants see their authorized history and new-message notifications. Text only in baseline V1. Clearly state that chat is not an emergency or round-the-clock medical service. |
| `V1-013` | Anonymous public Q&A | A signed-in user can submit a title, question and category. The question is reviewed before publication, particularly for identifying or sensitive disclosures. Only appropriately verified doctors can publish visible professional answers; more than one doctor may answer. All public and responding-doctor views hide the questioner's account identity. |
| `V1-014` | Dedicated searchable Q&A archive | Provide a **separate** public library and canonical pages for published questions and answers, with category, keyword/date/answer-status discovery and suitable safe SEO content. The question author can track their own submissions privately; never auto-publish private chats. |
| `V1-015` | Native reviews and ratings | Eligible patients can review clinics and doctors based on completed visits recognized by Hippocrates. Label reviews from verified visits; support provider replies and content reporting. Patient-reported outcome is subjective experience, not a medical quality verdict. Negative scores alone are not deletion grounds. Keep external-source ratings separate from Hippocrates ratings. |
| `V1-016` | Platform verification and moderation | Authorized platform users review clinic/doctor evidence and approve/reject/suspend relevant public visibility; moderate public Q&A/reviews and manage basic public informational content. Administrative powers are role-limited and auditable. |
| `V1-017` | Basic dashboards and oversight | Provide minimal role-appropriate patient, doctor, clinic and platform overviews from V1 data: next appointments, relevant workloads, missed/canceled visit counts, basic native ratings and aggregate provider/booking activity where supported. No advanced financial BI is implied. |

**Source scope note:** The source describes an off-platform visit-verification mechanism as something to plan for, but it does not fully define acceptable evidence, adjudication, or abuse controls. Baseline V1 can verify **known completed platform appointments**; any additional off-platform review eligibility requires an approved separate rule. The source mentions push, protected chat attachments and external reviews as later opportunities; they are not mandatory baseline V1.

---

## 4. Critical product flows and acceptance criteria

The following are **product acceptance criteria**, not implementation instructions. The architecture, API and database documents should provide the technical evidence required to satisfy them.

| ID | User journey | Acceptance criteria |
| --- | --- | --- |
| `AC-01` | Public search to booking | A visitor finds a published doctor directly, compares approved offerings/prices, selects a truly available slot and completes the authorized booking flow after any required sign-in. Unpublished/private data is not returned. |
| `AC-02` | One identity, several clinics | The same patient uses one account across Clinic A and Clinic B. Each clinic sees only its own permitted booking/operational details. |
| `AC-03` | One doctor, several clinics | A doctor works at two participating clinics. Concurrent overlapping appointment requests cannot create two successful conflicting confirmed reservations, including required limited resources. Neither clinic learns the other's patient details. |
| `AC-04` | Legitimate cancellation and rescheduling | Only authorized actors can change a booking according to approved policy; expired holds release capacity; the change history is retained and affected parties receive appropriate notification intent. |
| `AC-05` | Current staff authorization | Revoking a staff member's Clinic A membership blocks subsequent Clinic A data access while leaving separately authorized Clinic B access intact. |
| `AC-06` | Chat without booking | A patient can initiate and continue text chat from a doctor's public profile without an appointment; another patient, another clinic and routine moderators cannot read it. |
| `AC-07` | Truly anonymous public questions | A user submits a question and receives responses. The public archive, responding doctors, APIs, metadata and ordinary logs do not expose their identity. Question text is checked for inadvertent personal disclosures before publication. |
| `AC-08` | Review after visit | A completed, eligible native appointment permits the approved review flow; cancellation/no-show alone does not establish review eligibility. Provider replies/reporting use restricted permissions. |
| `AC-09` | Provider verification and transparency | Clinics and doctors have independently reviewable approval statuses. Public claims distinguish platform-verified facts from provider self-declarations and show only published information. |
| `AC-10` | Notification reliability | A temporary email/SMS outage does not invalidate a confirmed booking; retries are bounded and duplicate delivery is controlled. Recipient messages disclose only necessary booking/communication details. |
| `AC-11` | Safe portal/admin behavior | Doctor, receptionist, clinic admin, moderator and platform admin receive distinct authorized data. Platform administration does not imply general private-message or future clinical-data access. |
| `AC-12` | Release readiness | Approved V1 flows work in a staging environment; privacy/isolation, concurrent-booking, backup/restore and critical role tests have recorded results before processing real appointments. |

**Hard gates:** `AC-02`, `AC-03`, `AC-05`, `AC-06`, `AC-07`, `AC-10`, and `AC-12` are not optional simplifications. They protect foundational multi-clinic correctness, privacy and operational continuity.

---

## 5. V1 operational and content requirements

### 5.1 Public and profile content

- Homepage: navigation, direct search, clinic/doctor discovery, specialties, link to Q&A archive and informational links.
- Clinic cards: name, logo/approved image, address, main specialties, native rating/review count, verification badge/status and next available appointment when supported.
- Clinic page: verified public facts, self-declared equipment/materials clearly labeled, branch details, doctors, offerings, prices and booking action.
- Doctor page: approved professional profile and qualifications, multiple affiliations, clinic-specific offerings and schedule access, private-chat entry, published public answers and eligible reviews.
- Informational content: About, Author, articles/useful information, Contact, Privacy Policy and Terms. Legal copy needs appropriate owner/legal review.
- Language selector is part of the public experience; **launch languages, fallback and translation ownership remain open**. Do not invent translated medical/legal content or promise all source languages without approval.

### 5.2 Clinic and provider onboarding

- Clinic onboarding and doctor identity/credential approval are separate actions. Publication follows approved verification/moderation rules.
- A doctor's platform identity is not duplicated for each clinic. Local affiliation, schedule, service eligibility, and staff privileges belong to their respective organization/branch context.
- Basic staff invitations, branches, work calendars and published offerings are required only to support the V1 journey; Phase 2 expands operations and permission administration.

### 5.3 Reviews, rating and ranking integrity

- The product must distinguish **native Hippocrates reviews** from external reviews and identify verified-visit status.
- Proposed native ranking inputs from the source: average rating, verified review count and statistical confidence. The formula, cold-start treatment, tie-breaks, moderation appeals and whether sponsored placement exists require a separate approval decision.
- Published provider claims, user reviews and external rating sources must be labeled according to their provenance. Do not combine external review scores into the native score by default.

### 5.4 Notifications and reminders

- Source-proposed initial reminder cadence: **24 hours and 2 hours before** an appointment, configurable and subject to owner approval.
- Notifications cover relevant booking events, doctor schedule summaries, private-message arrival, answer publication and eligible post-visit review requests.
- In-app notifications and approved outbound channels are part of V1; exact email/SMS split, provider, user preferences, consent rules, message language and delivery expectations remain open.

---

## 6. Explicitly outside baseline V1

The broader source describes these as later-stage or unresolved capabilities. **Do not scaffold their business tables, APIs or screens in V1 merely to prepare for the future.** Preserve only clean boundaries where useful.

| Later capability | Default handling |
| --- | --- |
| Comprehensive clinical/EHR records, diagnoses, dental charts, signed medical notes, treatment plans and surgery workflows | Phase 3 / separately approved clinical scope and privacy/legal review |
| Diagnostic and CT/CBCT centers, PACS/DICOM exchange, dental laboratories, telemedicine, external clinical-system integrations | Phase 3 / separate scope and contracts |
| Advanced branch/personnel management, comprehensive clinic finance, doctor settlements, refunds, subscriptions, commissions and advanced analytics | Phase 2 or later after specific approval |
| Real payment gateway and mandatory online deposits | Not part of **approved default** V1; optional-deposit wording in the source requires explicit decision before changing the booking flow |
| Automated imported external ratings/reviews and combined external ranking | Phase 2 subject to official API and data-usage rules; sources must remain clearly separated |
| Protected private-chat document/image exchange, additional outbound channels and push notifications | Later phase, unless separately approved for V1 |
| Mobile native application, independent microservices, complex realtime/event infrastructure | Not part of V1 product requirement; do not assume a technical implementation need |

**Deferred UI handling:** The source describes patient payment history and clinic finance within the broader long-term portals. Baseline V1 must not show fake transactions, nonfunctional payment buttons or invented financial dashboards. Exclude or clearly mark such areas as future functionality until approved.

---

## 7. Non-functional product requirements

| Concern | Product requirement | Acceptance evidence |
| --- | --- | --- |
| Privacy and tenant separation | A shared patient account does not merge clinics' private data; clinic/branch actions are scoped by live membership and permissions. | Authorization and cross-clinic negative tests |
| Anonymous Q&A | A public question author's internal identity is needed only for their private ownership and notifications; it cannot leak through public text/projections, doctor views or indexing. | Content moderation and API/HTML/metadata tests |
| Confidential messaging | Private chats are participant-only by default; moderation access is exceptional, lawful, restricted and auditable. Chat does not grant general medical-record access. | Participant/role denial tests and audit review |
| Scheduling integrity | Doctor and limited-resource conflicts are prevented for participating clinics, even with concurrent requests. External clinic systems not integrated with Hippocrates cannot be assumed synchronized. | Concurrent booking tests and clear product disclosure |
| Availability and notification safety | Provider outages or repeated notification attempts cannot silently alter confirmed appointment state. | Failure/retry and duplicate tests |
| Verification and trust | Clinic and doctor checks are distinct; native vs external and verified vs self-declared information is clearly identified. | Moderation and published-profile acceptance |
| Accessibility, public SEO and language | Public discovery and Q&A are usable, safely indexable, and localization-ready; launch languages and measurable accessibility/performance targets await approval. | Public page and accessibility checks after targets are set |
| Audit and recovery | Sensitive administrative and booking actions have traceable history. Backup and restore must be tested before real patients use the service. | Recorded audit checks and restore rehearsal |
| Data governance | Minimize sensitive data; define hosting location, lawful basis, retention/deletion and communication disclosures with appropriate reviewers before launch. | Approved legal/security and operational checklist |

No specific traffic, uptime, latency, or launch-volume guarantee is established by the source. Targets must be defined and tested rather than asserted in this brief.

---

## 8. Delivery priority and release slicing

**All requirements marked V1 above belong to the target completed MVP**. The sequence below is a development plan suggestion, not permission to ship a smaller product without scope change.

| Slice | Suggested outcome | Requirements emphasized |
| --- | --- | --- |
| S0 — Validate scope | Adopt BRIEF, close scope contradictions, approve TECH_CARD and core policies | All; especially open decisions |
| S1 — Secure accounts and clinic identity | Safe role/organization foundations, independent patient/doctor profiles and approvals | V1-004, V1-005, V1-010 |
| S2 — Provider profiles and offerings | Published clinics, doctor affiliations, branches, specialty taxonomy and price-aware service offerings | V1-001, V1-003, V1-004, V1-006 |
| S3 — Safe scheduling/booking | Real slot availability, multi-clinic doctor/resource conflict protection, appointment history | V1-007, V1-008, V1-009 |
| S4 — Discovery and portals | Search/filters/ranking, key public content, core patient/doctor/clinic surfaces | V1-001, V1-002, V1-009, V1-010 |
| S5 — Private communication | Profile-initiated private text chat with safe access controls | V1-012 |
| S6 — Public knowledge | Anonymous submission, prepublication review, verified answers, searchable library | V1-013, V1-014 |
| S7 — Reviews and reminders | Native verified-visit reviews, relevant notifications, provider responses | V1-011, V1-015 |
| S8 — Platform readiness | Complete approval/moderation and basic dashboards; run full safety/quality checks | V1-016, V1-017; all ACs |
| S9 — Acceptance/release | Verify all approved V1 flows in staging and complete safe release readiness | AC-01 through AC-12 |

Actual progress must be verified from the repository and recorded in `PROGRESS.md`; this schedule does **not** state that any slice has been implemented.

---

## 9. Product decisions requiring owner approval

**These are unresolved.** Proposed defaults minimize accidental scope expansion; they are not final product policy.

| ID | Open product decision | V1 working assumption until approved |
| --- | --- | --- |
| `PD-01` | The source includes an optional booking deposit, while the payment gateway appears in Phase 2. Is any real V1 deposit needed? | No mandatory online payment or payment gateway; no fake paid state. |
| `PD-02` | Which launch languages and locales, translation responsibilities and fallback strategy? | Localization-ready interfaces; actual languages require approval. |
| `PD-03` | What signup/login methods, verification requirements, account recovery and notification consent? | Revokeable sessions and privacy protections; authentication UX is TBD. |
| `PD-04` | When is a booking immediately confirmed vs awaiting clinic approval? What are cutoffs for cancellation/rescheduling, hold duration and no-show authority? | Support explicit states without inventing the production transition policy. |
| `PD-05` | Do reviews require a known completed platform booking, or may independently verified off-platform visits qualify in V1? | Verified known completed platform appointments only until approved proof procedure. |
| `PD-06` | What native ranking formula, new-clinic treatment and display rules apply? Are paid placements allowed? | Native average/count/reliability are inputs; no unapproved mathematical formula or undisclosed placement. |
| `PD-07` | What clinic/doctor verification evidence, retention and appeal workflow is legally appropriate? | Minimal protected evidence handling after security/legal review. |
| `PD-08` | What private-chat acceptance, response-time expectations, limits, block/report process and retention policy apply? | Text chat from profile without appointment; no promise of urgent medical response. |
| `PD-09` | Which notification channels, reminder settings and user opt-in/opt-out rules launch? | Essential event support with configurable reminders; exact channels/cadence need approval. |
| `PD-10` | Which location/geocoding service and distance-data handling are needed to fulfill filters? | Basic city/branch filtering; distance-based features must have approved data/provider UX. |
| `PD-11` | Which organization/branch management functions are baseline V1 versus advanced Phase 2? | Only what is needed for verified profiles, affiliations, published offerings, schedules and booking operations. |
| `PD-12` | Hosting jurisdiction, legal bases, retention/deletion, emergency disclosure and production readiness owners? | No real patient onboarding until the applicable privacy/security and restore gates are signed off. |

**Approval procedure:** the product owner confirms the revised V1 BRIEF. An impactful decision is recorded in `DECISIONS.md` (and an ADR if architectural). Update `04-API.md`, `05-DATABASE.md`, `TECH_CARD.md` and `PROGRESS.md` only when relevant. Cursor should present unresolved choices clearly to the owner rather than silently selecting them.

---

## 10. Documentation and working rules

- **This file (`BRIEF.md`):** once approved, the authoritative V1 product/functional scope and acceptance intent. It does not choose cloud providers, ORM versions or database schemas.
- **`TECH_CARD.md`:** approved technology, deployment/security configuration and operational choices.
- **`ARCHITECTURE_TEMPLATE.md` / `01-ARCHITECTURE.md`:** module boundaries, cross-clinic access, booking correctness and privacy invariants.
- **`02-TECH_STACK.md`:** proposed and approved technology versions, optional components and compatibility constraints.
- **`03-STRUCTURE.md`:** actual/proposed repository layout, distinguished from existing implementation.
- **`04-API.md` / `05-DATABASE.md`:** reviewed API contracts, state transitions, schema, concurrency and ownership constraints.
- **`DECISIONS.md` / ADRs:** traceable pending and accepted choices, with approver/date.
- **`PROGRESS.md`:** verified delivery status, tests, blockers and release evidence.

**Cursor handoff:** Review the source v2.0, this brief and the actual repository; reconcile the unfilled/replaced template and approved decisions **before implementing**. Ask the product owner about material gaps, offering concrete alternatives in understandable Armenian or Russian. Technical documents may be written in English. Do not infer completed code or deployed infrastructure from reference templates; do not modify production data or deploy based on this draft.

**Release gate:** change `Status` from `DRAFT` to `APPROVED` only after recording the owner and approval date and resolving/blocking all material V1 decisions. Until then this is a source-grounded proposal for review, not authorization to provision infrastructure or start unapproved implementation.
