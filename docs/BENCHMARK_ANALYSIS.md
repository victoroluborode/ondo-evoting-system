# Benchmark Analysis

## Source Reviewed

Benchmark document:

```text
/Users/victoroluborode/Downloads/Project.pdf
```

The PDF is scanned, so full text extraction was not available. I reviewed rendered sample pages across the document, including the cover pages, abstract, table of contents, Chapter One, Chapter Two, Chapter Four, and references. That is enough to understand the expected structure, depth, and evidence style.

## What The Benchmark Project Emphasizes

The previous project is a full final-year report around a bimodal e-voting system. Its strongest pattern is that it does not only present software screens. It explains the election problem, motivates bimodal authentication, designs the system formally, implements a prototype, then backs it with screenshots, testing, performance evaluation, security discussion, limitations, and recommendations.

Important themes:

- Nigerian election credibility issues: impersonation, fraud, logistics, trust, and manual process weaknesses.
- Bimodal voter verification using fingerprint and face recognition.
- Mobile-first voting experience.
- Administrative oversight and result monitoring.
- AES-256 encryption and SHA-256 integrity checks.
- Testing sections for biometric accuracy, performance, scalability, security, and usability.
- Clear limitations and deployment recommendations.

This aligns closely with our system, but our project is better scoped around Ondo State's 9 Federal Constituencies and concurrent House of Representatives elections.

## Expected Report Shape

The benchmark follows a conventional five-chapter format:

1. Preliminary pages
2. Chapter One: Introduction
3. Chapter Two: Literature Review
4. Chapter Three: System Analysis and Design
5. Chapter Four: Implementation and Results
6. Chapter Five: Conclusion and Recommendations
7. References

Our report should follow the same structure because it is likely familiar to the supervisor.

## Recommended Report Outline For Our Project

### Preliminary Pages

- Title page
- Certification
- Dedication
- Acknowledgement
- Abstract
- Table of contents
- List of figures
- List of tables
- Acronyms

Suggested project title:

```text
Design and Implementation of a Scalable Bimodal E-Voting System
for Ondo State Federal Constituency Elections
```

### Chapter One: Introduction

Recommended sections:

- Background of the study
- Statement of the problem
- Project motivation
- Aim and objectives
- Scope of the study
- Methodology
- Significance of the study
- Limitations
- Organization of the project

Our angle should be:

- Ondo State has 9 Federal Constituencies requiring strict electoral isolation.
- Voters must only see candidates for their registered constituency.
- The system supports two authentication choices after password verification: fingerprint or face recognition.
- The system demonstrates encrypted vote storage, integrity receipts, and one-voter-one-vote enforcement.

### Chapter Two: Literature Review

Recommended sections:

- Overview of electronic voting
- Evolution of voting systems
- Nigerian electoral context
- Biometric authentication in voting
- Fingerprint recognition
- Facial recognition
- Bimodal and multimodal biometric systems
- Mobile voting systems
- Cryptographic protection in e-voting
- Offline-capable authentication concepts
- Existing systems and related works
- Summary of literature gaps

Useful comparison table:

| System/Paper | Method | Strength | Limitation | Gap Addressed By This Project |
| --- | --- | --- | --- | --- |
| Traditional manual voting | Physical accreditation | Familiar | Fraud/logistics issues | Digital verification and audit trail |
| Single-biometric systems | Fingerprint or face only | Better ID verification | Fails when one modality is unavailable | Voter can choose fingerprint or face |
| Generic e-voting systems | Web/mobile voting | Faster results | Weak constituency isolation | Constituency-aware partitioning |

### Chapter Three: System Analysis and Design

Recommended sections:

- Existing system analysis
- Proposed system overview
- Functional requirements
- Non-functional requirements
- Actors and use cases
- System architecture
- Database design
- API design
- Security design
- Voter authentication sequence
- Registration sequence
- Vote casting sequence
- Admin result monitoring sequence
- User interface design

Diagrams to include:

- System architecture diagram
- Use case diagram
- Entity relationship diagram
- Voter login and biometric verification sequence diagram
- Vote submission sequence diagram
- Registration flow diagram
- Admin dashboard flow diagram

Important design point:

The voter is not fully authenticated after VIN-or-email/password login. The backend only issues a temporary partial session. A final voting JWT is issued after successful biometric verification.

### Chapter Four: Implementation and Results

Recommended sections:

- Technology stack
- Backend implementation
- Database partitioning implementation
- Voter registration module
- Voter login and biometric verification module
- Ballot and vote casting module
- Vote encryption and integrity implementation
- Admin dashboard implementation
- Screenshots and walkthrough
- Testing and evaluation
- Security assessment
- Performance/scalability discussion
- Usability evaluation

Screenshots to capture from our app:

- Welcome screen
- Voter login
- Biometric selection
- Fingerprint screen
- Face recognition screen
- Ballot screen
- Vote confirmation
- Vote success with receipt
- Already voted screen
- Officer login
- Registration dashboard
- Voter details form
- Biometric enrollment
- Password setup
- Registration confirmation
- Admin login
- Admin dashboard
- Constituency results

Testing tables to include:

| Test Case | Expected Result | Actual Result | Status |
| --- | --- | --- | --- |
| Voter login with valid password | Temporary session issued | Session issued | Pass |
| Already voted voter attempts login | Access blocked | Blocked | Pass |
| Biometric verification succeeds | Final JWT issued | JWT issued | Pass |
| Voter fetches ballot | Only own constituency candidates shown | Correct candidates shown | Pass |
| Voter submits vote once | Vote stored and voter marked voted | Completed | Pass |
| Voter reuses token after voting | Request rejected | Rejected | Pass |
| Admin views dashboard | Constituency results displayed | Displayed | Pass |

### Chapter Five: Conclusion and Recommendations

Recommended sections:

- Summary of work done
- Achievement of objectives
- Contribution to knowledge
- Limitations
- Recommendations
- Future work

Strong future work points:

- Real INEC identity database integration
- Complete fingerprint and face-recognition implementation
- Independent security audit
- Production email/SMS providers
- Hardware-backed key management
- Wider stress testing
- Formal electoral certification

## Where Our Project Should Be Stronger

The benchmark gives us the expected academic structure. Our project should stand out in these areas:

- Clearer constituency isolation across all 9 Federal Constituencies.
- More explicit two-stage authentication model.
- Stronger API documentation.
- Better separation of voter, officer, and admin flows.
- More honest simulation boundaries for biometrics, SMS, and email.
- Stronger demo-readiness with working backend tests and mobile screens.

## Practical Next Steps

1. Finish all 22 app screens to match the documented voter, officer, admin, and utility flows.
2. Capture screenshots after the UI is stable.
3. Create report diagrams from the implemented system, not from imagination.
4. Add a Chapter Four testing section using the backend integration test cases.
5. Keep the limitations honest: this is a final-year prototype with simulated biometrics and mock SMS.
6. Make the demo story smooth: officer registers voter, voter logs in, verifies biometrically, votes, admin sees result.

## Bottom Line

The benchmark confirms that our current direction is correct. The supervisor will likely expect a polished prototype plus a formal report that proves the system was designed, implemented, tested, and evaluated. Our advantage is that we already have a clearer full-stack structure: backend APIs, database partitioning, role-based flows, mobile screens, security documentation, and a demo path.
