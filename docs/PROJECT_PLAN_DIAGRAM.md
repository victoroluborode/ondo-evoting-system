# Ondo State Bimodal E-Voting System Plan

## Clean Mermaid Diagrams For Drawing

These versions are designed to render like clean block diagrams. They avoid custom colors so they can be pasted into Mermaid Live, draw.io Mermaid import, GitHub, or a Markdown preview.

### A. System Architecture

```mermaid
%%{init: {"flowchart": {"htmlLabels": true, "nodeSpacing": 35, "rankSpacing": 45}}}%%
flowchart TB
    subgraph Mobile["Mobile Application"]
        direction LR
        VoterModule["<b>Voter Module</b><br/>Login, vote, receipt"]
        OfficerModule["<b>Officer Module</b><br/>Register, enroll biometrics"]
        AdminModule["<b>Admin Module</b><br/>Dashboard, management, results"]
        VoterModule ~~~ OfficerModule ~~~ AdminModule
    end

    subgraph Backend["Backend API - Express.js"]
        direction TB
        subgraph BackendRow1[" "]
            direction LR
            AuthService["<b>Auth Service</b><br/>JWT, bcrypt, biometric stage"]
            RegistrationService["<b>Registration Service</b><br/>VIN, LGA, biometrics"]
            VoteService["<b>Vote Service</b><br/>AES-256, SHA-256"]
            AuthService ~~~ RegistrationService ~~~ VoteService
        end
        subgraph BackendRow2[" "]
            direction LR
            BallotService["<b>Ballot Service</b><br/>Constituency ballots"]
            AdminService["<b>Admin Service</b><br/>Election control"]
            SecurityService["<b>Security Layer</b><br/>JWT, rate limits, hardening"]
            BallotService ~~~ AdminService ~~~ SecurityService
        end
    end

    subgraph Database["PostgreSQL Database"]
        direction LR
        Voters["<b>Voters</b><br/>VIN, biometrics"]
        Votes["<b>Votes</b><br/>Encrypted payload"]
        Results["<b>Results</b><br/>Vote counts"]
        Candidates["<b>Candidates</b><br/>Party, constituency"]
        Sessions["<b>Auth Sessions</b><br/>Token lifecycle"]
        Voters ~~~ Votes ~~~ Results ~~~ Candidates ~~~ Sessions
    end

    Mobile --> Backend
    Backend --> Database
```

### B. Admin Setup And Officer Registration Flow

```mermaid
flowchart TB
    Phase1["<b>Phase 1 - Admin Setup</b>"]
    CreateElection["<b>Admin creates election</b><br/>Set start/end time"]
    AddCandidates["<b>Add parties and candidates</b><br/>Assign to constituencies"]
    CreateOfficers["<b>Create and approve officers</b><br/>Assign officers to LGAs"]

    Phase2["<b>Phase 2 - Officer-Led Voter Registration</b>"]
    OfficerLogin["<b>Officer logs in</b><br/>Secure officer account"]
    VoterDetails["<b>Enter voter details and VIN</b><br/>VIN validated locally"]
    SelectLGA["<b>Select LGA</b><br/>System auto-assigns constituency"]

    Phase1 --> CreateElection
    CreateElection --> AddCandidates
    AddCandidates --> CreateOfficers
    CreateOfficers --> Phase2
    Phase2 --> OfficerLogin
    OfficerLogin --> VoterDetails
    VoterDetails --> SelectLGA
```

### C. Biometric Enrollment And Account Creation

```mermaid
flowchart TB
    Start["<b>Biometric enrollment begins</b><br/>Triggered after LGA assignment"]

    Fingerprint["<b>Fingerprint capture</b><br/>Deferred project module<br/>Template stored encrypted"]
    Face["<b>Face capture</b><br/>Deferred project module<br/>Embedding stored encrypted"]

    Password["<b>Password created</b><br/>bcrypt hash stored securely"]
    Account["<b>Voter account stored</b><br/>Ready for election day"]

    Start --> Fingerprint
    Start --> Face
    Fingerprint --> Password
    Face --> Password
    Password --> Account
```

### D. Election-Day Voting Flow

```mermaid
flowchart TB
    Phase3["<b>Phase 3 - Voting On Election Day</b>"]
    Login["<b>Voter enters VIN/email and password</b><br/>Backend issues 5-minute session token"]
    Biometric["<b>Biometric verification</b><br/>Voter chooses method"]

    Fingerprint["<b>Fingerprint</b><br/>Future scanner/client verification"]
    Face["<b>Face scan</b><br/>Future client embedding"]

    JWT["<b>Final voting JWT issued</b><br/>Constituency ballot fetched"]
    SelectVote["<b>Voter selects and confirms</b><br/>One-vote check enforced"]
    StoreVote["<b>Vote encrypted and stored</b><br/>AES-256, SHA-256 integrity hash"]
    Receipt["<b>Receipt issued</b><br/>Voter marked as voted, token revoked"]

    Phase3 --> Login
    Login --> Biometric
    Biometric --> Fingerprint
    Biometric --> Face
    Fingerprint --> JWT
    Face --> JWT
    JWT --> SelectVote
    SelectVote --> StoreVote
    StoreVote --> Receipt
```

### E. Roles And Permissions

```mermaid
flowchart LR
    subgraph Officer["<b>INEC Officer</b><br/>Registration authority"]
        direction TB
        O1["<b>Register voter details</b>"]
        O2["<b>Enroll fingerprint</b>"]
        O3["<b>Enroll face</b>"]
        O4["<b>Assign LGA</b>"]
        O5["<b>View registrations</b>"]
    end

    subgraph Voter["<b>Voter</b><br/>Votes once, anonymously"]
        direction TB
        V1["<b>VIN/email + password login</b>"]
        V2["<b>Biometric verify</b>"]
        V3["<b>View constituency ballot</b>"]
        V4["<b>Cast one vote</b>"]
        V5["<b>View own receipt</b>"]
    end

    subgraph Admin["<b>Election Admin</b><br/>Full system control"]
        direction TB
        A1["<b>Configure elections</b>"]
        A2["<b>Manage candidates</b>"]
        A3["<b>Manage officers</b>"]
        A4["<b>Monitor turnout</b>"]
        A5["<b>Review integrity alerts</b>"]
    end

    subgraph Observer["<b>Observer / Public</b><br/>Read-only if enabled"]
        direction TB
        P1["<b>Aggregated results</b>"]
        P2["<b>Turnout stats</b>"]
    end

    Privacy["<b>Privacy rule:</b> no one, including admins, can link a voter to their chosen candidate"]

    Officer --> Privacy
    Voter --> Privacy
    Admin --> Privacy
    Observer --> Privacy
```

## 1. System Architecture

```mermaid
flowchart TD
    A[Mobile Application] --> B[Backend API]
    B --> C[(PostgreSQL Database)]

    A --> A1[Voter Module]
    A --> A2[INEC Officer Module]
    A --> A3[Admin Module]

    B --> B1[Auth Service]
    B --> B2[Registration Service]
    B --> B3[Ballot Service]
    B --> B4[Vote Service]
    B --> B5[Admin Service]
    B --> B6[Security Layer]

    C --> C1[Voters]
    C --> C2[Officers]
    C --> C3[Admins]
    C --> C4[Constituencies/LGAs]
    C --> C5[Candidates/Parties]
    C --> C6[Encrypted Votes]
    C --> C7[Results]
    C --> C8[Auth Sessions]
```

## 2. Main User Roles

```mermaid
flowchart LR
    Officer[INEC Officer] --> R[Register Voters]
    Officer --> RB[Enroll Biometrics]
    Officer --> RC[Assign LGA/Constituency]
    Officer --> RR[View Recent Registrations]

    Voter[Voter] --> L[Login]
    Voter --> BV[Biometric Verification]
    Voter --> VB[View Constituency Ballot]
    Voter --> CV[Cast Vote]
    Voter --> RT[View Receipt]

    Admin[Election Admin] --> EC[Configure Election]
    Admin --> CP[Manage Candidates/Parties]
    Admin --> MO[Manage Officers]
    Admin --> MC[Manage Constituencies/LGAs]
    Admin --> MR[Monitor Registration/Turnout]
    Admin --> IA[Review Integrity Alerts]
    Admin --> VR[View Results]

    Observer[Observer/Public Results Viewer] --> OR[View Aggregated Results]
```

## 3. Role Responsibilities

| Action | Voter | INEC Officer | Admin | Observer |
| --- | --- | --- | --- | --- |
| Register voter details | No | Yes | Monitor only | No |
| Enroll biometrics | No | Yes | Monitor only | No |
| Login for voting | Yes | No | No | No |
| Biometric verification | Yes | No | No | No |
| Cast vote | Yes | No | No | No |
| View own receipt | Yes | No | No | No |
| Create/manage elections | No | No | Yes | No |
| Add/manage parties | No | No | Yes | No |
| Add/manage candidates | No | No | Yes | No |
| Manage officers | No | No | Yes | No |
| Monitor turnout | No | Limited | Yes | Read-only if enabled |
| View results | No during voting | No | Yes | Read-only if enabled |
| Export results | No | No | Yes | Optional |
| Receive anomaly alerts | No | No | Yes | No |
| See individual ballots | No | No | No | No |

The privacy rule is that nobody, including admins, should be able to see which voter selected which candidate. Admins only see aggregated results and high-level security/integrity alerts.

## 4. End-To-End Election Flow

```mermaid
flowchart TD
    S[Start] --> A[Admin creates election]
    A --> B[Admin adds parties and candidates]
    B --> C[Admin assigns candidates to constituencies]
    C --> D[Admin creates/approves INEC officers]

    D --> E[Officer logs in]
    E --> F[Officer enters voter details]
    F --> G[System validates VIN locally]
    G --> H[Officer selects LGA]
    H --> I[System auto-assigns constituency]
    I --> J[Fingerprint enrollment represented at API level for now]
    J --> K[Face template or embedding represented at API level for now]
    K --> L[Password is created]
    L --> M[Voter account stored securely]

    M --> N[Voter opens app on election day]
    N --> O[Voter enters VIN/email and password]
    O --> P[Backend verifies password with bcrypt]
    P --> Q[Backend issues temporary 5-minute session token]
    Q --> R[Voter chooses fingerprint or face verification]

    R --> R1[Fingerprint: submitted scanner/client verification]
    R --> R2[Face: submitted template or embedding]

    R1 --> S1[Backend verifies biometric stage]
    R2 --> S1

    S1 --> T[Backend issues final voting JWT]
    T --> U[System fetches only voter's constituency ballot]
    U --> V[Voter selects candidate]
    V --> W[Voter confirms vote]
    W --> X[Backend checks voter has not voted]
    X --> Y[Backend encrypts vote with AES-256]
    Y --> Z[Backend generates SHA-256 integrity hash]
    Z --> AA[Vote stored and results updated]
    AA --> AB[Voter marked as voted]
    AB --> AC[Voting token invalidated]
    AC --> AD[Voter receives non-revealing receipt]
    AD --> AE[Admin monitors turnout, alerts, and results]
```

## 5. Admin Module Plan

```mermaid
flowchart TD
    Admin[Admin Login] --> Dashboard[Election Dashboard]

    Dashboard --> Elections[Manage Elections]
    Dashboard --> Parties[Manage Parties]
    Dashboard --> Candidates[Manage Candidates]
    Dashboard --> Officers[Manage INEC Officers]
    Dashboard --> Voters[Monitor Voter Registration]
    Dashboard --> Turnout[Monitor Turnout]
    Dashboard --> Results[View Constituency Results]
    Dashboard --> Alerts[Security/Integrity Alerts]

    Elections --> E1[Create Election]
    Elections --> E2[Set Start/End Time]
    Elections --> E3[Open/Close Election]

    Parties --> P1[Add Party]
    Parties --> P2[Edit Party]
    Parties --> P3[Deactivate Party]

    Candidates --> C1[Add Candidate]
    Candidates --> C2[Assign Candidate to Party]
    Candidates --> C3[Assign Candidate to Constituency]
    Candidates --> C4[Edit/Deactivate Candidate]

    Officers --> O1[Create Officer Account]
    Officers --> O2[Assign Officer to LGA/Center]
    Officers --> O3[Disable Officer Account]

    Alerts --> A1[Double-Vote Attempt]
    Alerts --> A2[Invalid Constituency Access]
    Alerts --> A3[Repeated Failed Biometric Attempts]
    Alerts --> A4[Unusual Turnout Pattern]
```

## 6. Backend Plan

```mermaid
flowchart TD
    API[Express Backend API] --> Auth[Authentication Routes]
    API --> Ballot[Ballot Routes]
    API --> Vote[Vote Routes]
    API --> Admin[Admin Routes]
    API --> Security[Security Middleware]

    Auth --> A1[Officer Login]
    Auth --> A2[Voter Registration]
    Auth --> A3[Voter Login]
    Auth --> A4[Biometric Verification]
    Auth --> A5[Password Reset]

    Ballot --> B1[Fetch Constituencies]
    Ballot --> B2[Fetch Constituency Candidates]

    Vote --> V1[Validate Voting JWT]
    Vote --> V2[Check Has Voted]
    Vote --> V3[Validate Candidate Constituency]
    Vote --> V4[Encrypt Vote]
    Vote --> V5[Generate Receipt/Hash]
    Vote --> V6[Update Results]

    Admin --> AD1[Admin Login]
    Admin --> AD2[Dashboard]
    Admin --> AD3[Manage Candidates]
    Admin --> AD4[Manage Parties]
    Admin --> AD5[Manage Elections]
    Admin --> AD6[Manage Officers]
    Admin --> AD7[View Results]

    Security --> S1[JWT]
    Security --> S2[bcrypt]
    Security --> S3[AES-256-GCM]
    Security --> S4[SHA-256]
    Security --> S5[Rate Limiting]
```

## 7. Database Plan

```mermaid
erDiagram
    CONSTITUENCIES ||--o{ LGAS : contains
    CONSTITUENCIES ||--o{ VOTERS : registers
    CONSTITUENCIES ||--o{ CANDIDATES : contains
    CONSTITUENCIES ||--o{ VOTES : stores

    LGAS ||--o{ VOTERS : belongs_to
    OFFICERS ||--o{ VOTERS : registers
    VOTERS ||--o{ VOTES : casts
    CANDIDATES ||--o{ VOTES : receives
    CANDIDATES ||--o{ RESULTS : counted_in
    CONSTITUENCIES {
        int id
        string name
        string code
    }

    VOTERS {
        int id
        string vin
        string full_name
        string email
        string password_hash
        int constituency_id
        int lga_id
        string fingerprint_template_encrypted
        string face_template_encrypted
        boolean has_voted
    }

    CANDIDATES {
        int id
        string name
        string party
        int constituency_id
    }

    VOTES {
        int id
        int voter_id
        int candidate_id
        int constituency_id
        string encrypted_payload
        string integrity_hash
        string receipt_code
    }

    RESULTS {
        int constituency_id
        int candidate_id
        int vote_count
    }
```

## 8. Prototype Scope

```text
What works in the prototype:
- Officer-led voter registration
- VIN captured and validated locally
- LGA-to-constituency assignment
- Fingerprint/face verification modeled at backend API level
- Biometric samples/templates accepted at API level for now
- Password hashing
- Staged authentication
- Constituency-specific ballots
- AES-256 encrypted vote storage
- SHA-256 integrity hash
- One-voter-one-vote enforcement
- Admin dashboard and results
- Admin election/candidate/party/officer management planned as the next module expansion

Production integrations needed later:
- Live INEC voter register/VIN validation
- Project fingerprint verification module
- Project face recognition/liveness module
- Full candidate/election management approval workflow
- Production email/SMS providers
- Hosting, backups, monitoring, and independent security audit
- Audit logging for sensitive election/admin events
```
