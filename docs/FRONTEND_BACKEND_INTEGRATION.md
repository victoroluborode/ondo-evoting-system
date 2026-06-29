# Frontend to Backend Integration

These changes are intentionally not applied to `frontend/`. Apply them manually
after reviewing each step.

## 1. Configure the API URL

Find the Mac's Wi-Fi address:

```bash
ipconfig getifaddr en0
```

Create `frontend/ondo-mobile/.env`:

```text
EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:3000/api
```

The phone and Mac must be on the same network. Do not use `localhost` from a
physical phone because it points back to the phone.

Start the backend:

```bash
cd backend
npm start
```

Restart Expo after creating or changing `.env`:

```bash
cd frontend/ondo-mobile
npx expo start --clear
```

## 2. Add the API helper

Create `frontend/ondo-mobile/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not configured");
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Unable to complete the request");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
```

## 3. Connect voter login

In `VoterLoginScreen.js`, add:

```javascript
import { apiRequest } from "../../services/api";
```

Replace `handleLogin` with:

```javascript
const handleLogin = async () => {
  setError(null);
  setLoading(true);

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    loginRole("voter", {
      ...data.user,
      sessionToken: data.sessionToken,
      biometricEnrollment: data.biometricEnrollment,
      sessionExpiresInSeconds: data.expiresInSeconds,
    });
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setLoading(false);
  }
};
```

The voter has only a partial session at this point. The final voting token is
issued after fingerprint or face verification.

## 4. Connect fingerprint verification

In `FingerprintVerificationScreen.js`, change the React import to include
`useContext`, then add:

```javascript
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
```

Inside the component add:

```javascript
const { userData, loginRole, logout } = useContext(AuthContext);
const [error, setError] = useState(null);
```

Replace `triggerScan` with:

```javascript
const triggerScan = async () => {
  setError(null);
  setIsScanning(true);

  try {
    const data = await apiRequest("/auth/verify-biometric", {
      method: "POST",
      body: JSON.stringify({
        sessionToken: userData.sessionToken,
        method: "fingerprint",
        biometricVerified: true,
      }),
    });

    loginRole("voter", {
      ...userData,
      ...data.user,
      token: data.token,
      authMethod: data.authMethod,
      sessionToken: null,
    });
    navigation.replace("Ballot");
  } catch (requestError) {
    setError(requestError.message);

    if (requestError.status === 401 && requestError.data?.locked) {
      logout();
    }
  } finally {
    setIsScanning(false);
  }
};
```

Render `error` near the scan controls using the screen's existing error style
or a simple red `Text`.

Apply the same change in `FaceVerificationScreen.js`, but send:

```javascript
method: "face"
```

## 5. Connect officer login

In `OfficerLoginScreen.js`, import `apiRequest` and replace `handleLogin`:

```javascript
const handleLogin = async () => {
  setError(null);
  setLoading(true);

  try {
    const data = await apiRequest("/auth/officers/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: officerId.trim(),
        password,
      }),
    });

    loginRole("officer", {
      ...data.user,
      token: data.token,
    });
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setLoading(false);
  }
};
```

Demo credentials:

```text
Officer ID: OFF-1002
Password: Password123!
```

## 6. Connect admin login

In `AdminLoginScreen.js`, import `apiRequest` and add:

```javascript
const [pendingSession, setPendingSession] = useState(null);
```

Replace `handleInitialLogin`:

```javascript
const handleInitialLogin = async () => {
  setError(null);
  setLoading(true);

  try {
    const data = await apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: adminId.trim(),
        password,
      }),
    });

    setPendingSession(data);
    setBiometricStep(true);
  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setLoading(false);
  }
};
```

Replace `handleBiometricAuth`:

```javascript
const handleBiometricAuth = () => {
  if (!pendingSession) {
    setError("Admin session is no longer available. Sign in again.");
    setBiometricStep(false);
    return;
  }

  loginRole("admin", {
    ...pendingSession.user,
    token: pendingSession.token,
  });
};
```

Demo credentials:

```text
Admin ID: ADM-ONDO-001
Password: AdminPassword123!
```

The current admin biometric button remains a frontend simulation. The backend
does not require or verify an admin biometric.

## 7. Connect password-reset request

In `VoterPasswordResetScreen.js`, import `apiRequest` and replace
`handleSubmit`:

```javascript
const handleSubmit = async () => {
  setLoading(true);

  try {
    await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        identifier: identifier.trim(),
      }),
    });
    setSent(true);
  } catch {
    // Keep the response generic so the screen does not reveal account existence.
    setSent(true);
  } finally {
    setLoading(false);
  }
};
```

## 8. Use authenticated tokens

For officer, admin, ballot, and vote requests, read the token from
`AuthContext.userData.token` and send:

```javascript
headers: {
  Authorization: `Bearer ${userData.token}`,
}
```

Important endpoints:

```text
GET  /api/ballots/:constituencyId
POST /api/votes
GET  /api/admin/dashboard
GET  /api/admin/constituencies
GET  /api/admin/lgas
GET  /api/admin/results/:constituencyId
```

The backend returns errors as:

```json
{
  "error": "Human-readable message"
}
```

## 9. Open the election before testing the voter flow

Ballot retrieval and vote submission are intentionally blocked unless an
election has `open` status.

The current **House of Representatives Elections 2027** record is still
`draft`. Its ID is:

```text
76e6050e-8524-490b-a0a4-86524b29e7f0
```

Until the admin election-management screen is connected, open it through an API
client:

```http
POST /api/admin/elections/76e6050e-8524-490b-a0a4-86524b29e7f0/open
Authorization: Bearer <admin-token>
```

Get `<admin-token>` by signing in through:

```http
POST /api/admin/login
Content-Type: application/json

{
  "identifier": "ADM-ONDO-001",
  "password": "AdminPassword123!"
}
```

Opening can fail if any constituency has no candidate. That validation is
intentional and should not be bypassed.

## 10. Load the real voter ballot

`BallotScreen.js` currently contains a hard-coded constituency and candidate
array. Replace those values with the existing backend endpoints:

```text
GET /api/ballots/constituencies
GET /api/ballots/:constituencyId
```

The first endpoint supplies the constituency display name. The second is
protected and supplies only the authenticated voter's candidates and active
election.

### Imports

Change:

```javascript
import React, { useState } from "react";
```

to:

```javascript
import React, { useContext, useEffect, useState } from "react";
```

Add `ActivityIndicator` to the existing `react-native` import:

```javascript
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
```

Add:

```javascript
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
```

### Component state and ballot request

Inside `BallotScreen`, immediately after `useSafeAreaInsets`, use:

```javascript
const { userData, logout } = useContext(AuthContext);
const [selectedCandidate, setSelectedCandidate] = useState(null);
const [ballot, setBallot] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const loadBallot = async () => {
  setLoading(true);
  setError(null);

  try {
    const [ballotData, constituencyData] = await Promise.all([
      apiRequest(`/ballots/${userData.constituencyId}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      }),
      apiRequest("/ballots/constituencies"),
    ]);

    const constituency = constituencyData.constituencies.find(
      (item) => Number(item.id) === Number(userData.constituencyId),
    );

    setBallot({
      ...ballotData,
      constituency,
    });
  } catch (requestError) {
    setError(requestError.message);

    if (requestError.status === 401) {
      logout();
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadBallot();
}, []);

const constituency =
  ballot?.constituency?.name || `Constituency ${userData.constituencyId}`;
const candidates = ballot?.candidates || [];
```

Delete the existing hard-coded `constituency`, `candidates`, and duplicate
`selectedCandidate` declarations.

### Selection and navigation

Replace `handleSelection` with:

```javascript
const handleSelection = () => {
  if (!selectedCandidate) return;

  const candidateData = candidates.find(
    (candidate) => String(candidate.id) === selectedCandidate,
  );

  navigation.navigate("VoteReview", {
    candidate: candidateData,
    constituency: ballot.constituency,
    election: ballot.election,
  });
};
```

Inside `candidates.map`, replace:

```javascript
const isSelected = selectedCandidate === candidate.id;
```

with:

```javascript
const candidateId = String(candidate.id);
const isSelected = selectedCandidate === candidateId;
```

Then use the normalized ID:

```javascript
key={candidateId}
onPress={() => setSelectedCandidate(candidateId)}
```

### Loading and error states

Before the screen's main `return`, add:

```javascript
if (loading) {
  return (
    <View style={[styles.container, styles.centeredState]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.stateText}>Loading your official ballot…</Text>
    </View>
  );
}

if (error) {
  return (
    <View style={[styles.container, styles.centeredState]}>
      <Text style={styles.errorText}>{error}</Text>
      <CustomButton
        title="Try Again"
        onPress={loadBallot}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}
```

Add these styles:

```javascript
centeredState: {
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
},
stateText: {
  marginTop: spacing.md,
  color: colors.textMuted,
  textAlign: "center",
},
errorText: {
  color: colors.error,
  textAlign: "center",
  lineHeight: 20,
},
```

After this change, the Metro log should show:

```text
[API] GET .../api/ballots/1
[API] GET .../api/ballots/constituencies
[API] Response 200
```

## 11. Submit the real vote

`VoteReviewScreen.js` currently runs a local encryption simulation and then
navigates after a timer. For the online path, the backend performs validation,
encryption, hashing, storage, result aggregation, and token invalidation in one
database transaction.

### Imports

Change:

```javascript
import React, { useState } from "react";
```

to:

```javascript
import React, { useContext, useState } from "react";
```

Remove:

```javascript
import { EncryptionService } from "../../services/encryptionService";
```

Add:

```javascript
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
```

### Route data and submission

Replace the current route/state declarations and `confirmVote` with:

```javascript
const { candidate, constituency, election } = route.params;
const { userData, logout } = useContext(AuthContext);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState(null);

const confirmVote = async () => {
  setIsSubmitting(true);
  setError(null);

  try {
    const data = await apiRequest("/votes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify({
        candidateId: candidate.id,
        deviceId: "ondo-mobile",
      }),
    });

    navigation.replace("Receipt", {
      receiptCode: data.receiptCode,
      integrityHash: data.integrityHash,
    });
  } catch (requestError) {
    setError(requestError.message);

    if (requestError.status === 401) {
      logout();
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

Replace the hard-coded candidate subtitle with:

```javascript
{candidate?.party || "—"} · {constituency?.name || "—"}
```

Replace the hard-coded constituency value with:

```javascript
{constituency?.name || "—"}
```

Replace the hard-coded election value with:

```javascript
{election?.name || "—"}
```

Render the request error immediately before `styles.actionGroup`:

```javascript
{error ? <Text style={styles.errorText}>{error}</Text> : null}
```

Add:

```javascript
errorText: {
  color: colors.error,
  textAlign: "center",
  lineHeight: 20,
  marginBottom: spacing.md,
},
```

Do not retry automatically after an uncertain vote-submission failure. Check
the backend response/log first, because a successful vote permanently marks the
voter as having voted.

## 12. Display the backend receipt

`ReceiptScreen.js` currently generates a random local code. That code is not
evidence of a successful backend submission.

Change:

```javascript
export default function ReceiptScreen() {
```

to:

```javascript
export default function ReceiptScreen({ route }) {
```

Replace:

```javascript
const receiptCode =
  "EVT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
```

with:

```javascript
const { receiptCode, integrityHash } = route.params || {};
```

Replace the receipt display with:

```javascript
<Text style={styles.receiptHash}>
  {receiptCode || "Receipt unavailable"}
</Text>
```

Replace the existing receipt note with:

```javascript
<Text style={styles.receiptNote}>
  This code confirms that a ballot was submitted. It does not reveal who you
  voted for.
</Text>
{integrityHash ? (
  <Text style={[styles.receiptNote, { marginTop: spacing.sm }]}>
    Integrity reference: {integrityHash}
  </Text>
) : null}
```

The expected final request is:

```text
[API] POST .../api/votes
[API] Response 200
```

After this succeeds:

- The returned receipt is generated by the backend.
- The encrypted vote is stored.
- Aggregate results are incremented.
- `has_voted` becomes `true`.
- The final voting JWT is invalidated.
- The same voter cannot cast another vote.
