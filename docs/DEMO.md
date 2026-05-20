# Backend Demo Guide

This guide demonstrates the backend API without a frontend. Use it for supervisor walkthroughs while the frontend is being rebuilt from scratch.

## 1. Start Backend

```bash
cd backend
npm start
```

Check:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## 2. Run Automated Backend Demo

```bash
cd backend
npm test
```

The integration test demonstrates:

- health/readiness
- admin login/dashboard
- officer login
- voter registration
- voter login with temporary partial session
- biometric verification API
- constituency ballot fetch
- encrypted vote casting
- voting token invalidation
- forgot password request

## 3. Manual API Demo Flow

Use Postman, Insomnia, Thunder Client, or curl.

### Officer Login

```http
POST /api/auth/officer/login
```

Credentials:

```text
officer@inec.ondo.gov.ng
Password123!
```

### Register Voter

```http
POST /api/auth/register-voter
Authorization: Bearer <officer_token>
```

Submit voter details:

- VIN
- full name
- email
- phone number
- LGA ID
- constituency ID
- password
- fingerprint template
- face enrollment value

The backend stores:

- bcrypt password hash
- encrypted fingerprint template
- encrypted face enrollment value
- LGA and constituency
- `has_voted = false`

### Voter Login

```http
POST /api/auth/login
```

The backend verifies VIN-or-email/password and returns a temporary 5-minute session token.

Example:

```json
{
  "identifier": "VIN-DEMO-001",
  "password": "Password123!"
}
```

### Biometric Verification

```http
POST /api/auth/verify-biometric
```

Submit:

```json
{
  "sessionToken": "<partial_session_token>",
  "method": "fingerprint",
  "biometricVerified": true
}
```

or:

```json
{
  "sessionToken": "<partial_session_token>",
  "method": "face",
  "biometricVerified": true
}
```

If the prototype marks biometric verification as successful, the backend returns the final voting JWT.

### Fetch Ballot

```http
GET /api/ballots/:constituencyId
Authorization: Bearer <voting_token>
```

The backend enforces constituency isolation.

### Cast Vote

```http
POST /api/votes
Authorization: Bearer <voting_token>
```

The backend:

- validates the voting JWT
- checks voter has not voted
- checks candidate belongs to the voter constituency
- encrypts the vote payload with AES-256-GCM
- generates SHA-256 integrity hash
- stores vote
- updates results
- marks voter as voted
- invalidates the voting token

### Admin Dashboard

```http
POST /api/admin/login
GET /api/admin/dashboard
GET /api/admin/results/:constituencyId
```

Credentials:

```text
admin@inec.ondo.gov.ng
AdminPassword123!
```
