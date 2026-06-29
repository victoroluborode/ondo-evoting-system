# Ondo State Bimodal E-Voting System

Prototype e-voting system for Ondo State House of Representatives elections, covering voter registration, bimodal voter authentication, constituency-isolated ballots, encrypted vote casting, receipt generation, result monitoring, and a React Native mobile interface.

The repository contains:

- `backend/`: Node.js, Express, and PostgreSQL API.
- `frontend/ondo-mobile/`: Expo/React Native mobile app for voter, officer, and admin flows.
- `docs/`: architecture, API, database, security, demo, benchmark, and project planning documentation.
- `index.html`: browser redirect to the mobile prototype preview.

## Core Capabilities

- Officer-led voter registration with VIN validation.
- Voter login by VIN or email plus password.
- Temporary partial session before biometric verification.
- Fingerprint-or-face biometric verification boundary.
- Final voting JWT issued only after successful authentication.
- Constituency-aware ballot access and vote validation.
- AES-256-GCM encrypted vote payloads.
- SHA-256 vote integrity receipts.
- One-voter-one-vote enforcement and token invalidation after voting.
- Admin dashboards for elections, parties, candidates, voters, results, audit, anomalies, and offline sync monitoring.
- Offline-aware mobile flows and backend reconciliation support for queued voting packages.

## Project Scope

This is a demo-ready academic prototype. Some real-world integrations are intentionally represented at clean API boundaries:

- Fingerprint and face values are stored as enrollment templates/placeholders.
- Biometric matching is staged through the API and can be replaced with production-grade matching later.
- SMS delivery is mocked and logged locally.
- Email delivery defaults to console logging unless a provider is added.
- Offline voting support exists in the architecture and backend rules, with mobile queue/sync flows represented in the client.

## Tech Stack

Backend:

- Node.js
- Express
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- AES-256-GCM encryption
- SHA-256 integrity hashing

Mobile frontend:

- Expo
- React Native
- React Navigation
- AsyncStorage
- NetInfo
- Expo local authentication, crypto, clipboard, and image picker modules

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
`-- index.html
```

## Main User Flows

Voter authentication and voting:

```text
VIN or email + password
  -> 5-minute partial session token
  -> fingerprint or face verification
  -> final voting JWT
  -> constituency ballot
  -> encrypted vote cast
  -> receipt generated
  -> voting token invalidated
```

Officer registration:

```text
Officer login
  -> VIN validation
  -> voter details capture
  -> LGA and constituency assignment
  -> biometric enrollment
  -> voter password setup
  -> registration confirmation
```

Admin management:

```text
Admin login
  -> dashboard
  -> election, party, candidate, voter, and constituency management
  -> result collation
  -> audit, anomaly, and offline sync monitoring
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
EXPO_PUBLIC_API_URL=http://localhost:3000
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

Officer:

```text
Officer ID: OFF-1002
Email: officer@inec.ondo.gov.ng
Password: Password123!
```

Admin:

```text
Admin ID: ADM-ONDO-001
Email: admin@inec.ondo.gov.ng
Password: AdminPassword123!
```

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

The integration test covers health/readiness, admin login, officer login, voter registration, staged voter authentication, biometric verification, ballot fetch, encrypted vote casting, token invalidation, and password reset request handling.

## API Entry Points

Base URL:

```text
http://localhost:3000
```

Common routes:

- `GET /health`
- `GET /ready`
- `POST /api/auth/validate-vin`
- `POST /api/auth/login`
- `POST /api/auth/verify-biometric`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/request-password-otp`
- `POST /api/auth/reset-password-otp`
- `POST /api/auth/officers/login`
- `POST /api/auth/register-voter`
- `GET /api/ballots/:constituencyId`
- `POST /api/votes`
- `POST /api/admin/login`
- `GET /api/admin/dashboard`
- `GET /api/admin/results/:constituencyId`

See [docs/API.md](docs/API.md) for full request and response details.

## Documentation

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

- PostgreSQL must be reachable through `DATABASE_URL` before `/ready` and the integration test can pass.
- The backend defaults to console-based email output for local password reset testing.
- SMS behavior is intentionally mocked for this prototype.
- Production deployment would require hardened biometric matching, live notification providers, operational key management, election infrastructure review, and independent security auditing.
