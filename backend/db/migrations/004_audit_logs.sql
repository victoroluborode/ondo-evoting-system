-- Table 14: Audit logs for critical actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type VARCHAR(20) NOT NULL,      -- 'admin' | 'officer' | 'system'
    actor_id UUID,                         -- election_admins.id or election_officers.id, nullable for system events
    actor_label VARCHAR(100),              -- denormalized display name/code, survives actor deletion
    action VARCHAR(100) NOT NULL,          -- e.g. 'election.opened', 'candidate.created', 'voter.registered'
    target_summary VARCHAR(255),           -- human-readable description, e.g. "House of Reps 2027" or "VIN001001"
    metadata JSONB,                        -- optional structured detail (election id, constituency id, etc.)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);