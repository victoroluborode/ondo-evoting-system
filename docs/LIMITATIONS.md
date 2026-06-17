# Limitations And Future Work

## Current Limitations

### Biometric Scope

Fingerprint and face verification are currently represented as a backend API boundary. The backend stores enrollment values but does not perform biometric matching yet. The matching logic is not being abandoned or permanently outsourced; it is planned as a later project phase.

### Mock SMS / OTP

SMS registration confirmation and password reset OTP delivery are mocked and logged locally. This avoids needing paid SMS infrastructure for the final year demo.

### Console Email

Password reset email is currently logged locally unless an email provider is configured.

### Local Deployment

The backend is designed to run locally. It is not configured for a public production election deployment.

### Offline Sync

The backend now supports signed offline voting packages and queued vote synchronization. The remaining work is on the future mobile client: storing the local encrypted queue, preventing duplicate local voting before reconnecting, and automatically retrying sync when connectivity returns.

### Admin Metrics

Admin dashboard metrics are calculated from local database records. More advanced production metrics such as accreditation device status, polling unit availability, and real-time WebSocket updates are future work.

## Future Work

- Build a client application against the backend APIs.
- Implement the project's fingerprint verification module.
- Implement the project's face-recognition and liveness module.
- Add trained FaceNet/MobileFaceNet/TensorFlow Lite model if on-device face recognition is selected.
- Add real email delivery through Resend, SendGrid, Mailgun, or AWS SES.
- Add production SMS/OTP delivery.
- Add the mobile offline vote queue and automatic reconnect retry workflow.
- Add deployment using Render, Railway, Fly.io, AWS, Azure, or GCP.
- Add CI/CD pipeline.
- Add database backups and restore tests.
- Add finer-grained admin roles.
- Add device attestation and stronger anti-replay controls.
- Add richer security/admin dashboard.
- Add public result publication workflow.

## Why These Limits Are Acceptable For This Project

The project focuses on demonstrating a secure architecture, constituency-aware partitioning, staged authentication, encrypted vote storage, integrity receipts, and end-to-end election flow.

The simulated parts are explicitly documented and isolated, which makes the system academically credible while keeping the implementation realistic for a final year project timeline.
