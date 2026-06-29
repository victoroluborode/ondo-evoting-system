ALTER TABLE election_officers
ADD COLUMN IF NOT EXISTS officer_code VARCHAR(40);

ALTER TABLE election_admins
ADD COLUMN IF NOT EXISTS admin_code VARCHAR(40);

CREATE UNIQUE INDEX IF NOT EXISTS idx_election_officers_code
ON election_officers(officer_code);

CREATE UNIQUE INDEX IF NOT EXISTS idx_election_admins_code
ON election_admins(admin_code);

UPDATE election_officers
SET officer_code = 'OFF-1002'
WHERE email = 'officer@inec.ondo.gov.ng'
  AND officer_code IS NULL;

UPDATE election_admins
SET admin_code = 'ADM-ONDO-001'
WHERE email = 'admin@inec.ondo.gov.ng'
  AND admin_code IS NULL;
