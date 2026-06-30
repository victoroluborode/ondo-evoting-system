# Ondo State Bimodal E-Voting System

Prototype bimodal e-voting system for Ondo State House of Representatives elections across the state's nine Federal Constituencies. The system implements voter self-registration, administrative approval, staged biometric authentication, constituency-restricted ballots, encrypted vote casting, receipt verification, offline-aware vote queueing, election lifecycle control, and administrative result monitoring.

The current implementation uses a two-role model:

- `voter`: self-registers, waits for administrative approval, authenticates, votes, and verifies receipts.
- `administrator`: approves/rejects voters, manages elections, candidates, parties, constituencies, results, audit logs, and system oversight.

The repository contains:

- `backend/`: Node.js, Express, and PostgreSQL API.
- `frontend/ondo-mobile/`: Expo/React Native mobile app for voter and administrator flows.
- `docs/`: architecture, API, database, security, demo, benchmark, and project planning documentation.
- `CHAPTER_FOUR_GUIDE.md`: report-writing guide for Chapter Four: System Implementation and Results.
- `index.html`: browser redirect to the mobile prototype preview.

## Core Capabilities

- Voter self-registration using VIN validation against a mock INEC voter register.
- Administrative review before any self-registered voter can sign in or vote.
- Voter login by VIN or email plus password.
- Five-minute partial session before biometric verification.
- Fingerprint verification through the device biometric prompt.
- Server-side facial recognition using TensorFlow.js and `@vladmandic/face-api`.
- Independent biometric attempt counters and lockouts.
- Final voting JWT issued only after successful biometric verification.
- Constituency-aware ballot access and vote validation.
- AES-256-GCM encrypted vote payloads and facial embeddings.
- SHA-256 vote integrity hashes and salted receipt codes.
- One-voter-one-vote-per-election enforcement for online and offline-synced votes.
- Public receipt verification without revealing candidate choice.
- Offline voting package issuance, local vote queueing, and duplicate-safe synchronization.
- Admin two-factor login using password plus mocked emailed OTP.
- Election lifecycle control: `draft -> open -> closed -> published -> archived`.
- Scheduled election closing through a background lifecycle checker.
- Admin dashboards for voter approval, elections, parties, candidates, constituencies, results, audit logs, and security monitoring.

## Project Scope

This is a demo-ready academic prototype. The system is intentionally honest about what is production-ready and what is simulated:

- Facial recognition is performed server-side by comparing facial embeddings.
- Fingerprint verification uses the mobile device's native biometric prompt and is treated as a device-level authentication factor.
- SMS and password-reset email delivery are mocked/logged locally unless providers are added.
- The INEC voter register is represented by a local mock register.
- Offline voting support is implemented as signed offline packages, local queueing, and backend synchronization.
- The system is designed for local/demonstration deployment, not certified public election deployment.

## Tech Stack

Backend:

- Node.js
- Express
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- AES-256-GCM encryption
- SHA-256 integrity hashing
- TensorFlow.js Node
- `@vladmandic/face-api`

Mobile frontend:

- Expo
- React Native
- React Navigation
- AsyncStorage
- NetInfo
- Expo Local Authentication
- Expo Crypto
- Expo Clipboard
- Expo Image Picker

## Repository Structure

```text
.
|-- backend/
|   |-- db/
|   |   |-- schema.sql
|   |   |-- seed.sql
|   |   `-- migrations/
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   `-- tests/
|-- frontend/
|   `-- ondo-mobile/
|       |-- src/
|       |   |-- components/
|       |   |-- context/
|       |   |-- hooks/
|       |   |-- navigation/
|       |   |-- screens/
|       |   |-- services/
|       |   `-- theme/
|       `-- preview.html
|-- docs/
|-- CHAPTER_FOUR_GUIDE.md
`-- index.html
```

## Main User Flows

Voter self-registration and approval:

```text
VIN validation
  -> official details confirmation
  -> fingerprint hardware confirmation
  -> face capture
  -> password setup
  -> pending_review status
  -> admin approval
  -> voter can sign in
```

Voter authentication and voting:

```text
VIN or email + password
  -> 5-minute partial session token
  -> fingerprint verification
  -> facial recognition fallback when needed
  -> final voting JWT
  -> constituency ballot
  -> encrypted vote cast
  -> receipt generated
  -> voting token invalidated
```

Offline-aware voting:

```text
successful biometric verification while online
  -> signed offline voting package fetched
  -> network vote submission fails
  -> vote queued locally
  -> NetInfo detects reconnection
  -> queued vote syncs to backend
  -> duplicate-safe reconciliation
```

Admin management:

```text
admin password login
  -> emailed OTP verification
  -> dashboard
  -> approve/reject/reinstate voters
  -> manage election lifecycle
  -> manage parties, candidates, constituencies, and LGAs
  -> monitor results and audit logs
```

Password recovery:

```text
Email available:
  reset link -> new password

No email:
  VIN -> mock SMS OTP -> new password
```

## Quick Start

### Backend API

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Required backend environment values:

- `DATABASE_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Health checks:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### Mobile App

```bash
cd frontend/ondo-mobile
npm install
npm start
```

Set the API base URL for Expo:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For a physical phone, use the computer's LAN address instead of `localhost`:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api
```

Use the platform commands when needed:

```bash
npm run android
npm run ios
npm run web
```

### Browser Preview

For a lightweight visual preview without running Expo, open:

```text
frontend/ondo-mobile/preview.html
```

The root `index.html` redirects to that preview.

## Demo Credentials

Admin:

```text
Admin ID: ADM-ONDO-001
Email: admin@inec.ondo.gov.ng
Password: AdminPassword123!
```

Admin login requires the mocked emailed OTP step. In local development, OTP/email output is logged to the backend console.

Voter accounts are created through the self-registration flow and must be approved by an admin before login.

## Verification

Backend syntax checks:

```bash
cd backend
npm run check
```

Backend integration test:

```bash
cd backend
npm test
```

The expected verification flow covers health/readiness, admin login, admin OTP, VIN validation, voter self-registration, admin approval, staged voter authentication, biometric verification, ballot fetch, encrypted vote casting, token invalidation, receipt verification, and password reset handling.

## API Entry Points

Base URL:

```text
http://localhost:3000
```

Common routes:

- `GET /health`
- `GET /ready`
- `POST /api/auth/validate-vin`
- `POST /api/auth/register-voter`
- `POST /api/auth/login`
- `POST /api/auth/verify-biometric`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/request-password-otp`
- `POST /api/auth/reset-password-otp`
- `GET /api/ballots/constituencies`
- `GET /api/ballots/election-status`
- `GET /api/ballots/:constituencyId`
- `POST /api/votes`
- `POST /api/votes/sync`
- `GET /api/votes/verify-receipt/:receiptCode`
- `GET /api/votes/results/:constituencyId`
- `POST /api/admin/login`
- `POST /api/admin/verify-otp`
- `GET /api/admin/dashboard`
- `GET /api/admin/voters`
- `GET /api/admin/voters/pending`
- `POST /api/admin/voters/:id/approve`
- `POST /api/admin/voters/:id/reject`
- `POST /api/admin/voters/:id/reinstate`
- `GET /api/admin/elections`
- `POST /api/admin/elections`
- `POST /api/admin/elections/:id/open`
- `POST /api/admin/elections/:id/close`
- `POST /api/admin/elections/:id/publish`
- `POST /api/admin/elections/:id/archive`
- `GET /api/admin/results/:constituencyId`
- `GET /api/admin/audit-logs`

See [docs/API.md](docs/API.md) for fuller request and response details, and [CHAPTER_FOUR_GUIDE.md](CHAPTER_FOUR_GUIDE.md) for the report-oriented implementation and results write-up.

## Documentation

- [Chapter Four Guide](CHAPTER_FOUR_GUIDE.md)
- [Backend README](backend/README.md)
- [Mobile README](frontend/ondo-mobile/README.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Backend Entities](docs/ENTITIES.md)
- [Database Design](docs/DATABASE.md)
- [Security Model](docs/SECURITY.md)
- [Demo Guide](docs/DEMO.md)
- [Frontend/Backend Integration](docs/FRONTEND_BACKEND_INTEGRATION.md)
- [Limitations and Future Work](docs/LIMITATIONS.md)
- [Benchmark Analysis](docs/BENCHMARK_ANALYSIS.md)
- [Benchmark Implementation Notes](docs/BENCHMARK_IMPLEMENTATION_NOTES.md)
- [Prototype Implementation Roadmap](docs/PROTOTYPE_IMPLEMENTATION_ROADMAP.md)
- [Project Plan Diagrams](docs/PROJECT_PLAN_DIAGRAM.md)

## Notes

- PostgreSQL must be reachable through `DATABASE_URL` before `/ready` and database-backed testing can pass.
- The backend defaults to console-based email output for local admin OTP and password reset testing.
- SMS behavior is intentionally mocked for this prototype.
- Fingerprint verification is device-level; server-side biometric identity matching is implemented through facial recognition.
- Production deployment would require live voter-register integration, production notification providers, independent security auditing, broader load testing, hardware/key-management review, and electoral certification.
