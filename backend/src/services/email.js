async function sendPasswordResetEmail({ to, resetUrl }) {
  if (process.env.EMAIL_PROVIDER === "console" || !process.env.EMAIL_PROVIDER) {
    console.log(
      JSON.stringify({
        level: "info",
        event: "password_reset_email",
        to,
        resetUrl,
      }),
    );
    return { provider: "console", sent: true };
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
}

module.exports = { sendPasswordResetEmail };
