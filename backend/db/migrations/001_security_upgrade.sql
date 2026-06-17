DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'biometric_method') THEN
    CREATE TYPE biometric_method AS ENUM ('fingerprint', 'face');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voter_status') THEN
    CREATE TYPE voter_status AS ENUM ('registered', 'suspended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'election_status') THEN
    CREATE TYPE election_status AS ENUM ('draft', 'open', 'closed', 'published');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS election_officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'registration_officer',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS election_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'state_admin',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inec_voter_register (
    vin VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    lga_id INTEGER NOT NULL,
    constituency_id INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'eligible',
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE voters ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS fingerprint_template_encrypted TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS face_template_encrypted TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS fingerprint_enrolled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS face_enrolled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS biometric_enrolled_at TIMESTAMP;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS offline_auth_hash VARCHAR(64);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS status voter_status DEFAULT 'registered';
ALTER TABLE voters ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES election_officers(id);
ALTER TABLE election_officers ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'active';

UPDATE voters
SET fingerprint_enrolled = TRUE
WHERE fingerprint_template_encrypted IS NOT NULL;

UPDATE voters
SET face_enrolled = TRUE
WHERE face_template_encrypted IS NOT NULL;

UPDATE voters
SET biometric_enrolled_at = COALESCE(biometric_enrolled_at, created_at, NOW())
WHERE fingerprint_enrolled = TRUE AND face_enrolled = TRUE;

CREATE TABLE IF NOT EXISTS elections (
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

CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    logo_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE votes ADD COLUMN IF NOT EXISTS encrypted_payload TEXT;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS integrity_hash VARCHAR(64);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS receipt_code VARCHAR(64);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS biometric_method biometric_method;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS device_id VARCHAR(120);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS token_id UUID;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS offline_vote_id UUID;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS sync_source VARCHAR(30) NOT NULL DEFAULT 'online';
ALTER TABLE votes ADD COLUMN IF NOT EXISTS client_cast_at TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'vote_hash'
  ) THEN
    ALTER TABLE votes ALTER COLUMN vote_hash DROP NOT NULL;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS voter_auth_sessions (
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
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE voter_auth_sessions
  ADD COLUMN IF NOT EXISTS biometric_attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE voter_auth_sessions
  ADD COLUMN IF NOT EXISTS last_biometric_attempt_at TIMESTAMP;
ALTER TABLE voter_auth_sessions
  ADD COLUMN IF NOT EXISTS biometric_locked_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL,
    constituency_id INTEGER NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);
CREATE INDEX IF NOT EXISTS idx_inec_voter_register_lga ON inec_voter_register(lga_id, constituency_id);
CREATE INDEX IF NOT EXISTS idx_votes_receipt ON votes(receipt_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_offline_vote_id ON votes(offline_vote_id, constituency_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_parties_code ON parties(code);
CREATE INDEX IF NOT EXISTS idx_voter_auth_sessions_voter ON voter_auth_sessions(voter_id, constituency_id);
CREATE INDEX IF NOT EXISTS idx_voter_auth_sessions_voting_token ON voter_auth_sessions(voting_token_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);

INSERT INTO election_officers (full_name, email, password_hash, role) VALUES
('INEC Demo Registration Officer', 'officer@inec.ondo.gov.ng', '$2b$10$KkG6lDg3kbmrtb4BU2YaruNSmi3SCmJtdl0soljhL1UangOvZBzAy', 'registration_officer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO election_admins (full_name, email, password_hash, role) VALUES
('INEC Demo State Administrator', 'admin@inec.ondo.gov.ng', '$2b$12$WZAFoaJKOpDry5yQNMk7Ver68Vfug7TgE8cVUoPTVvPaY4vJZBglm', 'state_admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO inec_voter_register (vin, full_name, lga_id, constituency_id, status) VALUES
('MOCKVIN001', 'Mock Eligible Voter One', 1, 1, 'eligible'),
('MOCKVIN002', 'Mock Eligible Voter Two', 1, 1, 'eligible'),
('MOCKVIN003', 'Mock Eligible Voter Three', 2, 1, 'eligible')
ON CONFLICT (vin) DO NOTHING;

INSERT INTO elections (name, election_type, status) VALUES
('House of Representatives Elections 2027', 'house_of_representatives', 'draft')
ON CONFLICT (name) DO NOTHING;

INSERT INTO parties (name, code) VALUES
('All Progressives Congress', 'APC'),
('Peoples Democratic Party', 'PDP'),
('Zenith Labour Party', 'ZLP'),
('Social Democratic Party', 'SDP'),
('African Democratic Congress', 'ADC'),
('New Nigeria Peoples Party', 'NNPP'),
('Action Alliance', 'AA'),
('All Progressives Grand Alliance', 'APGA'),
('Young Progressives Party', 'YPP'),
('Action Peoples Party', 'APP'),
('African Action Congress', 'AAC')
ON CONFLICT (code) DO NOTHING;
