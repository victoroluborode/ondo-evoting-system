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

### `POST /api/auth/validate-vin`

Validates a VIN against the mock INEC voter register before officer-led registration. Requires officer JWT.

Body:

```json
{
  "vin": "MOCKVIN001",
  "lgaId": 1,
  "constituencyId": 1
}
```

Response:

```json
{
  "success": true,
  "vin": "MOCKVIN001",
  "fullName": "Mock Eligible Voter One",
  "lgaId": 1,
  "constituencyId": 1,
  "alreadyRegistered": false
}
```

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
  "biometricEnrollment": {
    "fingerprint": true,
    "face": true
  },
  "message": "Proceed to biometric verification",
  "expiresInSeconds": 300
}
```

### `POST /api/auth/verify-biometric`

Upgrades a partial session to a final voting JWT after fingerprint or face verification.

The backend does not perform biometric matching directly yet. Fingerprint and face
matching are planned for a later project phase; for now, prototype requests send
`biometricVerified: true` after the biometric step is considered successful.
The backend still validates that the selected method was enrolled and tracks failed
biometric attempts on the partial session. After three failed attempts, that session
is locked.

Body:

```json
{
  "sessionToken": "...",
  "method": "fingerprint",
  "biometricVerified": true
}
```

Failed response example:

```json
{
  "error": "Biometric verification was not confirmed",
  "attemptsRemaining": 2,
  "locked": false
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

### `GET /api/votes/offline-package/:constituencyId`

Downloads a signed offline voting package while an election is open. Requires voter JWT.

Query:

```text
deviceId=ondo-mobile
```

Response includes:

- open election metadata
- constituency candidates
- signed `offlineToken`
- package expiry metadata

### `POST /api/votes/sync`

Synchronizes queued offline votes after connectivity returns. This uses the signed `offlineToken` from the offline package.

Body:

```json
{
  "offlineToken": "...",
  "votes": [
    {
      "offlineVoteId": "uuid-generated-on-device",
      "candidateId": 1,
      "deviceId": "ondo-mobile",
      "clientCastAt": "2027-02-25T10:15:00Z"
    }
  ]
}
```

Each queued vote is reconciled independently and returns `accepted`, `duplicate`, or `rejected`. The backend still enforces election lifecycle, constituency isolation, candidate validity, and one-voter-one-vote.

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

### Constituency and LGA Management

All routes require admin JWT.

```text
GET    /api/admin/constituencies
PATCH  /api/admin/constituencies/:id
GET    /api/admin/lgas
POST   /api/admin/lgas
PATCH  /api/admin/lgas/:id
DELETE /api/admin/lgas/:id
```

Constituency update body:

```json
{
  "name": "Akure North/Akure South",
  "code": "ON01"
}
```

LGA create/update body:

```json
{
  "name": "Akure North",
  "constituencyId": 1
}
```

The backend protects existing voter and mock INEC register records. LGAs with voter/register records cannot be remapped or deleted.

### Election Management

All routes require admin JWT.

```text
GET    /api/admin/elections
POST   /api/admin/elections
PATCH  /api/admin/elections/:id
POST   /api/admin/elections/:id/open
POST   /api/admin/elections/:id/close
POST   /api/admin/elections/:id/publish
DELETE /api/admin/elections/:id
```

Create/update body:

```json
{
  "name": "House of Representatives Elections 2027",
  "electionType": "house_of_representatives",
  "status": "draft",
  "startsAt": "2027-02-25T08:00:00Z",
  "endsAt": "2027-02-25T14:00:00Z"
}
```

Elections must be created as `draft`. The lifecycle moves forward only:

```text
draft -> open -> closed -> published
```

Opening an election requires every constituency to have at least one candidate and prevents another House of Representatives election from already being open. While an election is `open`, voters can fetch ballots and cast votes. Closing blocks further voting, and publishing marks results as final. Only draft elections can be deleted.

### Party Management

All routes require admin JWT.

```text
GET    /api/admin/parties
POST   /api/admin/parties
PATCH  /api/admin/parties/:id
DELETE /api/admin/parties/:id
```

Create/update body:

```json
{
  "name": "All Progressives Congress",
  "code": "APC",
  "logoUrl": "https://example.com/apc.png",
  "status": "active"
}
```

Parties with assigned candidates cannot be deleted.

### Candidate Management

All routes require admin JWT.

```text
GET    /api/admin/candidates
GET    /api/admin/candidates?constituencyId=1
POST   /api/admin/candidates
PATCH  /api/admin/candidates/:constituencyId/:candidateId
DELETE /api/admin/candidates/:constituencyId/:candidateId
```

Create/update body:

```json
{
  "name": "Candidate Name",
  "party": "APC",
  "constituencyId": 1,
  "photoUrl": "https://example.com/candidate.jpg"
}
```

Candidates with recorded votes cannot be deleted.

### Officer Management

All routes require admin JWT.

```text
GET    /api/admin/officers
POST   /api/admin/officers
PATCH  /api/admin/officers/:id
DELETE /api/admin/officers/:id
```

Create/update body:

```json
{
  "fullName": "INEC Officer",
  "email": "officer@example.com",
  "password": "Password123!",
  "role": "registration_officer",
  "status": "active"
}
```

`DELETE` disables an officer account by setting `status` to `disabled`.
