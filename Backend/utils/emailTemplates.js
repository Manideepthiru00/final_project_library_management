export const generateVerificationOtpEmailTemplate = (verificationCode) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Thank you for registering. Please use the following OTP to verify your account.</p>
      <h3 style="background: #f4f4f4; padding: 10px; display: inline-block;">${verificationCode}</h3>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};

export const generateForgotPasswordEmailTemplate = (resetPasswordUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reset Password</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetPasswordUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};
