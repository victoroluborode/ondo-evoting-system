# Chapter Four Guide: System Implementation and Results

This guide is a report-writing aid for Chapter Four. It reflects the current implementation of the Ondo State Bimodal E-Voting System: a two-role system built around voters and administrators, voter self-registration with admin approval, staged biometric authentication, encrypted vote casting, offline-aware voting, election lifecycle control, and administrative oversight.

## 4.1 Introduction

This section should introduce the chapter as the implementation, testing, and evaluation part of the report.

Suggested paragraph:

```text
This chapter presents the implementation, testing, and evaluation of the proposed bimodal e-voting system for Ondo State's nine Federal Constituencies. The system was implemented as a full-stack prototype comprising a Node.js/Express backend, a PostgreSQL database, and an Expo/React Native mobile application supporting two distinct user roles: voters and election administrators.

Unlike the originally scoped three-tier role structure of voter, officer, and admin, the implementation was deliberately simplified during development to a two-role model: voters and administrators. In the implemented version, voters are responsible for initiating their own registration, while administrators review and approve registrations before voting access is granted.

This chapter documents the registration and approval workflow, bimodal voter authentication, ballot access, encrypted vote casting, offline-aware voting, result aggregation, and administrative oversight tools. It also presents functional test results, security analysis, and an honest account of the prototype's boundaries and limitations.
```

Key points to cover:

- The chapter explains how the designed system was implemented.
- The current system has two main user roles: voter and administrator.
- Voter registration is self-initiated, but administrative approval is required before login.
- The implementation covers registration, biometric authentication, voting, offline queueing, result collation, and admin control.
- The chapter also reports testing outcomes, security observations, and comparative analysis.

## 4.2 System Implementation

This section should describe how the system was built. Organize it around the main modules so the reader can connect the Chapter Three design to the working prototype.

### 4.2.1 Implementation Environment

| Component | Technology Used | Purpose |
| --- | --- | --- |
| Backend API | Node.js and Express.js | Handles authentication, registration, ballot access, voting, and administrative operations |
| Database | PostgreSQL | Stores voters, administrators, elections, candidates, parties, votes, results, and audit data |
| Mobile App | Expo and React Native | Provides voter and admin user interfaces |
| Navigation | React Navigation native stack | Manages role-based screen flows and navigation state |
| Authentication | JSON Web Tokens and bcrypt | Protects sessions and stores passwords securely |
| Vote and biometric encryption | AES-256-GCM | Encrypts vote payloads and stored facial embeddings at rest |
| Vote integrity | SHA-256 | Generates vote integrity hashes and non-repudiating receipt codes |
| Facial recognition | TensorFlow.js Node and `@vladmandic/face-api` | Extracts and compares 128-dimension facial embeddings for face verification |
| Device fingerprint check | `expo-local-authentication` | Invokes Android BiometricPrompt or iOS LocalAuthentication |
| Mobile offline support | AsyncStorage and NetInfo | Queues votes locally without connectivity and detects reconnection for sync |
| Admin two-factor authentication | One-time passcode via mocked email | Adds a second verification step to admin login beyond password |

### 4.2.2 Backend Implementation

The backend serves as the system's control layer. It validates every request, enforces election rules, manages authentication state, and exposes a REST API consumed by the mobile application.

Key route groups:

- `/api/auth`: voter self-registration, VIN validation against the mock INEC voter register, password-based login, biometric verification, and password recovery using OTP or email-link flows.
- `/api/ballots`: public constituency/LGA listing, public election-status checks, and constituency-scoped ballot retrieval.
- `/api/votes`: vote casting, offline voting package issuance, offline vote synchronization, public receipt verification, and constituency result retrieval.
- `/api/admin`: admin authentication with password plus OTP, election lifecycle management, candidate and party management, constituency and LGA management, voter approval/rejection/reinstatement, dashboard metrics, and audit log retrieval.

Service modules separate business logic from routing:

- `authService`
- `authSessions`
- `voteService`
- `ballotService`
- `adminService`
- `electionLifecycle`
- `faceService`
- `email`
- `sms`

Middleware modules handle JWT verification, role-scoped access control, request logging, security headers, and rate limiting.

Important implementation principle:

```text
A voter is never granted ballot access immediately after password login. The backend issues a short-lived partial session token. Only after fingerprint or facial verification does the backend issue the final voting token required to retrieve a ballot or cast a vote.
```

The same staged principle is applied to administrator login. Password verification alone is insufficient. The backend issues a five-minute pending token and emails a six-digit one-time code. The final administrative session token is issued only after that code is confirmed.

### 4.2.3 Database Implementation

The PostgreSQL database is the system's central data store. Voter and candidate records are partitioned by constituency using `PARTITION BY LIST (constituency_id)`, enforcing physical data isolation between Ondo State's nine Federal Constituencies rather than relying only on application logic.

Principal tables:

- `constituencies` and `local_government_areas`: store the fixed nine-constituency and eighteen-LGA structure.
- `inec_voter_register`: mock authoritative voter roll used to validate VIN eligibility before registration.
- `voters`: partitioned by constituency; stores encrypted biometric enrollment data and registration status values such as `pending_review`, `registered`, and `suspended`.
- `election_admins`: administrator accounts.
- `elections`: managed election records that progress through `draft`, `open`, `closed`, `published`, and `archived`.
- `parties` and `candidates`: party and candidate records, with candidates partitioned by constituency and constrained so a party cannot field more than one candidate in the same constituency.
- `votes`: partitioned by constituency; stores AES-256-GCM encrypted vote payloads, SHA-256 integrity hashes, receipt codes, and `election_id`.
- `results`: aggregate vote-count table incremented atomically when a vote is recorded.
- `voter_auth_sessions`: tracks partial-to-final session upgrades and independent fingerprint/facial verification attempts and lockouts.
- `admin_otp_sessions`: tracks pending administrator logins awaiting one-time-code confirmation.
- `audit_logs`: append-only log of state-changing actions by voters, admins, and system processes.

Important database correction:

```text
Vote uniqueness is tied to a specific election through votes.election_id rather than to a permanent voter flag. This allows the same voter to participate in a later election cycle after the previous election has been archived, while still preventing duplicate voting within the same open election.
```

### 4.2.4 Voter Registration and Approval Module

The implemented registration model differs from the originally scoped officer-led approach. During implementation, the field-officer role was removed and registration became voter-initiated, with administrative approval as the safeguard.

Implemented registration flow:

1. The voter enters a VIN.
2. The VIN is validated against the mock INEC voter register.
3. If eligible and not already registered, the voter confirms their official name, constituency, and LGA. These values are read-only and sourced from the register.
4. The voter supplies optional contact details.
5. The voter completes fingerprint hardware confirmation and captures a live face photograph.
6. The voter sets an account password.
7. The complete registration is submitted in one request.
8. The backend extracts a facial embedding from the submitted photograph and stores the registration with `pending_review` status.
9. The voter cannot sign in until an administrator approves the registration.
10. Administrators may approve, reject/suspend, or reinstate a voter.

Reason for this change:

```text
Without an approval gate, anyone who knows a valid VIN could self-register and immediately obtain voting credentials. Administrative review reintroduces a human verification checkpoint without requiring a field officer to be physically present during registration.
```

### 4.2.5 Voter Authentication and Biometric Verification Module

Voter authentication is staged in two parts.

Password stage:

- The voter submits VIN or email plus password.
- If credentials are valid and the voter has not already voted in the currently open election, the backend issues a five-minute partial session token.

Biometric stage:

- Fingerprint is offered as the default verification method.
- Facial recognition is offered as an explicit fallback after three unsuccessful fingerprint attempts.
- Each method has its own independent attempt counter and lockout state.
- Exhausting fingerprint attempts does not consume the voter's facial recognition attempts.

Fingerprint verification:

- Uses the device's native biometric prompt through `expo-local-authentication`.
- The mobile app reports success or failure to the backend.
- The backend treats this as a device-level authentication factor.
- This reflects a real mobile API constraint: most consumer devices confirm that a device-trusted fingerprint unlocked the prompt, but they do not expose which specific person's fingerprint was used.

Facial recognition:

- Performs genuine server-side verification.
- The mobile app captures a live photograph and sends it to the backend.
- The backend extracts a 128-dimension facial embedding using TensorFlow.js and `@vladmandic/face-api`.
- The embedding is compared by cosine similarity against the registration embedding.
- A match is accepted only above a configured similarity threshold.
- The client never determines its own pass/fail result for facial recognition.

Suggested flow:

```text
VIN/email + password
  -> five-minute partial session token
  -> fingerprint attempt
  -> facial fallback if fingerprint fails repeatedly
  -> final voting token
  -> ballot access
```

### 4.2.6 Ballot and Vote Casting Module

After the final voting token is issued, the voter may request a ballot. The backend strictly returns only candidates registered within the voter's own constituency partition.

Vote casting is enforced inside a single atomic database transaction:

- The voter's account must be in `registered` status.
- No existing vote may already exist for the voter, constituency, and currently open election.
- The selected candidate must belong to the voter's own constituency.
- The vote payload is encrypted with AES-256-GCM.
- A SHA-256 integrity hash is generated.
- A separate salted, non-repudiating receipt code is generated.
- The aggregate result count for the selected candidate is incremented atomically.
- The voter's session token is permanently invalidated.

Public receipt verification:

```text
A standalone receipt verification screen allows a voter to confirm that a receipt code corresponds to a recorded vote and timestamp without signing in. It does not reveal the selected candidate, preserving ballot secrecy while still providing a verifiable audit trail.
```

### 4.2.7 Offline-Aware Voting Module

The system implements an offline-aware voting path for unreliable connectivity environments.

Offline voting flow:

1. Immediately after successful biometric verification, while the device still has connectivity, the mobile app pre-fetches a signed offline voting package.
2. The package contains the voter's ballot and a JWT-based offline voting token bound to the voter, constituency, and active election.
3. If online vote submission fails because of a network error, the app records the vote locally using AsyncStorage.
4. The queued vote is tagged with a locally generated offline vote identifier and client-recorded cast timestamp.
5. On app launch, foreground, or detected reconnection through NetInfo, the app attempts to sync queued votes.
6. The backend reconciles each queued vote through the same atomic vote-recording logic used for online votes.
7. Duplicate protection is keyed on the offline vote identifier so retried sync attempts are recorded exactly once.

Important testing finding:

```text
An early offline-sync implementation omitted the election identifier during reconciliation. This could have allowed an offline-synced voter to cast a second duplicate vote. The defect was corrected by propagating the election identifier from the signed offline token into the vote-recording logic, restoring the same one-voter-one-vote-per-election guarantee used for online votes.
```

### 4.2.8 Election Lifecycle and Scheduling Module

The system manages one election cycle through a controlled state machine:

```text
draft -> open -> closed -> published -> archived
```

Implementation points:

- Opening an election requires every constituency to have at least one registered candidate.
- Only one election of the same type can be open at a time.
- Published results are treated as final.
- Archiving a published election allows a new election cycle to begin without disturbing historical records.
- Administrators can set or adjust a scheduled election end time while the election is in `draft` or `open` status.
- A background scheduler checks once per minute for elections whose scheduled end time has passed.
- When the time passes, the scheduler automatically transitions the election to `closed` and records the action in the audit log.

### 4.2.9 Admin Module

The administrative interface provides:

- Two-factor login using password followed by emailed OTP.
- Dashboard summaries of statewide registration counts, votes cast, and turnout percentage by constituency.
- Dashboard suppression before an election is active, preventing misleading pre-election figures.
- Pending voter registration review.
- Voter approval, rejection, and reinstatement.
- Election lifecycle control, including scheduled end-time configuration.
- Candidate and party management with edit and delete support.
- Database-enforced prevention of duplicate party assignment in a constituency.
- Constituency and LGA management.
- Constituency-level result viewing.
- Statewide summary of total votes and constituencies reporting results.
- Searchable voter directory.
- Audit log viewer filterable by actor type.
- Audit records for voters, administrators, and system actions such as automatic election closure.

### 4.2.10 Mobile Application Implementation

The mobile application was implemented in Expo/React Native and organized into two role-based navigation stacks plus a shared unauthenticated entry stack.

Entry screens:

- Voter sign-in landing screen.
- Voter self-registration: VIN check, detail confirmation, fingerprint enrollment, face enrollment, and password creation.
- Registration pending confirmation.
- Password reset.
- Admin login with OTP verification.
- Standalone receipt verification.

Voter screens:

- Voter dashboard with live election status and voting progress.
- Fingerprint verification.
- Facial recognition verification.
- Ballot selection.
- Vote review and confirmation.
- Vote receipt with copy-to-clipboard support.
- Already voted state.
- Offline-vote-queued confirmation state.

Admin screens:

- Admin dashboard.
- Pending registrations.
- Election management.
- Candidate and party management.
- Constituency management.
- Result collation.
- Voter management.
- Audit and security log viewing.

### 4.2.11 Security Implementation

Security mechanisms implemented:

- Voter and admin passwords are hashed with bcrypt before storage.
- Plaintext passwords are never persisted.
- Authenticated routes require valid, correctly scoped JWTs.
- Voter, admin, partial, and pending session tokens are explicitly typed and validated against their expected scope.
- Ballot access and vote casting require a final voting token issued only after biometric verification.
- Vote payloads and stored facial embeddings are encrypted at rest using AES-256-GCM.
- Each vote produces a SHA-256 integrity hash and independently salted receipt code.
- One-voter-one-vote-per-election is enforced at the database query level inside an atomic transaction.
- The same one-voter-one-vote rule applies to online and offline-synced votes.
- Constituency boundaries are enforced by partitioned storage and explicit ownership checks.
- Independent biometric attempt counters and lockouts limit retry abuse.
- Administrator access requires password plus emailed OTP.
- Security middleware applies defensive HTTP headers, structured request logging with correlation IDs, and rate limiting.

### 4.2.12 Honest Implementation Boundaries

The report should explicitly acknowledge the prototype boundaries:

- Fingerprint verification relies on the device's native biometric API and is not independently template-matched by the backend.
- SMS notifications and password-reset emails are logged to the console rather than sent through live production providers.
- The mock INEC voter register simulates an authoritative external voter roll.
- The system has been tested as a local/demonstration deployment.
- The system has not undergone independent security auditing, large-scale load testing, or production hardware deployment.

## 4.3 Results and Analysis

This section should present the observed outcomes from functional testing, backend verification, security review, usability review, and direct database inspection.

### 4.3.1 Functional Test Results

| Test Case | Expected Result | Actual Result | Status |
| --- | --- | --- | --- |
| Voter validates VIN against the register | Eligible voter details are returned | Validation response returned correctly | Pass |
| Voter completes self-registration | Voter record is created with `pending_review` status | Registration recorded, awaiting approval | Pass |
| Voter attempts login before approval | Login is blocked with a clear pending message | Blocked as expected | Pass |
| Admin approves a pending voter | Voter status becomes `registered` | Approval succeeded; voter could then log in | Pass |
| Admin rejects, then reinstates, a voter | Voter is suspended, then restored to registered | Both transitions succeeded | Pass |
| Voter logs in with valid VIN/email and password | Partial session token is issued | Temporary session returned | Pass |
| Voter exhausts fingerprint attempts | Fingerprint locks; facial recognition becomes available with separate attempts | Independent lockouts confirmed | Pass |
| Voter completes facial verification | Final voting token is issued on a genuine match | Verified via logged cosine similarity score | Pass |
| Voter requests ballot | Only the voter's own constituency candidates are returned | Correct ballot returned | Pass |
| Voter casts a vote | Vote is encrypted, stored, and receipt is generated | Vote submitted successfully | Pass |
| Voter attempts to vote twice in the same election | Second attempt is rejected | Duplicate voting blocked | Pass |
| Voter casts offline, then reconnects | Vote queues locally, then syncs automatically without duplication | Confirmed after correcting election-linkage defect | Pass after fix |
| Voter verifies a receipt code without signing in | Verification confirms the vote was recorded | Confirmed through public receipt endpoint | Pass |
| Admin views dashboard before an election opens | Statewide figures are withheld until election is active | Suppressed in draft status | Pass |
| Admin sets a scheduled election end time | Election automatically transitions to closed at that time | Confirmed through background scheduler | Pass |
| Admin views constituency-level results | Correct candidate vote counts are displayed | Verified against database records | Pass |

### 4.3.2 Backend Test Analysis

Backend verification relied on direct endpoint testing against a running PostgreSQL instance, structured request logging, and targeted database queries used to confirm data integrity directly during testing.

Examples of backend evidence to mention:

- Request logs captured method, path, status code, and duration.
- Direct database queries confirmed that online and offline-synced votes were linked to the correct election.
- Functional testing covered the full voting journey from VIN validation to receipt verification.
- Direct database inspection helped identify and confirm the fix for the offline vote reconciliation defect.

Suggested paragraph:

```text
End-to-end testing confirmed that the complete voting workflow, including VIN validation, self-registration, administrative approval, password login, biometric verification, ballot retrieval, vote casting, and receipt verification, could be completed successfully. The system correctly enforced the intended sequence at each stage. Direct database inspection during testing was also used to identify and confirm the resolution of a defect in offline vote reconciliation, demonstrating the value of combining functional testing with direct data verification during development.
```

### 4.3.3 Security Result Analysis

| Security Requirement | Implementation Result |
| --- | --- |
| Protect user passwords | Passwords are hashed with bcrypt for both voters and administrators |
| Prevent direct ballot access after password login alone | A partial session must be upgraded through biometric verification before a voting token is issued |
| Require a second factor for administrative access | Admin login requires password plus emailed one-time code |
| Protect stored votes | Vote payloads are encrypted with AES-256-GCM |
| Protect stored biometric data | Facial embeddings are encrypted with AES-256-GCM before storage |
| Verify vote integrity and provide auditability | SHA-256 integrity hash and salted, publicly verifiable receipt code are generated per vote |
| Prevent multiple voting within an election | Enforced atomically at database level, scoped to the specific election, for online and offline votes |
| Enforce constituency boundaries | Ballot and vote routes validate constituency ownership against partitioned storage |
| Limit biometric retry abuse | Independent attempt counters and lockouts are maintained per biometric method |
| Require human review before voting access | Self-registered voters cannot sign in until administratively approved |

### 4.3.4 Usability Result Analysis

Usability observations:

- Voters follow a linear path from sign-in through registration, biometric verification, ballot selection, review, and receipt.
- Blocking states are clearly represented, including pending approval, already voted, fingerprint locked, no connection, and vote queued offline.
- The admin interface separates routine monitoring from configuration tasks.
- Dashboard and results screens support active election monitoring.
- Error and edge-case states are given dedicated, plain-language screens instead of generic error messages.

Recommended screenshots:

- Voter sign-in landing screen.
- Self-registration VIN check.
- Detail confirmation.
- Fingerprint enrollment.
- Face enrollment.
- Fingerprint verification success and locked states.
- Facial verification success and did-not-match states.
- Ballot screen.
- Vote review screen.
- Receipt screen with copy action.
- Standalone receipt verification screen.
- Already voted screen.
- Offline-vote-queued screen.
- Admin login.
- Admin OTP screen.
- Admin dashboard before and after election opening.
- Pending registrations queue.
- Election management screen with end-time configuration.
- Constituency result screen with statewide summary.
- Audit/security log screen.

### 4.3.5 Result Summary

Suggested summary:

```text
The implemented prototype achieved its core objectives. It supports voter self-registration with administrative approval; authenticates voters using password credentials combined with two biometric pathways; restricts ballot access strictly by constituency; encrypts votes and biometric data at rest; generates independently verifiable vote receipts; enforces one-voter-one-vote per election for both online and offline-cast votes; and provides administrators with election lifecycle, candidate, result-monitoring, and audit tools secured behind two-factor authentication.
```

## 4.4 Comparative Analysis

This section should compare the implemented system with manual voting, single-biometric systems, and generic e-voting platforms.

### 4.4.1 Comparison With Manual Voting

| Feature | Manual Voting | Implemented Bimodal E-Voting System |
| --- | --- | --- |
| Voter identification | Physical inspection and manual register | VIN-based self-registration, password login, plus biometric verification |
| Registration oversight | In-person officer verification | Self-registration with mandatory administrative approval before voting access |
| Ballot access | Paper ballot distribution | Digital, constituency-restricted ballot |
| Result collation | Manual counting and transmission | Automated, atomic result aggregation with live admin dashboard |
| Duplicate voting prevention | Manual register marking | Database-enforced, per-election uniqueness check |
| Vote storage | Physical ballot papers | AES-256-GCM encrypted digital records |
| Auditability | Paper trail and manual reports | Publicly verifiable receipt codes, integrity hashes, and structured audit logs |
| Connectivity resilience | Not applicable | Offline-aware vote queueing with automatic, duplicate-safe synchronization |

### 4.4.2 Comparison With Single-Biometric Systems

| Feature | Single-Biometric System | Implemented System |
| --- | --- | --- |
| Authentication options | Usually one fixed biometric method | Fingerprint by default, with facial recognition as an independently tracked fallback |
| Availability | Fails entirely if the sole method is unavailable or unreadable | Voter retains a working alternative after exhausting one method |
| Verification depth | Single point of trust | Fingerprint is trusted as a device-level signal; facial recognition is verified server-side through embedding comparison |
| Session control | Often direct login-to-vote | Partial session must be explicitly upgraded through successful biometric verification |

### 4.4.3 Comparison With Generic E-Voting Systems

| Feature | Generic E-Voting System | Implemented System |
| --- | --- | --- |
| Geographic election control | Often general-purpose | Purpose-built around Ondo State's nine Federal Constituencies and enforced at storage level |
| Candidate visibility | May require manual filtering | Backend-enforced, constituency-scoped ballots |
| Registration safeguards | Varies widely | Mandatory administrative approval before any self-registered voter can vote |
| Offline awareness | Frequently online-only | Offline vote queueing with signed offline tokens and automatic, duplicate-safe sync |
| Administrative second factor | Often password-only | Admin login requires emailed OTP in addition to password |
| Academic transparency | May obscure implementation boundaries | Documents device-level fingerprint trust, mocked notifications, and prototype-stage scope |

### 4.4.4 Strengths of the Implemented System

- Two-stage voter authentication separates knowing the password from being present and biometrically verified.
- Dual biometric pathways improve accessibility and reduce dependence on a single method.
- Independent attempt counters reduce biometric retry abuse.
- Mandatory administrative approval closes a real security gap in self-service registration.
- Constituency isolation is enforced at database partition level, not only application level.
- Per-election vote uniqueness supports multiple sequential election cycles.
- Offline-aware voting was tested under simulated connectivity loss.
- An offline election-linkage defect was identified and corrected during development.
- Admin access is protected by two-factor authentication.
- The system clearly distinguishes genuine server-side facial verification from device-level fingerprint trust.

### 4.4.5 Limitations Identified From the Comparison

- Fingerprint verification cannot confirm which specific enrolled fingerprint authorized an attempt on consumer mobile hardware.
- SMS and email notifications are not connected to live production providers.
- The mock INEC voter register is a local simulation, not a genuine external electoral roll.
- The system has been validated through manual and direct-database testing, not independent security audit or large-scale load testing.
- The scheduled election end time is currently entered as plain text rather than through a dedicated date/time picker.

### 4.4.6 Comparative Analysis Summary

Suggested paragraph:

```text
The comparative analysis shows that the implemented bimodal e-voting system provides meaningfully stronger authentication, more resilient connectivity handling, and stricter constituency control than manual voting, single-biometric systems, and generic e-voting platforms. Its two-stage authentication model, independently verified facial recognition pathway, mandatory administrative approval gate, and tested offline-vote reconciliation represent genuine demonstrated improvements over each comparison baseline. The system remains a prototype: production deployment would require a live external voter registry integration, independent security auditing, hardware-backed fingerprint template matching if individual fingerprint identity verification is required, and broader load and resilience testing.
```

## Suggested Chapter Four Figures and Tables

Suggested figures:

- Voter sign-in landing screen.
- Self-registration VIN check.
- Detail confirmation.
- Fingerprint enrollment.
- Face enrollment.
- Fingerprint verification success and locked states.
- Facial verification success and did-not-match states.
- Ballot screen.
- Vote review screen.
- Receipt screen with copy action.
- Standalone receipt verification screen.
- Already voted screen.
- Offline-vote-queued screen.
- Admin login.
- Admin OTP screen.
- Admin dashboard before and after election opening.
- Pending registrations queue.
- Election management screen with end-time configuration.
- Constituency result screen with statewide summary.
- Audit/security log screen.

Suggested tables:

- Implementation technology table.
- Functional test result table.
- Security requirement result table.
- Manual voting comparison table.
- Single-biometric comparison table.
- Generic e-voting comparison table.

## Closing Paragraph

```text
In summary, the implementation and testing of the Ondo State Bimodal E-Voting System demonstrated that the proposed design could support secure voter self-registration with administrative oversight, staged dual-pathway biometric authentication, constituency-restricted ballot access, encrypted and per-election-unique vote casting, offline-aware vote queueing with verified duplicate-safe synchronization, and comprehensive administrative monitoring and control. Functional and security testing, including direct database verification, confirmed that the core objectives of the study were met. The comparative analysis further shows that the system improves meaningfully on manual voting, single-biometric, and generic e-voting approaches, while honestly acknowledging the boundaries of a prototype built for academic demonstration rather than certified production deployment.
```
