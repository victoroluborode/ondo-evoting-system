# Database Design

For a plain-English explanation of what each backend entity does, see [Backend Entities](ENTITIES.md).

## Core Tables

### `constituencies`

Stores Ondo State's 9 Federal Constituencies.

### `local_government_areas`

Stores Ondo State LGAs and maps each LGA to its federal constituency.

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
- `has_voted`
- `constituency_id`
- `lga_id`

The biometric columns currently store enrollment values for the staged prototype. Fingerprint and face matching are planned for a later project phase.

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

The table has a unique constraint on `(voter_id, constituency_id)` to support one-voter-one-vote enforcement.

### `results`

Stores aggregated vote counts by constituency and candidate.

### `voter_auth_sessions`

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
