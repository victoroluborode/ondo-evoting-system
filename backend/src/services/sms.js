async function sendMockRegistrationSms({ to, vin }) {
  if (!to) {
    return { provider: "mock", sent: false };
  }

  console.log(
    JSON.stringify({
      level: "info",
      event: "mock_registration_sms",
      to,
      message: `Your Ondo State e-voting registration is complete. VIN: ${vin}. Use your VIN or email and password on election day.`,
    }),
  );
  return { provider: "mock", sent: true };
}

async function sendMockPasswordResetOtp({ to, otp }) {
  if (!to) {
    return { provider: "mock", sent: false };
  }

  console.log(
    JSON.stringify({
      level: "info",
      event: "mock_password_reset_otp",
      to,
      message: `Your Ondo State e-voting password reset OTP is ${otp}. It expires in 10 minutes.`,
    }),
  );
  return { provider: "mock", sent: true };
}

module.exports = { sendMockRegistrationSms, sendMockPasswordResetOtp };
