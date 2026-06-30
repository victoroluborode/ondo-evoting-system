const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendEmail({ to, subject, text, html }) {
  if (process.env.EMAIL_PROVIDER === "resend" && resend) {
    try {
      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to,
        subject,
        text,
        html: html || `<p>${text.replace(/\n/g, "<br />")}</p>`,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log("Resend email sent:", response);
      return { provider: "resend", sent: true };
    } catch (error) {
      console.error(
        "Resend email send failed, falling back to console:",
        error.message,
      );
    }
  }

  console.log(
    JSON.stringify({
      level: "info",
      event: "email_console_fallback",
      to,
      subject,
      text,
    }),
  );

  return { provider: "console", sent: true };
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  return sendEmail({
    to,
    subject: "Reset Your Ondo State e-Voting Password",
    text: `
Ondo State e-Voting System

Hello,

We received a request to reset the password for your voter account.

To continue, click the secure password reset link below:

${resetUrl}

This link expires in 15 minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

For your security:
• Never share your password with anyone.
• Only reset your password using the official Ondo State e-Voting System.
• If you believe your account has been accessed without your permission, contact the election administrator immediately.

Ondo State e-Voting System
Secure Voter Services
    `.trim(),
    html: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

  <div style="background:#0F4C2A;padding:24px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">
      Ondo State e-Voting System
    </h1>
    <p style="color:#d8f3dc;margin:8px 0 0;">
      Password Reset Request
    </p>
  </div>

  <div style="padding:32px;">
    <p>Hello,</p>

    <p>
      We received a request to reset the password for your voter account.
    </p>

    <p>
      Click the button below to create a new password.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a
        href="${resetUrl}"
        style="
          display:inline-block;
          background:#0F4C2A;
          color:#ffffff;
          text-decoration:none;
          padding:14px 28px;
          border-radius:6px;
          font-weight:bold;
        "
      >
        Reset Password
      </a>
    </div>

    <p style="word-break:break-all;font-size:13px;color:#6b7280;">
      If the button doesn't work, copy and paste this link into your browser:
      <br><br>
      ${resetUrl}
    </p>

    <p>
      <strong>This link expires in 15 minutes.</strong>
    </p>

    <p>
      If you did not request this password reset, you can safely ignore this email.
      Your account will remain secure and no changes will be made.
    </p>

    <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;" />

    <h3 style="margin-bottom:8px;">Security reminders</h3>

    <ul style="padding-left:20px;">
      <li>Never share your password with anyone.</li>
      <li>Only reset your password using the official Ondo State e-Voting System.</li>
      <li>If you suspect unauthorized access, contact the election administrator immediately.</li>
    </ul>
  </div>

  <div style="background:#f8f9fa;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
    © 2026 Ondo State e-Voting System<br>
    Secure Voter Services
  </div>

</div>
    `,
  });
}

async function sendAdminOtpEmail({ to, otp }) {
  return sendEmail({
    to,
    subject: "Your Ondo State e-Voting Administrator Verification Code",
    text: `
Ondo State e-Voting System

Hello,

A sign-in attempt was made using your administrator account.

Your one-time verification code is:

${otp}

This code expires in 5 minutes.

If you did not request this code, you can safely ignore this email. No changes have been made to your account.

For security reasons:
• Never share this code with anyone.
• Election officials will never ask you for this code.
• Use it only on the Ondo State e-Voting System.

Ondo State e-Voting System
Election Administration
    `.trim(),
    html: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <div style="background:#0F4C2A;padding:24px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Ondo State e-Voting System</h1>
    <p style="color:#d8f3dc;margin:8px 0 0;">Administrator Verification</p>
  </div>

  <div style="padding:32px;">
    <p>Hello,</p>

    <p>
      A sign-in attempt was made using your administrator account.
      To continue, enter the verification code below.
    </p>

    <div style="background:#f5f5f5;border:2px dashed #0F4C2A;padding:20px;text-align:center;margin:24px 0;">
      <div style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#0F4C2A;">
        ${otp}
      </div>
    </div>

    <p><strong>This code expires in 5 minutes.</strong></p>

    <p>If you did not request this code, you can safely ignore this email. No changes have been made to your account.</p>

    <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;" />

    <h3 style="margin-bottom:8px;">Security reminders</h3>
    <ul style="padding-left:20px;">
      <li>Never share this verification code.</li>
      <li>Election officials will never ask for your code.</li>
      <li>Use this code only on the Ondo State e-Voting System.</li>
    </ul>
  </div>

  <div style="background:#f8f9fa;padding:18px;text-align:center;font-size:12px;color:#6b7280;">
    © 2026 Ondo State e-Voting System<br>
    Secure Election Administration Portal
  </div>
</div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendAdminOtpEmail,
};
