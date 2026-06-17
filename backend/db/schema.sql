CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE biometric_method AS ENUM ('fingerprint', 'face');
CREATE TYPE voter_status AS ENUM ('registered', 'suspended');
CREATE TYPE election_status AS ENUM ('draft', 'open', 'closed', 'published');

-- Table 1: Constituencies
CREATE TABLE constituencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

-- Table 2: Local Government Areas
CREATE TABLE local_government_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    constituency_id INTEGER NOT NULL REFERENCES constituencies(id),
    UNIQUE (id, constituency_id)
);

-- Table 3: Mock INEC voter register used to validate VIN before app registration
CREATE TABLE inec_voter_register (
    vin VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    lga_id INTEGER NOT NULL,
    constituency_id INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'eligible',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (lga_id, constituency_id)
        REFERENCES local_government_areas(id, constituency_id)
);

-- Table 4: INEC Officers
CREATE TABLE election_officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'registration_officer',
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 5: Election Administrators
CREATE TABLE election_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'state_admin',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 6: Elections controlled by state administrators
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    election_type VARCHAR(100) NOT NULL DEFAULT 'house_of_representatives',
    status election_status NOT NULL DEFAULT 'draft',
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    created_by UUID REFERENCES election_admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 7: Political parties available for candidate assignment
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    logo_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 8: Voters (PARTITIONED by constituency_id)
CREATE TABLE voters (
    id UUID DEFAULT uuid_generate_v4(),
    vin VARCHAR(20) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(30),
    password_hash TEXT,
    constituency_id INTEGER NOT NULL,
    lga_id INTEGER NOT NULL,
    fingerprint_template_encrypted TEXT,
    face_template_encrypted TEXT,
    fingerprint_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    face_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    biometric_enrolled_at TIMESTAMP,
    offline_auth_hash VARCHAR(64),
    status voter_status DEFAULT 'registered',
    has_voted BOOLEAN DEFAULT FALSE,
    registered_by UUID REFERENCES election_officers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id, constituency_id),
    UNIQUE (vin, constituency_id),
    UNIQUE (email, constituency_id),
    FOREIGN KEY (lga_id, constituency_id)
        REFERENCES local_government_areas(id, constituency_id)
) PARTITION BY LIST (constituency_id);

-- Create partitions for each constituency (1-9)
CREATE TABLE voters_c1 PARTITION OF voters FOR VALUES IN (1);
CREATE TABLE voters_c2 PARTITION OF voters FOR VALUES IN (2);
CREATE TABLE voters_c3 PARTITION OF voters FOR VALUES IN (3);
CREATE TABLE voters_c4 PARTITION OF voters FOR VALUES IN (4);
CREATE TABLE voters_c5 PARTITION OF voters FOR VALUES IN (5);
CREATE TABLE voters_c6 PARTITION OF voters FOR VALUES IN (6);
CREATE TABLE voters_c7 PARTITION OF voters FOR VALUES IN (7);
CREATE TABLE voters_c8 PARTITION OF voters FOR VALUES IN (8);
CREATE TABLE voters_c9 PARTITION OF voters FOR VALUES IN (9);

-- Table 9: Candidates (PARTITIONED by constituency_id)
CREATE TABLE candidates (
    id SERIAL,
    name VARCHAR(200) NOT NULL,
    party VARCHAR(100) NOT NULL,
    constituency_id INTEGER NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id, constituency_id)
) PARTITION BY LIST (constituency_id);

-- Create partitions for candidates
CREATE TABLE candidates_c1 PARTITION OF candidates FOR VALUES IN (1);
CREATE TABLE candidates_c2 PARTITION OF candidates FOR VALUES IN (2);
CREATE TABLE candidates_c3 PARTITION OF candidates FOR VALUES IN (3);
CREATE TABLE candidates_c4 PARTITION OF candidates FOR VALUES IN (4);
CREATE TABLE candidates_c5 PARTITION OF candidates FOR VALUES IN (5);
CREATE TABLE candidates_c6 PARTITION OF candidates FOR VALUES IN (6);
CREATE TABLE candidates_c7 PARTITION OF candidates FOR VALUES IN (7);
CREATE TABLE candidates_c8 PARTITION OF candidates FOR VALUES IN (8);
CREATE TABLE candidates_c9 PARTITION OF candidates FOR VALUES IN (9);

-- Table 10: Votes (PARTITIONED by constituency_id)
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL,
    candidate_id INTEGER NOT NULL,
    constituency_id INTEGER NOT NULL,
    encrypted_payload TEXT NOT NULL,
    integrity_hash VARCHAR(64) NOT NULL,
    receipt_code VARCHAR(64) NOT NULL,
    biometric_method biometric_method NOT NULL,
    device_id VARCHAR(120),
    token_id UUID,
    offline_vote_id UUID,
    sync_source VARCHAR(30) NOT NULL DEFAULT 'online',
    client_cast_at TIMESTAMP,
    timestamp TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id, constituency_id),
    UNIQUE (voter_id, constituency_id),
    UNIQUE (receipt_code, constituency_id),
    FOREIGN KEY (voter_id, constituency_id)
        REFERENCES voters(id, constituency_id),
    FOREIGN KEY (candidate_id, constituency_id)
        REFERENCES candidates(id, constituency_id)
) PARTITION BY LIST (constituency_id);

-- Create partitions for votes
CREATE TABLE votes_c1 PARTITION OF votes FOR VALUES IN (1);
CREATE TABLE votes_c2 PARTITION OF votes FOR VALUES IN (2);
CREATE TABLE votes_c3 PARTITION OF votes FOR VALUES IN (3);
CREATE TABLE votes_c4 PARTITION OF votes FOR VALUES IN (4);
CREATE TABLE votes_c5 PARTITION OF votes FOR VALUES IN (5);
CREATE TABLE votes_c6 PARTITION OF votes FOR VALUES IN (6);
CREATE TABLE votes_c7 PARTITION OF votes FOR VALUES IN (7);
CREATE TABLE votes_c8 PARTITION OF votes FOR VALUES IN (8);
CREATE TABLE votes_c9 PARTITION OF votes FOR VALUES IN (9);

-- Table 11: Results (aggregated vote counts)
CREATE TABLE results (
    constituency_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    vote_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (constituency_id, candidate_id)
);

-- Table 12: Auth sessions used to invalidate short-lived partial and voting tokens
CREATE TABLE voter_auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL,
    constituency_id INTEGER NOT NULL,
    session_token_id UUID NOT NULL UNIQUE,
    voting_token_id UUID UNIQUE,
    auth_method biometric_method,
    biometric_attempt_count INTEGER NOT NULL DEFAULT 0,
    last_biometric_attempt_at TIMESTAMP,
    biometric_locked_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    biometric_verified_at TIMESTAMP,
    voting_token_invalidated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (voter_id, constituency_id)
        REFERENCES voters(id, constituency_id)
);

-- Table 13: Password reset tokens, stored hashed to protect reset links at rest
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL,
    constituency_id INTEGER NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (voter_id, constituency_id)
        REFERENCES voters(id, constituency_id)
);

-- Indexes for performance
CREATE INDEX idx_voters_vin ON voters(vin);
CREATE INDEX idx_voters_email ON voters(email);
CREATE INDEX idx_voters_constituency ON voters(constituency_id);
CREATE INDEX idx_inec_voter_register_lga ON inec_voter_register(lga_id, constituency_id);
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_parties_code ON parties(code);
CREATE INDEX idx_candidates_constituency ON candidates(constituency_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_votes_constituency ON votes(constituency_id);
CREATE INDEX idx_votes_receipt ON votes(receipt_code);
CREATE UNIQUE INDEX idx_votes_offline_vote_id ON votes(offline_vote_id, constituency_id);
CREATE INDEX idx_voter_auth_sessions_voter ON voter_auth_sessions(voter_id, constituency_id);
CREATE INDEX idx_voter_auth_sessions_voting_token ON voter_auth_sessions(voting_token_id);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
