# System Architecture

## Overview

The Ondo State Bimodal E-Voting System backend is the control layer for voter registration, authentication, ballot access, vote casting, and result aggregation.

The architecture has two main backend components:

- Express backend API for authentication, registration, ballots, voting, and results
- PostgreSQL database with constituency-aware partitioning

## High-Level Components

```text
Express API
  |-- Auth routes
  |-- Ballot routes
  |-- Vote routes
  |-- Admin routes
          |
          v
PostgreSQL
  |-- Constituencies
  |-- LGAs
  |-- Voters partitioned by constituency
  |-- Candidates partitioned by constituency
  |-- Votes partitioned by constituency
  |-- Results
```

## Voter Authentication Architecture

The voter authentication flow is deliberately staged:

1. VIN-or-email and password are verified.
2. Backend creates a short-lived partial session token.
3. Voter chooses fingerprint or face verification.
4. Backend upgrades the partial session into a final voting JWT.
5. Final JWT is required to fetch ballot and cast vote.
6. After voting, the JWT session is invalidated.

This demonstrates multi-factor authentication while keeping the voting token separate from the password login stage.

## Constituency Isolation

Voters, candidates, and votes are partitioned by `constituency_id`. Backend routes also check the constituency in the JWT before returning a ballot or accepting a vote.

This means a voter registered in one constituency cannot access or vote in another constituency's election.

## Deferred Biometric Components

For final year project scope:

- Fingerprint enrollment is represented at API level through submitted enrollment values.
- Face verification is represented at API level through submitted template or embedding values.
- SMS confirmation is mocked and logged locally.
- Email reset links are logged locally unless a provider is added.

These boundaries keep the backend ready while the project's own fingerprint and face-recognition modules are deferred to a later implementation phase.

## Offline-Capable Operation

The system is designed to support poor-connectivity election environments.

Backend-side support includes:

- voter records carrying an `offline_auth_hash`
- encrypted vote payloads with integrity hashes
- receipt codes that can be shown after vote submission
- token/session records that support controlled voting sessions

The actual offline queue, biometric capture, and later synchronization would live in the client/offline module. The important rule is that offline votes must still be encrypted, tied to the voter's constituency, checked for one-voter-one-vote during sync, and reconciled before final results are accepted.
