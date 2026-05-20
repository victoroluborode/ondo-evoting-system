# Ondo State Bimodal E-Voting Backend

Backend implementation of a scalable bimodal e-voting system for Ondo State's 9 Federal Constituencies, focused on House of Representatives elections.

The backend supports:

- INEC officer-managed voter registration
- VIN-or-email/password voter login
- Email reset and mock-SMS OTP password reset
- Staged biometric verification API
- Constituency-isolated ballots
- AES-256 encrypted vote payloads
- SHA-256 vote integrity receipts
- One-voter-one-vote enforcement
- Admin result monitoring

## Project Scope

This project is designed to be academically solid and demo-ready. Some real-world integrations are intentionally represented at API level:

- Biometric enrollment values are stored as opaque templates/placeholders.
- Biometric verification is a staged API boundary; fingerprint and face matching are planned for a later project phase.
- SMS delivery is mocked and logged locally.
- Email delivery uses a provider seam and defaults to console logging.
- Offline-capable authentication/voting is represented architecturally; final sync/reconciliation is a later client-side module.
- Admin monitoring is functional for seeded/local election data.

## Tech Stack

- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Security: AES-256-GCM encryption, SHA-256 hashing, JWT session control
- Testing: Node-based backend integration tests
- Client: any mobile or web frontend can consume the backend API

## Main Backend Flows

Voter flow:

```text
VIN or email + password login
  -> Temporary 5-minute session token
  -> Fingerprint or face verification API
  -> Final voting JWT
  -> Constituency ballot
  -> Encrypted vote cast
  -> Receipt and token invalidation
```

Password reset flow:

```text
Email available:
  email reset link -> new password

No email:
  VIN -> mock SMS OTP -> new password
```

Officer registration flow:

```text
Officer login
  -> Voter details
  -> LGA selection and constituency assignment
  -> Fingerprint and face template submission
  -> Password hashing
  -> Registration confirmation
```

Admin flow:

```text
Admin login
  -> State dashboard
  -> Constituency results
```

## Demo Credentials

Officer:

```text
officer@inec.ondo.gov.ng
Password123!
```

Admin:

```text
admin@inec.ondo.gov.ng
AdminPassword123!
```

## Quick Start

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Health checks:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Verification

```bash
cd backend
npm run check
npm test
```

## Documentation

- [Backend README](backend/README.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Backend Entities](docs/ENTITIES.md)
- [Database Design](docs/DATABASE.md)
- [Security Model](docs/SECURITY.md)
- [Demo Guide](docs/DEMO.md)
- [Limitations and Future Work](docs/LIMITATIONS.md)
- [Benchmark Analysis](docs/BENCHMARK_ANALYSIS.md)
- [Benchmark Implementation Notes](docs/BENCHMARK_IMPLEMENTATION_NOTES.md)
- [Prototype Implementation Roadmap](docs/PROTOTYPE_IMPLEMENTATION_ROADMAP.md)
- [Project Plan Diagrams](docs/PROJECT_PLAN_DIAGRAM.md)
