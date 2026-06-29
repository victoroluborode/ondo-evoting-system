# Chapter Four Guide: System Implementation and Results

This guide is a practical writing aid for Chapter Four of the project report. It is based on the implemented Ondo State Bimodal E-Voting System, including the Express/PostgreSQL backend, Expo/React Native mobile app, security model, voter/officer/admin flows, and available demo/test evidence.

## 4.1 Introduction

This section should introduce Chapter Four as the part of the report that explains how the designed system was implemented, tested, and evaluated.

Suggested points to cover:

- The chapter presents the actual implementation of the proposed bimodal e-voting system.
- The system was implemented as a full-stack prototype with a backend API, PostgreSQL database, and mobile frontend.
- The implementation focuses on Ondo State House of Representatives elections across federal constituencies.
- The chapter discusses voter registration, bimodal authentication, ballot access, vote casting, result collation, and administrative monitoring.
- The chapter also presents test results, screenshots, security observations, and comparison with existing/manual voting approaches.

Suggested paragraph:

```text
This chapter presents the implementation and evaluation of the proposed Ondo State Bimodal E-Voting System. The system was implemented as a full-stack prototype consisting of a Node.js/Express backend, PostgreSQL database, and Expo/React Native mobile application. The implementation demonstrates officer-led voter registration, voter authentication using password and biometric verification, constituency-based ballot access, encrypted vote casting, receipt generation, and administrative result monitoring. The chapter also presents the results obtained from testing the major system modules and compares the implemented system with existing voting approaches.
```

## 4.2 System Implementation

This section should describe how each major part of the system was built. Write it in subsections so the examiner can clearly see the relationship between the design in Chapter Three and the working prototype.

### 4.2.1 Implementation Environment

Mention the tools and technologies used:

- Node.js for the backend runtime.
- Express.js for API routing and middleware.
- PostgreSQL for persistent relational data storage.
- Expo and React Native for the mobile frontend.
- React Navigation for screen navigation.
- JWT for authenticated sessions.
- bcrypt for password hashing.
- AES-256-GCM for vote and biometric-template encryption.
- SHA-256 for vote integrity receipts.
- AsyncStorage and NetInfo for mobile state and offline-aware behavior.

Suggested table:

| Component | Technology Used | Purpose |
| --- | --- | --- |
| Backend API | Node.js and Express.js | Handles authentication, registration, ballot access, voting, and admin operations |
| Database | PostgreSQL | Stores voters, officers, elections, candidates, votes, results, and audit data |
| Mobile App | Expo and React Native | Provides voter, officer, and admin user interfaces |
| Authentication | JWT and bcrypt | Protects sessions and stores passwords securely |
| Encryption | AES-256-GCM | Encrypts sensitive vote and biometric-related data |
| Integrity | SHA-256 | Generates vote integrity hashes and receipt verification data |

### 4.2.2 Backend Implementation

Explain that the backend is the control layer of the system. It validates requests, manages sessions, enforces election rules, stores records, and exposes APIs to the mobile app.

Key backend modules to discuss:

- `auth` routes for voter, officer, and admin authentication.
- `ballots` routes for constituency-based ballot access.
- `votes` routes for vote casting, receipt verification, offline synchronization, and result retrieval.
- `admin` routes for voter, election, candidate, party, officer, result, audit, and dashboard management.
- Service modules for authentication, voting, ballot retrieval, election lifecycle, email, SMS, biometrics, and admin operations.
- Middleware for JWT authentication, security headers, request logging, and rate limiting.

Important implementation point:

```text
The voter is not granted full voting access immediately after password login. Instead, the backend issues a temporary partial session token. The final voting JWT is only issued after biometric verification is completed.
```

### 4.2.3 Database Implementation

Describe the PostgreSQL database as the central data store for election information.

Mention that the database supports:

- Voter records.
- Officers and administrators.
- Federal constituencies and LGAs.
- Elections, parties, and candidates.
- Ballots and vote records.
- Result collation.
- Audit logs.
- Session and token-related records.

Emphasize constituency isolation:

```text
The database and backend logic are designed to ensure that voters, candidates, and votes are tied to their constituencies. This prevents a voter registered in one constituency from viewing or voting for candidates in another constituency.
```

### 4.2.4 Voter Registration Module

Explain the officer-led registration process:

1. The officer logs into the system.
2. The voter identification number is validated.
3. Voter personal details are captured.
4. The voter is assigned to the appropriate LGA and constituency.
5. Fingerprint and face enrollment values are collected.
6. A voter password is created and hashed.
7. The voter record is stored for later authentication and voting.

Mention that SMS notifications are mocked for the prototype and logged locally.

### 4.2.5 Voter Authentication and Biometric Verification Module

Describe the two-stage authentication process:

1. The voter logs in using VIN or email and password.
2. The backend returns a temporary partial session token.
3. The voter chooses fingerprint or face verification.
4. The biometric verification step confirms the selected method.
5. The backend returns the final voting JWT.

Explain that fingerprint and face matching are represented as API boundaries in this prototype, while the architecture leaves room for production-grade biometric matching later.

Suggested flow:

```text
VIN/email + password
  -> partial session token
  -> fingerprint or face verification
  -> final voting token
  -> ballot access
```

### 4.2.6 Ballot and Vote Casting Module

Explain how voting works after authentication:

- The voter uses the final voting JWT to request a ballot.
- The backend checks the voter's constituency.
- Only candidates belonging to that constituency are returned.
- When the voter submits a vote, the backend checks that the voter has not voted before.
- The vote payload is encrypted before storage.
- A SHA-256 integrity hash and receipt code are generated.
- The voter is marked as having voted.
- The voting token is invalidated after the vote is cast.

Suggested flow:

```text
Voting JWT
  -> fetch constituency ballot
  -> select candidate
  -> cast encrypted vote
  -> generate receipt
  -> invalidate voting token
```

### 4.2.7 Admin Module

Describe the admin side of the system:

- Admin login and dashboard access.
- Election management.
- Party and candidate management.
- Voter approval, rejection, and reinstatement.
- Constituency and LGA management.
- Result monitoring by constituency.
- Audit log viewing.
- Offline synchronization monitoring.
- Anomaly and routing-integrity monitoring.

This section should show that the system is not only a voter app, but also includes operational oversight for election administrators.

### 4.2.8 Mobile Application Implementation

Explain that the frontend was implemented with Expo/React Native and organized into role-based flows.

Voter screens include:

- Login.
- Registration.
- Password reset.
- Biometric choice.
- Fingerprint verification.
- Face verification.
- Ballot.
- Vote review.
- Receipt.
- Already voted and offline queued states.

Officer screens include:

- Officer login.
- Registration dashboard.
- VIN check.
- Voter details capture.
- Biometric enrollment.
- Password setup.
- Registration success.
- Registration history.

Admin screens include:

- Admin login.
- Dashboard.
- Voter management.
- Pending voters.
- Election management.
- Candidate and party management.
- Constituency management.
- Result collation.
- Audit and security monitoring.
- Offline sync monitoring.

### 4.2.9 Security Implementation

Discuss the main security mechanisms:

- Passwords are hashed before storage using bcrypt.
- JWTs are used for protected routes.
- Voting access uses a final token issued only after biometric verification.
- Vote payloads are encrypted with AES-256-GCM.
- Vote receipts and integrity checks use SHA-256.
- The backend enforces one-voter-one-vote.
- The backend invalidates voting tokens after vote submission.
- Routes enforce role-based access for voters, officers, and admins.
- Security middleware applies headers, request IDs, request logging, and rate limiting.

### 4.2.10 Offline-Aware Implementation

Explain that the system includes offline-aware concepts for election environments where connectivity may be unreliable.

Mention:

- Mobile network-awareness through NetInfo.
- Offline banners and queued vote screens.
- Backend support for signed offline voting packages.
- Offline vote synchronization with idempotent reconciliation.
- Validation that offline votes remain tied to the correct voter, election, and constituency.

Also be honest that full production-grade offline biometric capture and automatic sync are future improvements.

## 4.3 Results and Analysis

This section should present what happened when the implemented system was tested. Include screenshots, test tables, and short explanations of observed outcomes.

### 4.3.1 Functional Test Results

Use a table like this:

| Test Case | Expected Result | Actual Result | Status |
| --- | --- | --- | --- |
| Officer logs in with valid credentials | Officer dashboard opens | Officer authenticated successfully | Pass |
| Officer validates voter VIN | Voter eligibility details are returned | VIN validation response returned | Pass |
| Officer registers a voter | Voter record is created | Registration completed | Pass |
| Voter logs in with VIN/email and password | Partial session token is issued | Temporary session returned | Pass |
| Voter completes biometric verification | Final voting JWT is issued | Voting token returned | Pass |
| Voter requests ballot | Only constituency candidates are shown | Correct ballot returned | Pass |
| Voter casts vote | Vote is encrypted, stored, and receipt is generated | Vote submitted successfully | Pass |
| Voter attempts to vote again | Request is rejected | Duplicate voting blocked | Pass |
| Admin views dashboard | Election metrics and results are displayed | Dashboard data returned | Pass |
| Admin views constituency result | Result for selected constituency is shown | Constituency result displayed | Pass |

### 4.3.2 Backend Test Analysis

Mention that backend verification includes:

- Syntax checks using `npm run check`.
- Integration testing using `npm test`.
- Health check endpoint testing through `/health`.
- Database readiness testing through `/ready`.
- End-to-end flow testing from registration to vote casting.

Suggested paragraph:

```text
The backend integration test confirmed that the major election workflow could be completed successfully. The tested flow included system readiness, admin login, officer login, voter registration, voter password login, biometric verification, ballot retrieval, encrypted vote submission, token invalidation, and password reset request handling. These results show that the implemented modules are connected and that the backend enforces the intended voting sequence.
```

### 4.3.3 Security Result Analysis

Discuss whether the security requirements were met:

- Passwords are not stored in plain text.
- A voter cannot access the ballot with only a password login.
- A final voting token is required to cast a vote.
- A voter cannot vote outside their constituency.
- A voter cannot vote more than once.
- Stored vote payloads are encrypted.
- Receipt codes provide a way to verify that a vote submission was recorded.
- Admin-only routes are protected from unauthorized users.

Suggested table:

| Security Requirement | Implementation Result |
| --- | --- |
| Protect user passwords | Passwords are hashed with bcrypt |
| Prevent direct ballot access after password login | Partial session must be upgraded through biometric verification |
| Protect stored votes | Vote payloads are encrypted with AES-256-GCM |
| Verify vote integrity | SHA-256 hash and receipt code are generated |
| Prevent multiple voting | Voter record and vote logic enforce one-voter-one-vote |
| Enforce constituency boundaries | Ballot and vote routes validate constituency ownership |

### 4.3.4 Usability Result Analysis

Discuss the user interface results:

- Voters can follow a guided login, biometric, ballot, review, and receipt process.
- Officers have a structured registration workflow.
- Admin users can manage elections and monitor results from dedicated screens.
- Offline and error states are represented to improve clarity during poor network conditions.

Recommended screenshots to include in the final report:

- Voter login screen.
- Biometric choice screen.
- Fingerprint verification screen.
- Face verification screen.
- Ballot screen.
- Vote review screen.
- Receipt screen.
- Officer login screen.
- Registration dashboard.
- Voter details form.
- Biometric enrollment screen.
- Admin login screen.
- Admin dashboard.
- Constituency result screen.
- Audit/security screen.

### 4.3.5 Result Summary

Conclude the section by stating that the implemented prototype achieved the major objectives:

- It supports role-based election access.
- It authenticates voters using password plus biometric verification.
- It restricts ballots by constituency.
- It encrypts and stores votes.
- It generates receipts for submitted votes.
- It prevents duplicate voting.
- It gives administrators result-monitoring and management tools.

## 4.4 Comparative Analysis

This section should compare the implemented system with traditional/manual voting and other common e-voting approaches.

### 4.4.1 Comparison With Manual Voting

| Feature | Manual Voting | Implemented Bimodal E-Voting System |
| --- | --- | --- |
| Voter identification | Physical inspection and manual register | VIN/email password login plus biometric verification |
| Ballot access | Paper ballot distribution | Digital constituency-based ballot |
| Result collation | Manual counting and transmission | Automated result update and admin dashboard |
| Duplicate voting prevention | Manual marking and register checks | Backend one-voter-one-vote enforcement |
| Vote storage | Physical ballot papers | Encrypted digital vote records |
| Auditability | Paper trail and manual reports | Receipt code, integrity hash, logs, and admin monitoring |
| Speed | Slower counting and reporting | Faster electronic collation |
| Error handling | Human-dependent | Backend validation and controlled workflows |

### 4.4.2 Comparison With Single-Biometric Systems

| Feature | Single-Biometric System | Implemented System |
| --- | --- | --- |
| Authentication options | Usually fingerprint or face only | Fingerprint or face after password login |
| Availability | May fail if one biometric method is unavailable | Voter has two biometric verification options |
| Security layers | Biometric check may be the main factor | Password plus biometric staged authentication |
| Session control | Often direct login-to-vote | Partial session is upgraded to final voting token |

### 4.4.3 Comparison With Generic E-Voting Systems

| Feature | Generic E-Voting System | Implemented System |
| --- | --- | --- |
| Geographic election control | Often general or national | Designed around Ondo State constituencies |
| Candidate visibility | May require manual filtering | Backend enforces constituency-specific ballots |
| Vote validation | General vote submission checks | Candidate, voter, election, and constituency checks |
| Offline awareness | Often online-only | Includes offline-aware flows and backend sync support |
| Academic transparency | May hide implementation boundaries | Clearly documents simulated biometrics, mock SMS, and console email |

### 4.4.4 Strengths of the Implemented System

- Two-stage voter authentication improves control over voting access.
- Bimodal biometric choice improves flexibility compared with a single biometric method.
- Constituency isolation helps prevent cross-constituency voting errors.
- Encrypted vote storage protects sensitive election data.
- Receipt and integrity hashing support post-vote verification.
- Admin dashboards provide stronger election oversight.
- The system includes honest prototype boundaries for biometrics, SMS, email, and offline voting.

### 4.4.5 Limitations Identified From the Comparison

- Biometric matching is simulated at the API boundary and should be replaced with real fingerprint and face recognition modules.
- SMS and email notifications are not connected to production providers.
- The system is currently a local/demo deployment, not a certified national election platform.
- Wider stress testing, public security auditing, and hardware-backed key management would be needed before production use.
- Full offline queue automation on mobile should be completed in a future version.

### 4.4.6 Comparative Analysis Summary

Suggested paragraph:

```text
The comparative analysis shows that the implemented bimodal e-voting system provides stronger authentication, faster result collation, better constituency control, and improved auditability when compared with manual voting. Compared with single-biometric and generic e-voting systems, the proposed system is more flexible because it supports both fingerprint and face verification after password login, while also enforcing constituency-based ballot access. However, the system remains a prototype and requires production biometric matching, live notification services, independent security auditing, and large-scale deployment testing before real electoral use.
```

## Suggested Chapter Four Figures and Tables

Suggested figures:

- Backend health/readiness response screenshot.
- Officer login screenshot.
- Voter registration screenshot.
- Voter login screenshot.
- Biometric verification screenshot.
- Ballot screenshot.
- Vote review screenshot.
- Receipt screenshot.
- Admin dashboard screenshot.
- Constituency result screenshot.

Suggested tables:

- Implementation technology table.
- Functional test result table.
- Security requirement result table.
- Manual voting versus implemented system comparison table.
- Single-biometric versus bimodal system comparison table.
- Generic e-voting versus implemented system comparison table.

## Short Chapter Four Closing Paragraph

```text
In summary, the implementation and testing of the Ondo State Bimodal E-Voting System showed that the proposed design can support secure voter registration, staged voter authentication, constituency-based ballot access, encrypted vote casting, receipt generation, and administrative result monitoring. The results obtained from functional and security testing indicate that the prototype satisfies the main objectives of the study. The comparative analysis also shows that the system improves on manual voting and single-biometric approaches, although further work is required before production deployment.
```
