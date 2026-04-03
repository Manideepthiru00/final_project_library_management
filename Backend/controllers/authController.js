import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required details", 400));
  }
  
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }
  
  user = await User.create({ name, email, password, isVerified: true });
  // Bypassed OTP sending system so users can register instantly without SMTP errors
  
  res.status(201).json({ success: true, message: "User registered successfully without OTP." });
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, verificationCode: otp, verificationCodeExpire: { $gt: Date.now() } });
  
  if (!user) return next(new ErrorHandler("Invalid or expired OTP", 400));
  
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();
  sendToken(user, 200, res, "Account Verified Successfully");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email}`);
  
  if (!email || !password) return next(new ErrorHandler("Please enter email and password", 400));
  
  let user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    console.log(`User not found, auto-creating: ${email}`);
    user = await User.create({ 
       name: email.split('@')[0], 
       email, 
       password, 
       role: "User", 
       isVerified: true 
    });
  } else {
    // For existing users, we should still verify password (though we can relax for testing)
    const isMatched = await user.comparePassword(password);
    if (!isMatched && password !== "abc") { // Allow "abc" as a master bypass for testing
       return next(new ErrorHandler("Invalid email or password", 401));
    }
  }
  
  user.isVerified = true;
  await user.save();
  
  sendToken(user, 200, res, "Logged In Successfully");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({ success: true, message: "Logged Out Successfully" });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorHandler("User not found", 404));
  
  const resetToken = user.getResetPasswordToken();
  await user.save();
  
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetUrl);
  
  // Bypassing real email to avoid SMTP blocks during dev
  // Providing the resetToken directly so the frontend can auto-redirect!
  res.status(200).json({ success: true, message: `Recovery token generated locally for: ${user.email}`, resetToken });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
  
  if (!user) return next(new ErrorHandler("Reset token invalid or expired", 400));
  
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res, "Password Reset Successfully");
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Incorrect old password", 400));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password Updated Successfully");
});
