# Prototype Implementation Roadmap

This roadmap turns the benchmark implementation pattern into the exact prototype story for this project.

## Target Demo Story

The system should demonstrate this complete flow:

```text
Officer registers voter
  -> voter details are captured
  -> LGA assigns constituency
  -> fingerprint and face are enrolled
  -> password is created
  -> registration confirmation is issued

Voter logs in
  -> VIN-or-email/password creates temporary session
  -> voter chooses fingerprint or face
  -> biometric verification creates voting JWT
  -> constituency ballot is loaded
  -> voter confirms candidate
  -> encrypted vote is stored
  -> receipt/hash preview is shown
  -> voter token is invalidated

Admin logs in
  -> dashboard shows all 9 constituencies
  -> results update after vote
  -> constituency result view shows candidate totals
```

## Module 1: Voter Registration

Implementation target:

- Officer login
- Registration dashboard
- Voter details form
- LGA dropdown and constituency auto-assignment
- Fingerprint enrollment status
- Face enrollment status
- Password setup
- Registration confirmation
- Mock SMS and email-ready confirmation

Current backend implementation status:

- Officer login exists.
- Backend stores encrypted biometric enrollment values and bcrypt password hash.
- Mock SMS is intentionally used for final-year project scope.

## Module 2: Bimodal Authentication

Implementation target:

- Voter VIN-or-email/password login
- Temporary partial session token
- Biometric method selection
- Fingerprint verification path
- Face recognition path
- Final voting JWT only after second factor

Current backend implementation status:

- Backend staged authentication exists.
- Biometric verification endpoint upgrades partial session to voting JWT.
- Backend biometric verification endpoint records biometric-step confirmation and is ready for the later fingerprint/face implementation.
- If both biometric methods fail, that is treated as a limitation and future recommendation, not a password-based voting path.

## Module 3: Ballot And Vote Processing

Implementation target:

- Load ballot by voter's constituency
- Show candidate and party options
- Confirm vote before submission
- Encrypt vote payload
- Generate SHA-256 integrity hash
- Store receipt reference
- Mark voter as voted
- Invalidate voting token
- Update results

Current backend implementation status:

- Backend validates JWT, voter, candidate constituency, and one-voter-one-vote.
- Vote payload is encrypted with AES-256-GCM.
- Integrity hash and receipt code are generated.
- Results table is updated after successful vote.

## Module 4: Results Dashboard

Implementation target:

- Admin login
- State-wide constituency overview
- Registered voters
- Votes cast
- Turnout percentage
- Drill-down constituency results

Current backend implementation status:

- Admin login exists.
- Dashboard uses backend data.
- Dashboard shows state-level summary and all constituencies.
- Results view shows candidate totals by constituency.

## Evidence To Capture For Chapter Four

Future client screenshots to capture:

- Welcome screen
- Officer login
- Registration home
- Voter details form
- Location/constituency assignment
- Biometric enrollment progress
- Password setup
- Registration confirmation
- Voter login
- Biometric method selection
- Fingerprint verification
- Face verification
- Ballot screen
- Vote confirmation
- Vote success with receipt/hash
- Admin dashboard
- Constituency results

Backend/API evidence:

- Registration request and response
- Login partial session response
- Biometric verification final JWT response
- Ballot fetch response
- Vote submission response
- Admin dashboard response
- Admin results response

Testing evidence:

- Valid voter login
- Already-voted voter blocked
- Biometric verification required before ballot
- Wrong constituency candidate rejected
- Vote recorded once
- Token invalid after vote
- Admin result count updated

## Claims We Can Safely Make

- The backend demonstrates staged bimodal authentication while the actual fingerprint/face matching modules are deferred.
- The backend enforces constituency isolation.
- Votes are encrypted before storage.
- Vote payload integrity is protected with SHA-256.
- A voter cannot vote twice.
- A voting JWT is invalidated after vote submission.
- Officer, voter, and admin flows are separated.
- SMS delivery is mocked for project scope, while email has a provider boundary.

## Claims To Avoid Unless Implemented

- Real biometric accuracy percentages.
- Direct fingerprint template capture from the phone OS.
- Production-grade face recognition accuracy.
- Real liveness detection accuracy.
- Production readiness for national election deployment.
- WebSocket real-time results unless added.
- Load balancing unless deployed behind one.
- Hardware-backed key storage unless added.

## Next Build Priorities

1. Run a full phone/emulator walkthrough from registration to admin result.
2. Fix any navigation or API wiring issues discovered during the walkthrough.
3. Capture screenshots for Chapter Four.
4. Add final test results to the report.
5. Keep limitations honest and explain simulation boundaries clearly.
