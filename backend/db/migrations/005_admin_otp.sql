-- migrations/005_admin_otp.sql

CREATE TABLE admin_otp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES election_admins(id),
    session_token_id UUID NOT NULL UNIQUE,
    otp_hash VARCHAR(64) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    locked_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_otp_sessions_token ON admin_otp_sessions(session_token_id);