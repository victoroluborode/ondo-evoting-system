# Benchmark Implementation Notes

## Review Focus

This note focuses on the implementation section of the benchmark PDF, especially Chapter Four. The PDF is scanned, so the analysis is based on rendered pages and OCR around the implementation/results section.

## What They Implemented

The benchmark implementation is organized around four main modules:

1. Voter registration
2. Bimodal authentication and voting
3. Vote processing and storage
4. Results dashboard

Their implementation chapter then supports those modules with performance, security, usability, and comparison results.

## 1. Voter Registration Module

Their registration module includes:

- Voter personal details form
- VIN or voter identification verification
- Phone number/email capture
- Biometric enrollment progress screen
- Fingerprint enrollment
- Face recognition enrollment
- Registration completion feedback
- SMS/email confirmation

Implementation claims/features:

- Dual biometric capture during enrollment
- Liveness detection for face registration
- Multi-angle face capture for better matching
- Fingerprint quality assessment
- AES-256 encryption before biometric storage
- Duplicate biometric detection to reduce multiple registration
- Registration confirmation through SMS and email

How this maps to our project:

- We already have officer-led registration screens.
- We support voter details, LGA-to-constituency mapping, biometrics, password setup, and confirmation.
- Our mock SMS approach is acceptable for final-year scope if clearly documented.
- We should make the registration UI feel like a guided stepper, because their implementation screenshots show progress-based registration.

Recommended improvement for us:

- Add visible registration progress: details -> location -> biometrics -> password -> complete.
- Make biometric enrollment show two explicit statuses: fingerprint enrolled and face enrolled.
- In the report, state that biometric capture is simulated behind replaceable service boundaries.

## 2. Bimodal Authentication And Voting Module

Their voter login/authentication module includes:

- Login screen
- Biometric method selection
- Fingerprint option
- Face recognition option
- Ballot access only after authentication

Implementation claims/features:

- Voter chooses a verification method.
- Authentication is exclusive: face OR fingerprint.
- Face recognition includes anti-spoofing concepts such as eye movement and depth/liveness checks.
- Fingerprint verification includes backup-finger concepts in their writeup.
- Authentication logs are kept for audit purposes.
- Identity verification is separated from vote casting to preserve voter anonymity.

How this maps to our project:

- Our design is stronger because it uses staged authentication:
  - VIN-or-email/password login creates a short-lived partial session
  - biometric verification upgrades it to a final voting JWT
  - voting JWT is invalidated after successful vote submission
- The backend controls whether a partial session becomes a voting JWT; the actual fingerprint and face matching modules are planned for a later implementation phase.
- This is easier to defend technically than a simple login-then-vote model.

Recommended improvement for us:

- Keep the login flow strict: password login is only partial authentication.
- Use the biometric screen as the real gate into the ballot.
- Explain that mobile operating systems return a biometric pass/fail result rather than exposing raw fingerprint templates.
- Treat cases where both biometric methods fail as a limitation and recommendation area, not as a password-only voting path.

## 3. Ballot Interface

Their ballot interface includes:

- Voting instructions
- Active election list
- Party/candidate selection
- Confirmation screen before submission
- Warning that submitted votes cannot be changed

Implementation claims/features:

- The ballot prioritizes usability and accessibility.
- Voters can review selected party/candidate before final submission.
- The confirmation screen is the point of no return.
- Timeout mechanisms prevent stale authenticated sessions.

How this maps to our project:

- Our ballot is more constituency-specific because the backend enforces the voter's constituency from the JWT.
- Our confirmation screen should clearly show candidate, party, and constituency.
- The future frontend vote success screen should show a non-revealing receipt/hash preview.

Recommended improvement for us:

- Make the ballot screen visually calm and hard to mis-tap.
- Show constituency name at the top.
- Use a dedicated confirmation page before calling `POST /api/votes`.

## 4. Vote Processing And Storage

Their vote processing section includes:

- Vote hash generation
- Vote submission service
- Cryptographic vote receipt
- Vote encryption at submission time
- Vote integrity protection
- Anonymous receipt generation

Implementation claims/features:

- Hybrid cryptography using RSA and AES.
- Each vote receives a cryptographic signature.
- Voters receive anonymous vote receipts.
- Vote content is not revealed by the receipt.

How this maps to our project:

- Our backend currently uses AES-256-GCM encrypted vote payloads.
- Our backend generates SHA-256 integrity hashes.
- Our backend generates receipt codes.
- Our backend checks voter status, candidate constituency, one-voter-one-vote, stores the encrypted vote, updates results, and invalidates the token.

Recommended improvement for us:

- In the report, explain why receipt codes are non-revealing.
- Show the vote processing sequence:
  - validate JWT
  - lock voter row
  - verify candidate constituency
  - encrypt vote payload
  - hash vote payload
  - insert vote
  - mark voter as voted
  - invalidate token
  - update results
  - audit event

## 5. Results Dashboard

Their result module includes:

- Admin dashboard
- Result viewing interface
- Constituency/ward style breakdown
- Vote counts by party/candidate
- Exportable result data
- Real-time dashboard claims

Implementation claims/features:

- WebSocket-based live updates
- Load balancing for high access
- Caching for frequently accessed result data
- Admin monitoring of server/database/network status
- Anomaly detection alerts for unusual voting patterns

How this maps to our project:

- We already have admin login, dashboard, and constituency result views.
- We do not need to overbuild WebSockets for a final-year demo unless time allows.
- Polling the dashboard API periodically is enough and easier to defend if implemented cleanly.

Recommended improvement for us:

- Keep admin dashboard focused on:
  - all 9 constituencies
  - accredited/registered voters
  - vote counts
  - turnout percentage
  - drill-down results
- Mention WebSockets, caching, and anomaly detection as future work unless actually implemented.

## 6. Testing And Results They Presented

Their implementation chapter presents measurable results such as:

- Face recognition accuracy
- Fingerprint recognition accuracy
- Bimodal accuracy
- False Acceptance Rate
- False Rejection Rate
- Average matching speed
- Maximum concurrent users
- API response time
- Mobile startup time
- Battery/data usage
- Vulnerability assessment rating
- Usability score
- Demographic usability analysis
- Feature comparison table

How this maps to our project:

- We should avoid making unsupported claims such as exact biometric accuracy because the face model is a lightweight prototype and the fingerprint check is OS-mediated.
- We can still provide strong engineering evaluation:
  - API integration test results
  - vote duplication prevention test
  - constituency isolation test
  - token invalidation test
  - admin result update test
  - mobile flow screenshots
  - security design evaluation

Recommended evaluation table for us:

| Area | What To Demonstrate |
| --- | --- |
| Authentication | Password login creates only a partial session |
| Biometric gate | Final JWT is issued only after selected biometric method |
| Constituency isolation | Voter sees only candidates in registered constituency |
| Vote integrity | Vote has encrypted payload and SHA-256 integrity hash |
| One-voter-one-vote | Second vote attempt is rejected |
| Token safety | Voting JWT is invalidated after vote |
| Admin dashboard | Result count updates after vote |
| Registration | Officer can register voter with details and biometrics |

## What We Should Borrow

Borrow these ideas:

- Guided registration flow
- Biometric progress states
- Clear biometric method selection
- Strong confirmation before vote submission
- Non-revealing receipt after vote
- Admin result drill-down
- Chapter Four screenshots for every major module
- Testing/performance tables
- Feature comparison table

Avoid copying these too literally:

- Unsupported biometric accuracy numbers
- WebSocket/load-balancing claims unless implemented
- Public result access if our system is admin-only
- Any party-specific branding or state-specific copy from their app

## Implementation Gap Checklist

For our project to feel as complete as the benchmark:

- [ ] Every voter screen should be reachable from the app.
- [ ] Every officer registration screen should be reachable from the app.
- [ ] Every admin screen should use real backend data.
- [ ] Login should not skip biometric verification.
- [ ] Vote confirmation should be a separate step.
- [ ] Vote success should show receipt/hash preview.
- [ ] Already-voted state should be handled cleanly.
- [ ] Backend tests should prove the critical vote flow.
- [ ] Demo guide should walk through registration -> voting -> result update.
- [ ] Report should include screenshots of all implemented flows.

## Bottom Line

Their implementation is a polished prototype with a good story: register voter, enroll biometrics, authenticate voter, cast encrypted vote, view results, then evaluate the system. Our project should follow that same story, but with stronger constituency isolation, clearer staged authentication, better backend enforcement, and honest final-year simulation boundaries.
