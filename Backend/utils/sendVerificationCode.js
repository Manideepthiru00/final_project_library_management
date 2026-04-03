import { sendEmail } from "./sendEmail.js";
import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";

export const sendVerificationCode = async (user) => {
  const message = generateVerificationOtpEmailTemplate(user.verificationCode);
  
  await sendEmail({
    email: user.email,
    subject: "Account Verification Check",
    message,
  });
};
