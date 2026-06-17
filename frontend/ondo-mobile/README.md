# Ondo e-Vote Mobile Frontend

This is a starter React Native/Expo frontend for previewing the voter-facing screens.

## Current Screens

- Splash screen
- Role selection screen
- Voter login screen
- Voter biometric choice screen
- Voter ballot screen
- Vote review screen
- Vote receipt screen
- Officer login/home placeholders
- Admin login/home placeholders

## Current Architecture

- `AuthContext` stores the active role: voter, officer, or admin.
- `AppNavigator` swaps between unauthenticated entry screens and role-specific flows.
- `VoterStack` owns the authenticated voter journey after login.
- `CustomButton`, `CustomInput`, and `OfflineBanner` are the first shared UI components.

## Preview Without Installing Expo

Open `preview.html` in a browser to quickly inspect the current screen direction.

## Run With Expo

```sh
npm install
npm start
```

The app currently uses lightweight local navigation so we can review screens before adding the full navigation stack.
