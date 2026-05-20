# Security Model

## Authentication

The voter login flow uses staged authentication:

1. VIN-or-email and password are verified with bcrypt.
2. Backend creates a 5-minute partial session token.
3. Voter completes fingerprint or face verification.
4. Backend issues final voting JWT.
5. Final JWT is invalidated after a successful vote.

Officer and admin users have separate login routes and JWT token scopes.

## Password Storage

Passwords are hashed with bcrypt before storage. Plaintext passwords are never stored.

## Password Reset

Voters with email can reset through an email token. Voters without email can reset through VIN + phone OTP. OTP values are mocked for the demo, hashed before storage, expire after 10 minutes, and are marked as used after a successful reset.

## Vote Encryption

Vote payloads are encrypted with AES-256-GCM through Node.js crypto utilities. GCM provides confidentiality and tamper detection.

The encrypted payload includes:

- voter ID
- candidate ID
- constituency ID
- timestamp
- device ID

## Integrity Hash

Each vote has a SHA-256 integrity hash. The voter receives a non-revealing receipt/reference.

The backend returns the receipt/reference so a future frontend can display it after vote submission.

## Constituency Isolation

The backend checks the voter's JWT constituency before returning ballots or accepting votes.

The database also partitions voters, candidates, and votes by constituency ID.

## One-Voter-One-Vote

The system enforces this with:

- `has_voted` flag on the voter record
- unique vote constraint on `(voter_id, constituency_id)`
- transaction-level voter row lock during vote casting
- final JWT invalidation after successful vote

## Prototype Security Components

For project scope, these parts are represented at backend/API level:

- fingerprint verification is represented by a backend confirmation field
- face verification is represented by a backend confirmation field
- the actual fingerprint and face matching modules are planned for a later project phase
- SMS registration and OTP delivery are mocked locally

The backend still models how these components fit into the final security workflow.

## Future Security Improvements

- Implement the project's fingerprint verification module
- Implement the project's face-recognition and liveness module
- Device attestation
- Stronger admin role permissions
- Full penetration testing
- HTTPS-only deployment
- Centralized logging and monitoring
- Audit logging for sensitive election/admin events
- Hardware security module or key management service for encryption keys
