# API Reference

Base URL:

```text
http://localhost:3000
```

## Health

### `GET /health`

Checks whether the API process is running.

### `GET /ready`

Checks whether the API can reach PostgreSQL.

## Voter Authentication

### `POST /api/auth/login`

Verifies voter VIN-or-email/password and returns a 5-minute partial session token.

Body:

```json
{
  "identifier": "VIN-DEMO-001",
  "password": "Password123!"
}
```

`identifier` can be either the voter's VIN or email address. The older `email` field is also accepted for compatibility.

Response:

```json
{
  "success": true,
  "sessionToken": "...",
  "constituencyId": 1,
  "fullName": "Ade Voter",
  "message": "Proceed to biometric verification",
  "expiresInSeconds": 300
}
```

### `POST /api/auth/verify-biometric`

Upgrades a partial session to a final voting JWT after fingerprint or face verification.

The backend does not perform biometric matching directly yet. Fingerprint and face
matching are planned for a later project phase; for now, prototype requests send
`biometricVerified: true` after the biometric step is considered successful.

Body:

```json
{
  "sessionToken": "...",
  "method": "fingerprint",
  "biometricVerified": true
}
```

Response:

```json
{
  "success": true,
  "token": "...",
  "constituencyId": 1,
  "fullName": "Ade Voter",
  "authMethod": "fingerprint",
  "message": "Voting authentication complete"
}
```

### `POST /api/auth/forgot-password`

Creates an email reset token if the email exists. Always returns a generic response to avoid account enumeration.

Body:

```json
{
  "email": "voter@example.com"
}
```

### `POST /api/auth/reset-password`

Completes a password reset using a one-time token.

Body:

```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

### `POST /api/auth/request-password-otp`

Sends a mock SMS OTP to the phone number registered against a VIN. This supports voters who do not have email addresses.

Body:

```json
{
  "vin": "VIN-DEMO-001"
}
```

Response:

```json
{
  "success": true,
  "message": "If that VIN has a phone number, a reset OTP has been sent."
}
```

In non-production mode, the backend also returns `debugOtp` for local testing.

### `POST /api/auth/reset-password-otp`

Completes a password reset using VIN + SMS OTP.

Body:

```json
{
  "vin": "VIN-DEMO-001",
  "otp": "123456",
  "password": "NewPassword123!"
}
```

## Officer Registration

### `POST /api/auth/officers/login`

Authenticates an INEC registration officer.

Body:

```json
{
  "email": "officer@inec.ondo.gov.ng",
  "password": "Password123!"
}
```

### `POST /api/auth/register-voter`

Registers a voter. Requires officer JWT.

Headers:

```text
Authorization: Bearer <officer-token>
```

Body:

```json
{
  "vin": "VIN-DEMO-001",
  "fullName": "Ade Voter",
  "email": "ade.voter@example.com",
  "phoneNumber": "+2348000000000",
  "password": "Password123!",
  "constituencyId": 1,
  "lgaId": 1,
  "fingerprintTemplate": "demo-fingerprint",
  "faceTemplate": "demo-face"
}
```

`email` is optional. Voters without email can still be registered with VIN, phone number, password, LGA, constituency, and biometrics.

## Ballots

### `GET /api/ballots/constituencies`

Returns constituencies and LGAs.

### `GET /api/ballots/:constituencyId`

Returns candidates for the voter's own constituency. Requires voter JWT.

Headers:

```text
Authorization: Bearer <voter-token>
```

## Voting

### `POST /api/votes`

Casts an encrypted vote. Requires voter JWT.

Body:

```json
{
  "candidateId": 1,
  "deviceId": "ondo-mobile"
}
```

Response:

```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "receiptCode": "...",
  "integrityHash": "..."
}
```

## Admin

### `POST /api/admin/login`

Authenticates a senior INEC administrator.

Body:

```json
{
  "email": "admin@inec.ondo.gov.ng",
  "password": "AdminPassword123!"
}
```

### `GET /api/admin/dashboard`

Returns state-wide constituency metrics. Requires admin JWT.

### `GET /api/admin/results/:constituencyId`

Returns candidate vote counts for one constituency. Requires admin JWT.
