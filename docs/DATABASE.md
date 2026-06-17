# Database Design

For a plain-English explanation of what each backend entity does, see [Backend Entities](ENTITIES.md).

## Core Tables

### `constituencies`

Stores Ondo State's 9 Federal Constituencies.

### `local_government_areas`

Stores Ondo State LGAs and maps each LGA to its federal constituency.
Admins can list LGAs, create new LGA records for setup/testing, and update mappings when the LGA has no voter or mock INEC register records attached.

### `inec_voter_register`

Stores the mock INEC voter roll used to validate VINs before app registration.

Important fields:

- `vin`
- `full_name`
- `lga_id`
- `constituency_id`
- `status`

Officer-led registration now checks this table before creating a voter account. A VIN must exist, be `eligible`, and match the selected LGA/constituency.

### `voters`

Stores registered voters. This table is partitioned by `constituency_id`.

Important fields:

- `vin`
- `full_name`
- `email`
- `phone_number`
- `password_hash`
- `fingerprint_template_encrypted`
- `face_template_encrypted`
- `fingerprint_enrolled`
- `face_enrolled`
- `biometric_enrolled_at`
- `has_voted`
- `constituency_id`
- `lga_id`

The biometric columns currently store enrollment values and enrollment status for the staged prototype. Fingerprint and face matching are planned for a later project phase.

### `elections`

Stores administrator-controlled election records.

Important fields:

- `name`
- `election_type`
- `status`
- `starts_at`
- `ends_at`

Election statuses are `draft`, `open`, `closed`, and `published`.

Lifecycle rule:

```text
draft -> open -> closed -> published
```

Only `open` elections accept ballot fetches and vote submissions. Candidate changes are blocked while an election is open.

### `parties`

Stores political parties that can be assigned to candidates.

Important fields:

- `name`
- `code`
- `logo_url`
- `status`

### `candidates`

Stores candidates per constituency. This table is partitioned by `constituency_id`.

### `votes`

Stores encrypted votes. This table is partitioned by `constituency_id`.

Important fields:

- `encrypted_payload`
- `integrity_hash`
- `receipt_code`
- `biometric_method`
- `token_id`
- `offline_vote_id`
- `sync_source`
- `client_cast_at`

The table has a unique constraint on `(voter_id, constituency_id)` to support one-voter-one-vote enforcement.
Offline sync uses `offline_vote_id` for idempotent retries, `sync_source` to distinguish direct online votes from queued offline votes, and `client_cast_at` to preserve the device-side cast time.

### `results`

Stores aggregated vote counts by constituency and candidate.

### `voter_auth_sessions`

Tracks temporary login sessions and final voting token invalidation.

Important biometric fields:

- `auth_method`
- `biometric_attempt_count`
- `last_biometric_attempt_at`
- `biometric_locked_at`
- `biometric_verified_at`

Tracks partial and final voting sessions so that voting tokens can be invalidated after a successful vote.

### `password_reset_tokens`

Stores hashed email reset tokens and hashed SMS OTP reset tokens. Raw reset tokens and raw OTP values are never stored directly.

## Partitioning Strategy

The project partitions these tables by constituency:

- `voters`
- `candidates`
- `votes`

This demonstrates electoral isolation. Each federal constituency can be queried and managed independently while still belonging to one state-wide system.

## Seed Data

The seed file includes:

- 9 constituencies
- 18 LGAs
- demo officer account
- demo admin account
- demo voters
- candidates for each constituency

Demo credentials are documented in the root README.
