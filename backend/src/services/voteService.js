const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { encryptJson } = require("../utils/encryption");
const { createReceiptCode, hashVotePayload } = require("../utils/hashing");
const {
  getElectionForOfflineSync,
  getOpenElection,
} = require("./electionLifecycle");

/**
 * Signs an offline voting token tied to one voter, one constituency, one election, and one device.
 */
function signOfflineVotingToken({ voter, election, authMethod, deviceId, tokenId }) {
  const syncGraceMs = 24 * 60 * 60 * 1000;
  const expiresInSeconds = Math.max(
    60,
    Math.floor(
      ((election.ends_at
        ? new Date(election.ends_at).getTime() + syncGraceMs
        : Date.now() + 30 * 60_000) -
        Date.now()) /
        1000,
    ),
  );

  return jwt.sign(
    {
      type: "offline_vote",
      voterId: voter.voterId,
      constituencyId: voter.constituencyId,
      electionId: election.id,
      authMethod,
      deviceId,
      tokenId,
    },
    process.env.JWT_SECRET,
    { expiresIn: expiresInSeconds },
  );
}

/**
 * Verifies the signed offline voting token submitted during queued vote sync.
 */
function verifyOfflineVotingToken(offlineToken) {
  const payload = jwt.verify(offlineToken, process.env.JWT_SECRET);

  if (payload.type !== "offline_vote") {
    throw new Error("Invalid offline voting token scope");
  }

  return payload;
}

/**
 * Checks whether a client-side cast timestamp fits inside the election window.
 */
function validateClientCastTime(election, clientCastAt) {
  if (!clientCastAt) {
    return;
  }

  const castTime = new Date(clientCastAt).getTime();

  if (Number.isNaN(castTime)) {
    throw new Error("Invalid client cast timestamp");
  }

  if (election.starts_at && castTime < new Date(election.starts_at).getTime()) {
    throw new Error("Offline vote was cast before the election opened");
  }

  if (election.ends_at && castTime > new Date(election.ends_at).getTime()) {
    throw new Error("Offline vote was cast after the election closed");
  }
}

/**
 * Records a vote inside an existing transaction for both online and offline paths.
 */
async function recordVote(
  client,
  {
    voterId,
    constituencyId,
    authMethod,
    tokenId,
    candidateId,
    deviceId,
    offlineVoteId = null,
    clientCastAt = null,
    syncSource = "online",
  },
) {
  if (offlineVoteId) {
    const existingOfflineVote = await client.query(
      `SELECT receipt_code, integrity_hash
       FROM votes
       WHERE offline_vote_id = $1 AND constituency_id = $2
       LIMIT 1`,
      [offlineVoteId, constituencyId],
    );

    if (existingOfflineVote.rows.length > 0) {
      return {
        accepted: false,
        duplicate: true,
        receiptCode: existingOfflineVote.rows[0].receipt_code,
        integrityHash: existingOfflineVote.rows[0].integrity_hash,
      };
    }
  }

  // Lock the voter row so two vote submissions cannot pass the has_voted check together.
  const voterCheck = await client.query(
    `SELECT has_voted, status
     FROM voters
     WHERE id = $1 AND constituency_id = $2
     FOR UPDATE`,
    [voterId, constituencyId],
  );

  if (voterCheck.rows.length === 0 || voterCheck.rows[0].status !== "registered") {
    return { accepted: false, statusCode: 403, error: "Voter account is not active" };
  }

  if (voterCheck.rows[0].has_voted) {
    return { accepted: false, statusCode: 403, error: "You have already voted" };
  }

  // Constituency isolation: voters can only select candidates from their own constituency.
  const candidateCheck = await client.query(
    "SELECT id FROM candidates WHERE id = $1 AND constituency_id = $2",
    [candidateId, constituencyId],
  );

  if (candidateCheck.rows.length === 0) {
    return {
      accepted: false,
      statusCode: 403,
      error: "Invalid candidate: Candidate does not belong to your constituency",
    };
  }

  const timestamp = new Date().toISOString();
  const votePayload = {
    voterId,
    candidateId,
    constituencyId,
    timestamp,
    deviceId: deviceId || null,
    offlineVoteId,
    syncSource,
  };
  const encryptedPayload = encryptJson(votePayload);
  const integrityHash = hashVotePayload(votePayload);
  const receiptCode = createReceiptCode(
    voterId,
    candidateId,
    constituencyId,
    timestamp,
  );

  // Store only the encrypted vote payload plus integrity/receipt metadata.
  await client.query(
    `INSERT INTO votes
      (voter_id, candidate_id, constituency_id, encrypted_payload,
       integrity_hash, receipt_code, biometric_method, device_id, token_id,
       offline_vote_id, sync_source, client_cast_at, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      voterId,
      candidateId,
      constituencyId,
      encryptedPayload,
      integrityHash,
      receiptCode,
      authMethod,
      deviceId || null,
      tokenId,
      offlineVoteId,
      syncSource,
      clientCastAt || null,
      timestamp,
    ],
  );

  // Mark the voter as used so the same account cannot vote again.
  await client.query(
    "UPDATE voters SET has_voted = TRUE WHERE id = $1 AND constituency_id = $2",
    [voterId, constituencyId],
  );

  // Immediately invalidate the JWT/offline session after a successful vote.
  await client.query(
    `UPDATE voter_auth_sessions
     SET voting_token_invalidated_at = NOW()
     WHERE voting_token_id = $1 AND voter_id = $2 AND constituency_id = $3`,
    [tokenId, voterId, constituencyId],
  );

  // Increment the public aggregate result without exposing the encrypted ballot content.
  await client.query(
    `INSERT INTO results (constituency_id, candidate_id, vote_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (constituency_id, candidate_id)
     DO UPDATE SET vote_count = results.vote_count + 1, last_updated = NOW()`,
    [constituencyId, candidateId],
  );

  return {
    accepted: true,
    duplicate: false,
    receiptCode,
    integrityHash,
  };
}

/**
 * Issues the ballot and signed offline token needed for local queued voting.
 */
async function getOfflineVotingPackage(req, res) {
  try {
    const { constituencyId } = req.params;
    const { deviceId } = req.query;

    if (parseInt(constituencyId, 10) !== req.user.constituencyId) {
      return res.status(403).json({
        error: "Access denied: You can only download your own constituency package",
      });
    }

    const election = await getOpenElection();

    if (!election) {
      return res.status(403).json({
        error: "No election is currently open for offline package download",
      });
    }

    const candidateResult = await pool.query(
      `SELECT id, name, party, photo_url
       FROM candidates
       WHERE constituency_id = $1
       ORDER BY party, name`,
      [constituencyId],
    );

    const offlineToken = signOfflineVotingToken({
      voter: req.user,
      election,
      authMethod: req.user.authMethod,
      deviceId: deviceId || null,
      tokenId: req.user.tokenId,
    });

    res.json({
      success: true,
      packageId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      expiresAt: election.ends_at,
      election: {
        id: election.id,
        name: election.name,
        status: election.status,
      },
      constituencyId: parseInt(constituencyId, 10),
      offlineToken,
      candidates: candidateResult.rows,
    });
  } catch (error) {
    console.error("Offline package error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Records one encrypted vote, updates aggregate results, and invalidates the voting token.
 */
async function castVote(req, res) {
  const client = await pool.connect();

  try {
    const { candidateId, deviceId } = req.body;
    const { voterId, constituencyId, authMethod, tokenId } = req.user;

    if (!candidateId) {
      return res.status(400).json({ error: "Candidate ID is required" });
    }

    await client.query("BEGIN");

    const election = await getOpenElection(client);

    if (!election) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "No election is currently open for voting",
      });
    }

    const recordedVote = await recordVote(client, {
      voterId,
      candidateId,
      constituencyId,
      authMethod,
      tokenId,
      deviceId,
    });

    if (!recordedVote.accepted) {
      await client.query("ROLLBACK");
      return res.status(recordedVote.statusCode).json({ error: recordedVote.error });
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Vote recorded successfully",
      receiptCode: recordedVote.receiptCode,
      integrityHash: recordedVote.integrityHash,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Vote submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

/**
 * Accepts queued offline votes and reconciles them into the normal encrypted vote store.
 */
async function syncOfflineVotes(req, res) {
  const client = await pool.connect();

  try {
    const { offlineToken, votes = [] } = req.body;

    if (!offlineToken || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({
        error: "Offline token and at least one queued vote are required",
      });
    }

    const offlineSession = verifyOfflineVotingToken(offlineToken);
    const election = await getElectionForOfflineSync(offlineSession.electionId, client);

    if (!election) {
      return res.status(403).json({
        error: "Election is not accepting offline sync submissions",
      });
    }

    const synced = [];

    for (const queuedVote of votes) {
      const offlineVoteId = queuedVote.offlineVoteId || crypto.randomUUID();

      try {
        if (!queuedVote.clientCastAt) {
          throw new Error("Offline vote client cast timestamp is required");
        }

        validateClientCastTime(election, queuedVote.clientCastAt);

        await client.query("BEGIN");

        const recordedVote = await recordVote(client, {
          voterId: offlineSession.voterId,
          constituencyId: offlineSession.constituencyId,
          authMethod: offlineSession.authMethod,
          tokenId: offlineSession.tokenId,
          candidateId: queuedVote.candidateId,
          deviceId: queuedVote.deviceId || offlineSession.deviceId || null,
          offlineVoteId,
          clientCastAt: queuedVote.clientCastAt || null,
          syncSource: "offline_sync",
        });

        if (!recordedVote.accepted && !recordedVote.duplicate) {
          await client.query("ROLLBACK");
          synced.push({
            offlineVoteId,
            status: "rejected",
            error: recordedVote.error,
          });
          continue;
        }

        await client.query("COMMIT");
        synced.push({
          offlineVoteId,
          status: recordedVote.duplicate ? "duplicate" : "accepted",
          receiptCode: recordedVote.receiptCode,
          integrityHash: recordedVote.integrityHash,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        synced.push({
          offlineVoteId,
          status: "rejected",
          error: error.message || "Offline vote rejected",
        });
      }
    }

    res.json({
      success: true,
      electionId: offlineSession.electionId,
      constituencyId: offlineSession.constituencyId,
      synced,
    });
  } catch (error) {
    console.error("Offline vote sync error:", error);
    res.status(401).json({ error: error.message || "Offline sync failed" });
  } finally {
    client.release();
  }
}

/**
 * Returns aggregated vote counts for a constituency.
 */
async function getConstituencyResults(req, res) {
  try {
    const { constituencyId } = req.params;

    const result = await pool.query(
      `SELECT c.name, c.party, r.vote_count
       FROM results r
       JOIN candidates c ON r.candidate_id = c.id AND c.constituency_id = r.constituency_id
       WHERE r.constituency_id = $1
       ORDER BY r.vote_count DESC`,
      [constituencyId],
    );

    res.json({
      success: true,
      constituencyId: parseInt(constituencyId, 10),
      results: result.rows,
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  castVote,
  getConstituencyResults,
  getOfflineVotingPackage,
  syncOfflineVotes,
};
