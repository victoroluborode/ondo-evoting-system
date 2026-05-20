const assert = require("assert");
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

    const suffix = String(Date.now()).slice(-9);
    const voterEmail = `test.${suffix}@example.com`;
    const fingerprint = `fingerprint-${suffix}`;

    const officerLogin = await request(baseUrl, "/api/auth/officers/login", {
      method: "POST",
      body: {
        email: "officer@inec.ondo.gov.ng",
        password: "Password123!",
      },
    });
    assert.ok(officerLogin.token);

    const registration = await request(baseUrl, "/api/auth/register-voter", {
      method: "POST",
      token: officerLogin.token,
      body: {
        vin: `VT${suffix}`,
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

    const partialWithEmail = await request(baseUrl, "/api/auth/login", {
      method: "POST",
      body: {
        identifier: voterEmail,
        password: "Password123!",
      },
    });
    assert.ok(partialWithEmail.sessionToken);

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
