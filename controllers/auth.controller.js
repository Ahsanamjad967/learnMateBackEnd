const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const user = require("../models/user.model");
const sendMail = require("../utils/nodeMailer");
const crypto = require("crypto");

const sendPasswordResetEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(403, "email is required!");
  }

  const requester = await user.findOne({ email });
  if (!requester) {
    throw new ApiError(404, "user with this email is not found");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 36000;

  requester.passwordResetToken = token;
  requester.passwordResetExpires = tokenExpiry;
  await requester.save();
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  try {
    await sendMail(
      email,
      "Password reset Triggered ",
      `Click here to reset the password: ${resetUrl}`
    );
  } catch (error) {
    throw new ApiError(500, "error sending password reset email");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "password reset email sent succesfuly"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body;
  if (!token || !newPassword) {
    throw new ApiError(403, "token or password is missing");
  }

  const passwordChangeUser = await user.findOne(
    {
      passwordResetToken: token,
    },
    "password"
  );
  if (!passwordChangeUser) {
    throw new ApiError(401, "wrong token or expired token");
  }

  passwordChangeUser.password = newPassword;
  passwordChangeUser.passwordResetToken = undefined;

  await passwordChangeUser.save({ validateBeforeSave: true });

  res.status(200).json(new ApiResponse(200, "password changed succesfully"));
});

module.exports = { sendPasswordResetEmail, resetPassword };
