const pool = require("../config/database");

async function resolveActorLabel(actorType, actorId) {
  if (!actorId) return null;

  try {
    if (actorType === "admin") {
      const result = await pool.query(
        "SELECT admin_code FROM election_admins WHERE id = $1",
        [actorId],
      );
      return result.rows[0]?.admin_code || null;
    }

    if (actorType === "officer") {
      const result = await pool.query(
        "SELECT officer_code FROM election_officers WHERE id = $1",
        [actorId],
      );
      return result.rows[0]?.officer_code || null;
    }

    if (actorType === "voter") {
      // Voters are partitioned by constituency_id, so we need it to find the row.
      // Callers should pass constituencyId in metadata when available.
      return null; // resolved per-call instead; see voter call sites below
    }
  } catch (error) {
    console.error("Audit actor label resolution failed:", error);
  }

  return null;
}

async function recordAuditLog({
  actorType,
  actorId,
  actorLabel,
  action,
  targetSummary,
  metadata = null,
}) {
  try {
    const resolvedLabel =
      actorLabel || (await resolveActorLabel(actorType, actorId));

    await pool.query(
      `INSERT INTO audit_logs (actor_type, actor_id, actor_label, action, target_summary, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        actorType,
        actorId || null,
        resolvedLabel,
        action,
        targetSummary || null,
        metadata,
      ],
    );
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

module.exports = { recordAuditLog };
