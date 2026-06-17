const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const pool = require("../src/config/database");

function listen(appInstance) {
  return new Promise((resolve) => {
    const server = appInstance.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function request(baseUrl, path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function run() {
  const { server, baseUrl } = await listen(app);

  try {
    const migration = fs.readFileSync(
      path.join(__dirname, "../db/migrations/001_security_upgrade.sql"),
      "utf8",
    );
    await pool.query(migration);

    const health = await request(baseUrl, "/health");
    assert.equal(health.status, "ok");

    const ready = await request(baseUrl, "/ready");
    assert.equal(ready.status, "ready");

    const adminLogin = await request(baseUrl, "/api/admin/login", {
      method: "POST",
      body: {
        email: "admin@inec.ondo.gov.ng",
        password: "AdminPassword123!",
      },
    });
    assert.ok(adminLogin.token);

    const dashboard = await request(baseUrl, "/api/admin/dashboard", {
      token: adminLogin.token,
    });
    assert.equal(dashboard.constituencies.length, 9);

    const adminSuffix = String(Date.now()).slice(-9);

    const constituencies = await request(baseUrl, "/api/admin/constituencies", {
      token: adminLogin.token,
    });
    assert.equal(constituencies.constituencies.length, 9);
    assert.ok(constituencies.constituencies[0].lgas.length > 0);

    const constituency = constituencies.constituencies[0];
    const updatedConstituency = await request(
      baseUrl,
      `/api/admin/constituencies/${constituency.id}`,
      {
        method: "PATCH",
        token: adminLogin.token,
        body: { name: constituency.name, code: constituency.code },
      },
    );
    assert.equal(updatedConstituency.constituency.id, constituency.id);

    const lgas = await request(baseUrl, "/api/admin/lgas?constituencyId=1", {
      token: adminLogin.token,
    });
    assert.ok(lgas.lgas.length > 0);

    const createdLga = await request(baseUrl, "/api/admin/lgas", {
      method: "POST",
      token: adminLogin.token,
      body: {
        name: `Integration LGA ${adminSuffix}`,
        constituencyId: 9,
      },
    });
    assert.equal(createdLga.lga.constituencyId, 9);

    const remappedLga = await request(baseUrl, `/api/admin/lgas/${createdLga.lga.id}`, {
      method: "PATCH",
      token: adminLogin.token,
      body: {
        name: `Integration LGA Updated ${adminSuffix}`,
        constituencyId: 8,
      },
    });
    assert.equal(remappedLga.lga.constituencyId, 8);

    const deletedLga = await request(baseUrl, `/api/admin/lgas/${createdLga.lga.id}`, {
      method: "DELETE",
      token: adminLogin.token,
    });
    assert.equal(deletedLga.deletedId, createdLga.lga.id);

    await pool.query(
      `UPDATE elections
       SET status = 'closed',
           ends_at = COALESCE(ends_at, NOW()),
           updated_at = NOW()
       WHERE election_type = 'house_of_representatives' AND status = 'open'`,
    );

    const election = await request(baseUrl, "/api/admin/elections", {
      method: "POST",
      token: adminLogin.token,
      body: {
        name: `Integration Election ${adminSuffix}`,
        status: "draft",
      },
    });
    assert.equal(election.election.status, "draft");

    const deletedElection = await request(
      baseUrl,
      `/api/admin/elections/${election.election.id}`,
      {
        method: "DELETE",
        token: adminLogin.token,
      },
    );
    assert.equal(deletedElection.deletedId, election.election.id);

    const lifecycleElection = await request(baseUrl, "/api/admin/elections", {
      method: "POST",
      token: adminLogin.token,
      body: {
        name: `Lifecycle Election ${adminSuffix}`,
        status: "draft",
      },
    });
    assert.equal(lifecycleElection.election.status, "draft");

    const party = await request(baseUrl, "/api/admin/parties", {
      method: "POST",
      token: adminLogin.token,
      body: {
        name: `Integration Party ${adminSuffix}`,
        code: `IP${adminSuffix.slice(-4)}`,
      },
    });
    assert.ok(party.party.id);

    const candidate = await request(baseUrl, "/api/admin/candidates", {
      method: "POST",
      token: adminLogin.token,
      body: {
        name: `Integration Candidate ${adminSuffix}`,
        party: party.party.code,
        constituencyId: 9,
      },
    });
    assert.equal(candidate.candidate.constituencyId, 9);

    const updatedCandidate = await request(
      baseUrl,
      `/api/admin/candidates/${candidate.candidate.constituencyId}/${candidate.candidate.id}`,
      {
        method: "PATCH",
        token: adminLogin.token,
        body: { name: `Updated Candidate ${adminSuffix}` },
      },
    );
    assert.equal(updatedCandidate.candidate.name, `Updated Candidate ${adminSuffix}`);

    const officer = await request(baseUrl, "/api/admin/officers", {
      method: "POST",
      token: adminLogin.token,
      body: {
        fullName: `Integration Officer ${adminSuffix}`,
        email: `officer.${adminSuffix}@example.com`,
        password: "Password123!",
      },
    });
    assert.equal(officer.officer.status, "active");

    const disabledOfficer = await request(
      baseUrl,
      `/api/admin/officers/${officer.officer.id}`,
      {
        method: "DELETE",
        token: adminLogin.token,
      },
    );
    assert.equal(disabledOfficer.officer.status, "disabled");

    let disabledOfficerRejected = false;
    try {
      await request(baseUrl, "/api/auth/officers/login", {
        method: "POST",
        body: {
          email: officer.officer.email,
          password: "Password123!",
        },
      });
    } catch {
      disabledOfficerRejected = true;
    }
    assert.equal(disabledOfficerRejected, true);

    const deletedCandidate = await request(
      baseUrl,
      `/api/admin/candidates/${candidate.candidate.constituencyId}/${candidate.candidate.id}`,
      {
        method: "DELETE",
        token: adminLogin.token,
      },
    );
    assert.equal(Number(deletedCandidate.deletedId), candidate.candidate.id);

    const deletedParty = await request(baseUrl, `/api/admin/parties/${party.party.id}`, {
      method: "DELETE",
      token: adminLogin.token,
    });
    assert.equal(deletedParty.deletedId, party.party.id);

    const openedElection = await request(
      baseUrl,
      `/api/admin/elections/${lifecycleElection.election.id}/open`,
      {
        method: "POST",
        token: adminLogin.token,
      },
    );
    assert.equal(openedElection.election.status, "open");

    let invalidRollbackRejected = false;
    try {
      await request(baseUrl, `/api/admin/elections/${lifecycleElection.election.id}`, {
        method: "PATCH",
        token: adminLogin.token,
        body: { status: "draft" },
      });
    } catch {
      invalidRollbackRejected = true;
    }
    assert.equal(invalidRollbackRejected, true);

    const suffix = String(Date.now()).slice(-9);
    const voterEmail = `test.${suffix}@example.com`;
    const fingerprint = `fingerprint-${suffix}`;
    const voterVin = `VT${suffix}`;

    const officerLogin = await request(baseUrl, "/api/auth/officers/login", {
      method: "POST",
      body: {
        email: "officer@inec.ondo.gov.ng",
        password: "Password123!",
      },
    });
    assert.ok(officerLogin.token);

    await pool.query(
      `INSERT INTO inec_voter_register (vin, full_name, lga_id, constituency_id, status)
       VALUES ($1, $2, $3, $4, 'eligible')
       ON CONFLICT (vin) DO NOTHING`,
      [voterVin, "Integration Test Voter", 1, 1],
    );

    const vinValidation = await request(baseUrl, "/api/auth/validate-vin", {
      method: "POST",
      token: officerLogin.token,
      body: {
        vin: voterVin,
        lgaId: 1,
        constituencyId: 1,
      },
    });
    assert.equal(vinValidation.success, true);
    assert.equal(vinValidation.alreadyRegistered, false);

    let invalidVinRejected = false;
    try {
      await request(baseUrl, "/api/auth/validate-vin", {
        method: "POST",
        token: officerLogin.token,
        body: {
          vin: `BAD${suffix}`,
          lgaId: 1,
          constituencyId: 1,
        },
      });
    } catch {
      invalidVinRejected = true;
    }
    assert.equal(invalidVinRejected, true);

    const registration = await request(baseUrl, "/api/auth/register-voter", {
      method: "POST",
      token: officerLogin.token,
      body: {
        vin: voterVin,
        fullName: "Integration Test Voter",
        email: voterEmail,
        phoneNumber: "+2348000000000",
        password: "Password123!",
        constituencyId: 1,
        lgaId: 1,
        fingerprintTemplate: fingerprint,
        faceTemplate: `face-${suffix}`,
      },
    });
    assert.equal(registration.success, true);

    const partial = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      body: {
        identifier: registration.voter.vin,
        password: "Password123!",
      },
    });
    assert.ok(partial.sessionToken);
    assert.equal(partial.biometricEnrollment.fingerprint, true);
    assert.equal(partial.biometricEnrollment.face, true);

    const partialWithEmail = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      body: {
        identifier: voterEmail,
        password: "Password123!",
      },
    });
    assert.ok(partialWithEmail.sessionToken);

    try {
      await request(baseUrl, "/api/auth/verify-biometric", {
        method: "POST",
        body: {
          sessionToken: partialWithEmail.sessionToken,
          method: "fingerprint",
          biometricVerified: false,
        },
      });
    } catch (error) {
      assert.match(error.message, /attemptsRemaining/);
    }

    const finalAuth = await request(baseUrl, "/api/auth/verify-biometric", {
      method: "POST",
      body: {
        sessionToken: partial.sessionToken,
        method: "fingerprint",
        biometricVerified: true,
      },
    });
    assert.ok(finalAuth.token);

    const ballot = await request(baseUrl, `/api/ballots/${finalAuth.constituencyId}`, {
      token: finalAuth.token,
    });
    assert.ok(ballot.candidates.length > 0);

    const vote = await request(baseUrl, "/api/votes", {
      method: "POST",
      token: finalAuth.token,
      body: {
        candidateId: ballot.candidates[0].id,
        deviceId: "integration-test",
      },
    });
    assert.ok(vote.receiptCode);
    assert.equal(vote.integrityHash.length, 64);

    let tokenRejectedAfterVote = false;
    try {
      await request(baseUrl, `/api/ballots/${finalAuth.constituencyId}`, {
        token: finalAuth.token,
      });
    } catch {
      tokenRejectedAfterVote = true;
    }
    assert.equal(tokenRejectedAfterVote, true);

    const offlineSuffix = `${suffix}1`;
    const offlineVin = `VO${offlineSuffix}`;

    await pool.query(
      `INSERT INTO inec_voter_register (vin, full_name, lga_id, constituency_id, status)
       VALUES ($1, $2, $3, $4, 'eligible')
       ON CONFLICT (vin) DO NOTHING`,
      [offlineVin, "Offline Sync Test Voter", 1, 1],
    );

    const offlineRegistration = await request(baseUrl, "/api/auth/register-voter", {
      method: "POST",
      token: officerLogin.token,
      body: {
        vin: offlineVin,
        fullName: "Offline Sync Test Voter",
        email: `offline.${offlineSuffix}@example.com`,
        phoneNumber: "+2348000000001",
        password: "Password123!",
        constituencyId: 1,
        lgaId: 1,
        fingerprintTemplate: `fingerprint-offline-${offlineSuffix}`,
        faceTemplate: `face-offline-${offlineSuffix}`,
      },
    });
    assert.equal(offlineRegistration.success, true);

    const offlinePartial = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      body: {
        identifier: offlineRegistration.voter.vin,
        password: "Password123!",
      },
    });
    assert.ok(offlinePartial.sessionToken);

    const offlineAuth = await request(baseUrl, "/api/auth/verify-biometric", {
      method: "POST",
      body: {
        sessionToken: offlinePartial.sessionToken,
        method: "face",
        biometricVerified: true,
      },
    });
    assert.ok(offlineAuth.token);

    const offlinePackage = await request(
      baseUrl,
      `/api/votes/offline-package/${offlineAuth.constituencyId}?deviceId=offline-test-device`,
      {
        token: offlineAuth.token,
      },
    );
    assert.ok(offlinePackage.offlineToken);
    assert.ok(offlinePackage.candidates.length > 0);

    const offlineVoteId = crypto.randomUUID();
    const offlineSync = await request(baseUrl, "/api/votes/sync", {
      method: "POST",
      body: {
        offlineToken: offlinePackage.offlineToken,
        votes: [
          {
            offlineVoteId,
            candidateId: offlinePackage.candidates[0].id,
            deviceId: "offline-test-device",
            clientCastAt: new Date().toISOString(),
          },
        ],
      },
    });
    assert.equal(offlineSync.synced[0].status, "accepted");
    assert.ok(offlineSync.synced[0].receiptCode);
    assert.equal(offlineSync.synced[0].integrityHash.length, 64);

    const duplicateOfflineSync = await request(baseUrl, "/api/votes/sync", {
      method: "POST",
      body: {
        offlineToken: offlinePackage.offlineToken,
        votes: [
          {
            offlineVoteId,
            candidateId: offlinePackage.candidates[0].id,
            deviceId: "offline-test-device",
            clientCastAt: new Date().toISOString(),
          },
        ],
      },
    });
    assert.equal(duplicateOfflineSync.synced[0].status, "duplicate");

    await request(baseUrl, "/api/auth/forgot-password", {
      method: "POST",
      body: { email: voterEmail },
    });

    const otpRequest = await request(baseUrl, "/api/auth/request-password-otp", {
      method: "POST",
      body: { vin: registration.voter.vin },
    });
    assert.equal(otpRequest.success, true);
    assert.ok(otpRequest.debugOtp);

    const otpReset = await request(baseUrl, "/api/auth/reset-password-otp", {
      method: "POST",
      body: {
        vin: registration.voter.vin,
        otp: otpRequest.debugOtp,
        password: "NewPassword123!",
      },
    });
    assert.equal(otpReset.success, true);

    const closedElection = await request(
      baseUrl,
      `/api/admin/elections/${lifecycleElection.election.id}/close`,
      {
        method: "POST",
        token: adminLogin.token,
      },
    );
    assert.equal(closedElection.election.status, "closed");

    const publishedElection = await request(
      baseUrl,
      `/api/admin/elections/${lifecycleElection.election.id}/publish`,
      {
        method: "POST",
        token: adminLogin.token,
      },
    );
    assert.equal(publishedElection.election.status, "published");

    console.log("Integration tests passed");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
