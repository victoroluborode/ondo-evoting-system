DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'biometric_method') THEN
    CREATE TYPE biometric_method AS ENUM ('fingerprint', 'face');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voter_status') THEN
    CREATE TYPE voter_status AS ENUM ('registered', 'suspended');
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

ALTER TABLE voters ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS fingerprint_template_encrypted TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS face_template_encrypted TEXT;
ALTER TABLE voters ADD COLUMN IF NOT EXISTS offline_auth_hash VARCHAR(64);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS status voter_status DEFAULT 'registered';
ALTER TABLE voters ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES election_officers(id);

ALTER TABLE votes ADD COLUMN IF NOT EXISTS encrypted_payload TEXT;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS integrity_hash VARCHAR(64);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS receipt_code VARCHAR(64);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS biometric_method biometric_method;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS device_id VARCHAR(120);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS token_id UUID;

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
    expires_at TIMESTAMP NOT NULL,
    biometric_verified_at TIMESTAMP,
    voting_token_invalidated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_votes_receipt ON votes(receipt_code);
CREATE INDEX IF NOT EXISTS idx_voter_auth_sessions_voter ON voter_auth_sessions(voter_id, constituency_id);
CREATE INDEX IF NOT EXISTS idx_voter_auth_sessions_voting_token ON voter_auth_sessions(voting_token_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);

INSERT INTO election_officers (full_name, email, password_hash, role) VALUES
('INEC Demo Registration Officer', 'officer@inec.ondo.gov.ng', '$2b$10$KkG6lDg3kbmrtb4BU2YaruNSmi3SCmJtdl0soljhL1UangOvZBzAy', 'registration_officer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO election_admins (full_name, email, password_hash, role) VALUES
('INEC Demo State Administrator', 'admin@inec.ondo.gov.ng', '$2b$12$WZAFoaJKOpDry5yQNMk7Ver68Vfug7TgE8cVUoPTVvPaY4vJZBglm', 'state_admin')
ON CONFLICT (email) DO NOTHING;
