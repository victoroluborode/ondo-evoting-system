# Backend Entities

This document explains the main entities in the Ondo State Bimodal E-Voting backend and what each one does.

## Entity Groups

```text
People:
- Voter
- Election Officer
- Election Admin

Election structure:
- Constituency
- Local Government Area
- Candidate

Voting records:
- Vote
- Result

Security/control:
- Voter Auth Session
- Password Reset Token
```

## 1. Voter

Represents a registered person eligible to vote.

Stores:

- VIN
- full name
- email
- phone number
- password hash
- LGA
- constituency
- encrypted fingerprint enrollment value
- encrypted face enrollment value
- `has_voted`
- account status

Purpose:

> Identifies who can vote, where they can vote, and whether they have already voted.

The VIN is the election-realistic login identifier. Email is still stored for communication, password reset, and convenience, but voter login supports VIN or email.

## 2. Election Officer

Represents INEC registration staff.

Stores:

- officer name
- email
- password hash
- role
- status

Purpose:

> Allows authorized officers to register voters and submit biometric enrollment data.

Election officers are operational users. They work at registration centers and should not have full election management access.

## 3. Election Admin

Represents senior election managers.

Stores:

- admin name
- email
- password hash
- role
- status

Purpose:

> Allows admins to monitor the election, view dashboards/results, and later manage candidates, parties, officers, and elections.

Admins are supervisory users. They should not be treated the same as registration officers because they have broader election-management responsibilities.

## 4. Constituency

Represents one Federal Constituency in Ondo State.

Stores:

- constituency name
- constituency code

Purpose:

> Separates voters, candidates, ballots, votes, and results by electoral district.

This is central to electoral isolation. A voter registered in one constituency must not access another constituency's ballot.

## 5. Local Government Area

Represents an LGA inside a Federal Constituency.

Stores:

- LGA name
- constituency ID

Purpose:

> When a voter's LGA is selected, the system automatically knows the voter's constituency.

## 6. Candidate

Represents someone contesting in an election.

Stores:

- candidate name
- party
- constituency ID
- optional photo/status fields where supported

Purpose:

> Appears on the ballot for voters in the matching constituency.

Candidates are constituency-bound so voters only see candidates valid for their registered constituency.

## 7. Vote

Represents a cast vote.

Stores:

- voter ID
- candidate ID
- constituency ID
- encrypted vote payload
- integrity hash
- receipt code
- biometric method
- device ID
- token ID
- timestamp

Purpose:

> Stores the vote securely without exposing vote content directly.

The vote table supports one-voter-one-vote enforcement and integrity verification.

## 8. Result

Stores aggregated vote counts.

Stores:

- constituency ID
- candidate ID
- vote count
- last updated timestamp

Purpose:

> Allows admin dashboard/results to display totals without decrypting every vote.

## 9. Voter Auth Session

Tracks temporary and final voter sessions.

Stores:

- voter ID
- constituency ID
- partial session token ID
- voting token ID
- biometric method
- expiration time
- biometric verification time
- invalidation time

Purpose:

> Supports staged authentication and allows the backend to invalidate the voting token after a vote is cast.

This entity is what makes the login flow safer: password login alone does not equal permission to vote.

## 10. Password Reset Token

Stores password reset requests.

Stores:

- voter ID
- reset token hash
- expiry time
- used time
- created time

Purpose:

> Allows secure forgot-password/reset-password flow.

Raw password reset tokens are not stored directly.

## Admin vs Officer

It makes sense to separate Election Admin from Election Officer.

```text
Election Officer = registration center user
Election Admin   = election setup, monitoring, and results user
```

### Election Officer

Can:

- register voters
- submit voter details
- assign LGA/constituency through the registration flow
- submit biometric templates/embeddings

Should not:

- manage candidates
- create elections
- manage other officers
- view full admin dashboards
- control results

### Election Admin

Can:

- monitor all constituencies
- view registered voter counts
- view turnout
- view results
- manage candidates/parties/elections in the planned admin module
- manage officers in the planned admin module
- monitor system status and security alerts in the planned admin module

Should not:

- see how a specific voter voted
- modify submitted votes

## Summary

The backend entities represent:

- who uses the system
- where elections happen
- who contests
- how votes are stored
- how results are counted
- how authentication and reset sessions are controlled

The most important design principle is privacy:

> No user, including an admin, should be able to link a voter to the candidate they selected.
