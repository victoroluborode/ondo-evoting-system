# Backend

Express and PostgreSQL backend for the Ondo State Bimodal E-Voting System.

## Responsibilities

- Officer authentication
- Voter registration
- Password login and partial session token
- Biometric verification upgrade to voting JWT
- Constituency-aware ballot access
- Encrypted vote casting
- One-voter-one-vote enforcement
- Admin authentication, results monitoring, and management CRUD
- Election, party, candidate, and officer management
- Email token and mock-SMS OTP password reset

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Required `.env` values:

- `DATABASE_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

Generate a strong encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database

Main files:

- `db/schema.sql`
- `db/seed.sql`
- `db/migrations/001_security_upgrade.sql`
- `db/migrations/002_staff_login_codes.sql`

The schema includes partitioned voters, candidates, and votes by constituency.

## Demo Credentials

Officer:

```text
Officer ID: OFF-1002
officer@inec.ondo.gov.ng
Password123!
```

Admin:

```text
Admin ID: ADM-ONDO-001
admin@inec.ondo.gov.ng
AdminPassword123!
```

## Health Checks

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Tests

```bash
npm run check
npm test
```

The integration test covers the core project flow from registration to voting.

## Mocked Services

Email:

- Password reset email is logged to the console by default.
- Real email can be added in `src/services/email.js`.

SMS:

- SMS is intentionally mocked.
- Registration SMS messages are logged as `mock_registration_sms`.
- Password reset OTP messages are logged as `mock_password_reset_otp`.

## Related Docs

- [API Reference](../docs/API.md)
- [Database Design](../docs/DATABASE.md)
- [Security Model](../docs/SECURITY.md)
- [Demo Guide](../docs/DEMO.md)
