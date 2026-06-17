const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { ACTIVE_ELECTION_TYPE } = require("./electionLifecycle");

const ELECTION_STATUSES = new Set(["draft", "open", "closed", "published"]);
const ELECTION_TRANSITIONS = {
  draft: new Set(["open"]),
  open: new Set(["closed"]),
  closed: new Set(["published"]),
  published: new Set([]),
};

/**
 * Builds a typed lifecycle error that can be returned as a controlled API response.
 */
function lifecycleError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Validates that election dates are chronologically correct when both are provided.
 */
function validateElectionDateRange(startsAt, endsAt) {
  if (!startsAt || !endsAt) {
    return;
  }

  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw lifecycleError("Election end time must be after start time");
  }
}

/**
 * Ensures election status changes follow draft -> open -> closed -> published.
 */
function validateElectionTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!ELECTION_TRANSITIONS[currentStatus]?.has(nextStatus)) {
    throw lifecycleError(
      `Invalid election transition from ${currentStatus} to ${nextStatus}`,
      409,
    );
  }
}

/**
 * Checks that an election is ready to open across all constituencies.
 */
async function validateCanOpenElection(client, election) {
  if (election.election_type !== ACTIVE_ELECTION_TYPE) {
    return;
  }

  const now = Date.now();

  if (election.starts_at && new Date(election.starts_at).getTime() > now) {
    throw lifecycleError("Election start time is still in the future", 409);
  }

  if (election.ends_at && new Date(election.ends_at).getTime() <= now) {
    throw lifecycleError("Election end time has already passed", 409);
  }

  const openElection = await client.query(
    `SELECT id
     FROM elections
     WHERE election_type = $1 AND status = 'open' AND id <> $2
     LIMIT 1`,
    [election.election_type, election.id],
  );

  if (openElection.rows.length > 0) {
    throw lifecycleError("Another election of this type is already open", 409);
  }

  const readiness = await client.query(
    `SELECT
       (SELECT COUNT(*) FROM constituencies) AS total_constituencies,
       COUNT(DISTINCT constituency_id) AS constituencies_with_candidates
     FROM candidates`,
  );
  const row = readiness.rows[0];

  if (
    Number(row.constituencies_with_candidates) < Number(row.total_constituencies)
  ) {
    throw lifecycleError(
      "Election cannot open until every constituency has at least one candidate",
      409,
    );
  }
}

/**
 * Blocks candidate changes while a House election is already open.
 */
async function ensureNoOpenElectionForCandidateChanges() {
  const result = await pool.query(
    `SELECT id
     FROM elections
     WHERE election_type = $1 AND status = 'open'
     LIMIT 1`,
    [ACTIVE_ELECTION_TYPE],
  );

  if (result.rows.length > 0) {
    throw lifecycleError(
      "Candidates cannot be changed while an election is open",
      409,
    );
  }
}

/**
 * Normalizes party and election codes so storage stays consistent.
 */
function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

/**
 * Converts a candidate database row into the API response shape.
 */
function toCandidate(row) {
  return {
    id: row.id,
    name: row.name,
    party: row.party,
    constituencyId: Number(row.constituency_id),
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

/**
 * Converts an election database row into the API response shape.
 */
function toElection(row) {
  return {
    id: row.id,
    name: row.name,
    electionType: row.election_type,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Applies a controlled lifecycle transition and returns the updated election.
 */
async function transitionElectionStatus(electionId, nextStatus) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      "SELECT * FROM elections WHERE id = $1 FOR UPDATE",
      [electionId],
    );

    if (currentResult.rows.length === 0) {
      throw lifecycleError("Election not found", 404);
    }

    const election = currentResult.rows[0];
    validateElectionTransition(election.status, nextStatus);

    if (nextStatus === "open") {
      await validateCanOpenElection(client, election);
    }

    const updateResult = await client.query(
      `UPDATE elections
       SET status = $1::election_status,
           starts_at = CASE
             WHEN $1 = 'open' THEN COALESCE(starts_at, NOW())
             ELSE starts_at
           END,
           ends_at = CASE
             WHEN $1 = 'closed' THEN NOW()
             ELSE ends_at
           END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [nextStatus, electionId],
    );

    await client.query("COMMIT");
    return toElection(updateResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Converts an officer database row into the API response shape without password fields.
 */
function toOfficer(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * Converts a party database row into the API response shape.
 */
function toParty(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    logoUrl: row.logo_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Converts a constituency row into the API response shape.
 */
function toConstituency(row) {
  return {
    id: Number(row.id),
    name: row.name,
    code: row.code,
    lgas: row.lgas || undefined,
  };
}

/**
 * Converts an LGA row into the API response shape.
 */
function toLga(row) {
  return {
    id: Number(row.id),
    name: row.name,
    constituencyId: Number(row.constituency_id),
    constituencyName: row.constituency_name,
  };
}

/**
 * Authenticates a senior election admin and returns an admin-scoped JWT.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role FROM election_admins WHERE email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const admin = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        type: "admin",
        adminId: admin.id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Lists all constituencies with their current LGA mappings.
 */
async function listConstituencies(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.code,
              COALESCE(
                json_agg(
                  json_build_object('id', l.id, 'name', l.name)
                  ORDER BY l.name
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'
              ) AS lgas
       FROM constituencies c
       LEFT JOIN local_government_areas l ON l.constituency_id = c.id
       GROUP BY c.id
       ORDER BY c.id`,
    );

    res.json({
      success: true,
      constituencies: result.rows.map(toConstituency),
    });
  } catch (error) {
    console.error("Admin constituencies fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates constituency display metadata without changing the fixed 9-constituency structure.
 */
async function updateConstituency(req, res) {
  try {
    const { name, code } = req.body;

    const result = await pool.query(
      `UPDATE constituencies
       SET name = COALESCE($1, name),
           code = COALESCE($2, code)
       WHERE id = $3
       RETURNING id, name, code`,
      [name || null, code ? normalizeCode(code) : null, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Constituency not found" });
    }

    res.json({ success: true, constituency: toConstituency(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Constituency name or code already exists" });
    }

    console.error("Admin constituency update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Lists LGAs, optionally filtered by constituency.
 */
async function listLgas(req, res) {
  try {
    const { constituencyId } = req.query;
    const result = await pool.query(
      `SELECT l.id,
              l.name,
              l.constituency_id,
              c.name AS constituency_name
       FROM local_government_areas l
       JOIN constituencies c ON c.id = l.constituency_id
       WHERE ($1::int IS NULL OR l.constituency_id = $1)
       ORDER BY l.constituency_id, l.name`,
      [constituencyId || null],
    );

    res.json({ success: true, lgas: result.rows.map(toLga) });
  } catch (error) {
    console.error("Admin LGA fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates a new LGA under an existing constituency.
 */
async function createLga(req, res) {
  try {
    const { name, constituencyId } = req.body;

    if (!name || !constituencyId) {
      return res.status(400).json({ error: "LGA name and constituency are required" });
    }

    const result = await pool.query(
      `INSERT INTO local_government_areas (name, constituency_id)
       VALUES ($1, $2)
       RETURNING id, name, constituency_id`,
      [name, constituencyId],
    );

    res.status(201).json({ success: true, lga: toLga(result.rows[0]) });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "Invalid constituency" });
    }

    console.error("Admin LGA create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates an LGA name or remaps it to another constituency when it is not already in use.
 */
async function updateLga(req, res) {
  const client = await pool.connect();

  try {
    const { name, constituencyId } = req.body;

    await client.query("BEGIN");

    if (constituencyId !== undefined) {
      const refs = await client.query(
        `SELECT
           (SELECT COUNT(*) FROM voters WHERE lga_id = $1) AS voter_count,
           (SELECT COUNT(*) FROM inec_voter_register WHERE lga_id = $1) AS register_count`,
        [req.params.id],
      );
      const row = refs.rows[0];

      if (Number(row.voter_count) > 0 || Number(row.register_count) > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "LGA with registered voter records cannot be remapped",
        });
      }
    }

    const result = await client.query(
      `UPDATE local_government_areas
       SET name = COALESCE($1, name),
           constituency_id = COALESCE($2, constituency_id)
       WHERE id = $3
       RETURNING id, name, constituency_id`,
      [name || null, constituencyId || null, req.params.id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "LGA not found" });
    }

    await client.query("COMMIT");
    res.json({ success: true, lga: toLga(result.rows[0]) });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23503") {
      return res.status(400).json({ error: "Invalid constituency" });
    }

    console.error("Admin LGA update error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Deletes an unused LGA while protecting voter and mock INEC register records.
 */
async function deleteLga(req, res) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const refs = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM voters WHERE lga_id = $1) AS voter_count,
         (SELECT COUNT(*) FROM inec_voter_register WHERE lga_id = $1) AS register_count`,
      [req.params.id],
    );
    const row = refs.rows[0];

    if (Number(row.voter_count) > 0 || Number(row.register_count) > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "LGA with voter records cannot be deleted",
      });
    }

    const result = await client.query(
      "DELETE FROM local_government_areas WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "LGA not found" });
    }

    await client.query("COMMIT");
    res.json({ success: true, deletedId: Number(result.rows[0].id) });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin LGA delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Builds the state-wide admin summary and turnout per constituency.
 */
async function getDashboard(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.code,
              COUNT(DISTINCT v.id) AS registered_voters,
              COUNT(DISTINCT votes.voter_id) AS votes_cast,
              CASE
                WHEN COUNT(DISTINCT v.id) = 0 THEN 0
                ELSE ROUND((COUNT(DISTINCT votes.voter_id)::numeric / COUNT(DISTINCT v.id)::numeric) * 100, 2)
              END AS turnout_percentage
       FROM constituencies c
       LEFT JOIN voters v ON v.constituency_id = c.id
       LEFT JOIN votes ON votes.constituency_id = c.id
       GROUP BY c.id
       ORDER BY c.id`,
    );

    const totals = result.rows.reduce(
      (summary, row) => ({
        registeredVoters: summary.registeredVoters + Number(row.registered_voters),
        votesCast: summary.votesCast + Number(row.votes_cast),
      }),
      { registeredVoters: 0, votesCast: 0 },
    );

    res.json({
      success: true,
      summary: {
        ...totals,
        turnoutPercentage:
          totals.registeredVoters === 0
            ? 0
            : Number(((totals.votesCast / totals.registeredVoters) * 100).toFixed(2)),
      },
      constituencies: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        registeredVoters: Number(row.registered_voters),
        votesCast: Number(row.votes_cast),
        turnoutPercentage: Number(row.turnout_percentage),
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Returns aggregated candidate results for one constituency.
 */
async function getResults(req, res) {
  try {
    const { constituencyId } = req.params;

    const result = await pool.query(
      `SELECT c.id,
              c.name,
              c.party,
              COALESCE(r.vote_count, 0) AS vote_count
       FROM candidates c
       LEFT JOIN results r
         ON r.candidate_id = c.id AND r.constituency_id = c.constituency_id
       WHERE c.constituency_id = $1
       ORDER BY COALESCE(r.vote_count, 0) DESC, c.party, c.name`,
      [constituencyId],
    );

    res.json({
      success: true,
      constituencyId: Number(constituencyId),
      results: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        party: row.party,
        voteCount: Number(row.vote_count),
      })),
    });
  } catch (error) {
    console.error("Admin results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Lists elections so admins can see setup and lifecycle status.
 */
async function listElections(req, res) {
  try {
    const result = await pool.query("SELECT * FROM elections ORDER BY created_at DESC");
    res.json({ success: true, elections: result.rows.map(toElection) });
  } catch (error) {
    console.error("Admin elections fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates an election record with optional start/end times and lifecycle status.
 */
async function createElection(req, res) {
  try {
    const {
      name,
      electionType = "house_of_representatives",
      status = "draft",
      startsAt,
      endsAt,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Election name is required" });
    }

    if (!ELECTION_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid election status" });
    }

    if (status !== "draft") {
      return res.status(400).json({
        error: "Elections must be created as draft before they can be opened",
      });
    }

    validateElectionDateRange(startsAt, endsAt);

    const result = await pool.query(
      `INSERT INTO elections
        (name, election_type, status, starts_at, ends_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        electionType,
        status,
        startsAt || null,
        endsAt || null,
        req.user.adminId,
      ],
    );

    res.status(201).json({ success: true, election: toElection(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Election already exists" });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin election create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates election metadata or lifecycle status.
 */
async function updateElection(req, res) {
  const client = await pool.connect();

  try {
    const { name, electionType, status, startsAt, endsAt } = req.body;
    const hasMetadataUpdate =
      name !== undefined ||
      electionType !== undefined ||
      startsAt !== undefined ||
      endsAt !== undefined;

    if (status && !ELECTION_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid election status" });
    }

    await client.query("BEGIN");

    const currentResult = await client.query(
      "SELECT * FROM elections WHERE id = $1 FOR UPDATE",
      [req.params.id],
    );

    if (currentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Election not found" });
    }

    const current = currentResult.rows[0];

    if (hasMetadataUpdate && current.status !== "draft") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Election metadata can only be changed while the election is in draft",
      });
    }

    validateElectionDateRange(
      startsAt === undefined ? current.starts_at : startsAt,
      endsAt === undefined ? current.ends_at : endsAt,
    );

    const metadataResult = await client.query(
      `UPDATE elections
       SET name = COALESCE($1, name),
           election_type = COALESCE($2, election_type),
           starts_at = COALESCE($3, starts_at),
           ends_at = COALESCE($4, ends_at),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        name || null,
        electionType || null,
        startsAt || null,
        endsAt || null,
        req.params.id,
      ],
    );

    let election = metadataResult.rows[0];

    if (status && status !== election.status) {
      validateElectionTransition(election.status, status);

      if (status === "open") {
        await validateCanOpenElection(client, election);
      }

      const statusResult = await client.query(
        `UPDATE elections
         SET status = $1::election_status,
             starts_at = CASE
               WHEN $1 = 'open' THEN COALESCE(starts_at, NOW())
               ELSE starts_at
             END,
             ends_at = CASE
               WHEN $1 = 'closed' THEN NOW()
               ELSE ends_at
             END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, req.params.id],
      );
      election = statusResult.rows[0];
    }

    await client.query("COMMIT");

    res.json({ success: true, election: toElection(election) });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({ error: "Election already exists" });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin election update error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Opens a draft election after validating candidate coverage and active-election rules.
 */
async function openElection(req, res) {
  try {
    const election = await transitionElectionStatus(req.params.id, "open");
    res.json({ success: true, election });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin election open error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Closes an open election so no further ballots or votes are accepted.
 */
async function closeElection(req, res) {
  try {
    const election = await transitionElectionStatus(req.params.id, "closed");
    res.json({ success: true, election });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin election close error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Publishes a closed election's results as the final official result state.
 */
async function publishElection(req, res) {
  try {
    const election = await transitionElectionStatus(req.params.id, "published");
    res.json({ success: true, election });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin election publish error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Deletes only draft elections so live or completed elections remain protected.
 */
async function deleteElection(req, res) {
  try {
    const result = await pool.query(
      "DELETE FROM elections WHERE id = $1 AND status = 'draft' RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Draft election not found or election cannot be deleted",
      });
    }

    res.json({ success: true, deletedId: result.rows[0].id });
  } catch (error) {
    console.error("Admin election delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Lists political parties available for candidate assignment.
 */
async function listParties(req, res) {
  try {
    const result = await pool.query("SELECT * FROM parties ORDER BY code");
    res.json({ success: true, parties: result.rows.map(toParty) });
  } catch (error) {
    console.error("Admin parties fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates a political party using a normalized unique party code.
 */
async function createParty(req, res) {
  try {
    const { name, code, logoUrl } = req.body;
    const partyCode = normalizeCode(code);

    if (!name || !partyCode) {
      return res.status(400).json({ error: "Party name and code are required" });
    }

    const result = await pool.query(
      `INSERT INTO parties (name, code, logo_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, partyCode, logoUrl || null],
    );

    res.status(201).json({ success: true, party: toParty(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Party already exists" });
    }

    console.error("Admin party create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates party details, logo, code, or active/inactive status.
 */
async function updateParty(req, res) {
  try {
    const { name, code, logoUrl, status } = req.body;
    const partyCode = code ? normalizeCode(code) : null;

    const result = await pool.query(
      `UPDATE parties
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           logo_url = COALESCE($3, logo_url),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name || null, partyCode, logoUrl || null, status || null, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.json({ success: true, party: toParty(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Party already exists" });
    }

    console.error("Admin party update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Deletes a party only when no candidate currently depends on it.
 */
async function deleteParty(req, res) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const partyResult = await client.query(
      "SELECT id, code FROM parties WHERE id = $1 FOR UPDATE",
      [req.params.id],
    );

    if (partyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Party not found" });
    }

    const candidateResult = await client.query(
      "SELECT 1 FROM candidates WHERE party = $1 LIMIT 1",
      [partyResult.rows[0].code],
    );

    if (candidateResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Party has assigned candidates and cannot be deleted",
      });
    }

    await client.query("DELETE FROM parties WHERE id = $1", [req.params.id]);
    await client.query("COMMIT");

    res.json({ success: true, deletedId: partyResult.rows[0].id });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin party delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Lists candidates, optionally filtered to one constituency.
 */
async function listCandidates(req, res) {
  try {
    const { constituencyId } = req.query;
    const result = await pool.query(
      `SELECT *
       FROM candidates
       WHERE ($1::int IS NULL OR constituency_id = $1)
       ORDER BY constituency_id, party, name`,
      [constituencyId || null],
    );

    res.json({ success: true, candidates: result.rows.map(toCandidate) });
  } catch (error) {
    console.error("Admin candidates fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates a candidate under an active party and valid constituency.
 */
async function createCandidate(req, res) {
  try {
    const { name, party, constituencyId, photoUrl } = req.body;
    const partyCode = normalizeCode(party);

    if (!name || !partyCode || !constituencyId) {
      return res.status(400).json({
        error: "Candidate name, party, and constituency are required",
      });
    }

    await ensureNoOpenElectionForCandidateChanges();

    const partyResult = await pool.query(
      "SELECT code FROM parties WHERE code = $1 AND status = 'active'",
      [partyCode],
    );

    if (partyResult.rows.length === 0) {
      return res.status(400).json({ error: "Party does not exist or is inactive" });
    }

    const result = await pool.query(
      `INSERT INTO candidates (name, party, constituency_id, photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, partyCode, constituencyId, photoUrl || null],
    );

    res.status(201).json({ success: true, candidate: toCandidate(result.rows[0]) });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error.code === "23503") {
      return res.status(400).json({ error: "Invalid constituency" });
    }

    console.error("Admin candidate create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates candidate details while preserving constituency isolation.
 */
async function updateCandidate(req, res) {
  try {
    const { name, party, photoUrl } = req.body;
    const partyCode = party ? normalizeCode(party) : null;

    await ensureNoOpenElectionForCandidateChanges();

    if (partyCode) {
      const partyResult = await pool.query(
        "SELECT code FROM parties WHERE code = $1 AND status = 'active'",
        [partyCode],
      );

      if (partyResult.rows.length === 0) {
        return res.status(400).json({ error: "Party does not exist or is inactive" });
      }
    }

    const result = await pool.query(
      `UPDATE candidates
       SET name = COALESCE($1, name),
           party = COALESCE($2, party),
           photo_url = COALESCE($3, photo_url)
       WHERE id = $4 AND constituency_id = $5
       RETURNING *`,
      [
        name || null,
        partyCode,
        photoUrl || null,
        req.params.candidateId,
        req.params.constituencyId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ success: true, candidate: toCandidate(result.rows[0]) });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin candidate update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Deletes a candidate only if no recorded vote references that candidate.
 */
async function deleteCandidate(req, res) {
  try {
    await ensureNoOpenElectionForCandidateChanges();

    const voteResult = await pool.query(
      `SELECT 1
       FROM votes
       WHERE candidate_id = $1 AND constituency_id = $2
       LIMIT 1`,
      [req.params.candidateId, req.params.constituencyId],
    );

    if (voteResult.rows.length > 0) {
      return res.status(409).json({
        error: "Candidate has votes and cannot be deleted",
      });
    }

    const result = await pool.query(
      `DELETE FROM candidates
       WHERE id = $1 AND constituency_id = $2
       RETURNING id, constituency_id`,
      [req.params.candidateId, req.params.constituencyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      success: true,
      deletedId: result.rows[0].id,
      constituencyId: Number(result.rows[0].constituency_id),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin candidate delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Lists INEC registration officers for admin management.
 */
async function listOfficers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, status, created_at
       FROM election_officers
       ORDER BY created_at DESC`,
    );

    res.json({ success: true, officers: result.rows.map(toOfficer) });
  } catch (error) {
    console.error("Admin officers fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Creates an INEC officer account with a bcrypt-hashed password.
 */
async function createOfficer(req, res) {
  try {
    const { fullName, email, password, role = "registration_officer" } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "Full name, email, and password are required",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO election_officers (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, status, created_at`,
      [fullName, String(email).toLowerCase(), passwordHash, role],
    );

    res.status(201).json({ success: true, officer: toOfficer(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Officer email already exists" });
    }

    console.error("Admin officer create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates officer profile, role, status, or password.
 */
async function updateOfficer(req, res) {
  try {
    const { fullName, email, password, role, status } = req.body;
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    const result = await pool.query(
      `UPDATE election_officers
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           password_hash = COALESCE($3, password_hash),
           role = COALESCE($4, role),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING id, full_name, email, role, status, created_at`,
      [
        fullName || null,
        email ? String(email).toLowerCase() : null,
        passwordHash,
        role || null,
        status || null,
        req.params.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Officer not found" });
    }

    res.json({ success: true, officer: toOfficer(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Officer email already exists" });
    }

    console.error("Admin officer update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Soft-disables an officer so old registration records remain traceable.
 */
async function disableOfficer(req, res) {
  try {
    const result = await pool.query(
      `UPDATE election_officers
       SET status = 'disabled'
       WHERE id = $1
       RETURNING id, full_name, email, role, status, created_at`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Officer not found" });
    }

    res.json({ success: true, officer: toOfficer(result.rows[0]) });
  } catch (error) {
    console.error("Admin officer disable error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createCandidate,
  createElection,
  createLga,
  createOfficer,
  createParty,
  deleteCandidate,
  deleteElection,
  deleteLga,
  deleteParty,
  disableOfficer,
  getDashboard,
  getResults,
  listCandidates,
  listConstituencies,
  listElections,
  listLgas,
  listOfficers,
  listParties,
  login,
  closeElection,
  openElection,
  publishElection,
  updateCandidate,
  updateConstituency,
  updateElection,
  updateLga,
  updateOfficer,
  updateParty,
};
