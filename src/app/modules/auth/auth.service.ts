import bcrypt from "bcrypt";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../../config";
import AppError from "../../errors/handleAppError";
import { UserModel } from "../user/user.model";
import { TAuth, TExternalProviderAuth } from "./auth.interface";
import { sendEmail } from "../../utils/sendEmail";

// Helper to generate tokens
const generateTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: "24h",
  });

  const refreshToken = jwt.sign(payload, config.jwt_refresh_secret as string, {
    expiresIn: "3d",
  });

  return { accessToken, refreshToken };
};

// Register a user in database
const registerUserOnDB = async (payload: TAuth) => {
  const result = await UserModel.create(payload);
  return result;
};

// Login with credentials
const loginUserFromDB = async (payload: TAuth) => {
  const isUserExists = await UserModel.findOne({ email: payload?.email });

  if (!isUserExists) {
    throw Error("User does not exists!");
  }

  // check password
  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    isUserExists?.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Wrong Credentials!");
  }

  const user = await UserModel.findByIdAndUpdate(
    isUserExists?._id,
    { status: "active" },
    { new: true }
  ).select("-password");

  const jwtPayload = {
    _id: user?._id,
    id: user?._id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
    gender: user?.gender,
    walletPoint: user?.walletPoint,
  };

  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  return { user, accessToken, refreshToken };
};

// Login with provider
const loginUserUsingProviderFromDB = async (payload: TExternalProviderAuth) => {
  let user = await UserModel.findOne({ email: payload?.email });

  if (!user) {
    user = await UserModel.create(payload);
  } else {
    user = await UserModel.findByIdAndUpdate(
      user._id,
      { status: "active" },
      { new: true }
    );
  }

  const jwtPayload = {
    _id: user?._id,
    id: user?._id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
    gender: user?.gender,
    walletPoint: user?.walletPoint,
  };

  const { accessToken, refreshToken } = generateTokens(jwtPayload);

  return { user, accessToken, refreshToken };
};

// Refresh token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      config.jwt_refresh_secret as string
    ) as jwt.JwtPayload;

    const user = await UserModel.findOne({ email: decoded.email }).select("-password");

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    const jwtPayload = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      walletPoint: user.walletPoint,
    };

    const accessToken = jwt.sign(
      jwtPayload,
      config.jwt_access_secret as string,
      { expiresIn: "24h" }
    );

    return { accessToken };
  } catch (error) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token"
    );
  }
};

// Logout
const logoutUserFromDB = async (id: string) => {
  await UserModel.findByIdAndUpdate(id, { status: "inActive" }, { new: true });
  return {};
};

// Change password
const changePasswordInDB = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect!");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });

  return {};
};

// Forgot password
const forgotPasswordInDB = async (email: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await UserModel.findByIdAndUpdate(user._id, {
    resetPasswordToken: hashedToken,
    resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  const resetUrl = `${config.frontend_url}/auth/reset-password?token=${resetToken}`;

  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail(email, "Password Reset Request", html);

  return {};
};

// Reset password
const resetPasswordInDB = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired reset token!"
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await UserModel.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });

  return {};
};

const getMeFromDB = async (email: string) => {
  const user = await UserModel.findOne({ email }).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

export const AuthServices = {
  registerUserOnDB,
  loginUserFromDB,
  loginUserUsingProviderFromDB,
  refreshAccessToken,
  logoutUserFromDB,
  changePasswordInDB,
  forgotPasswordInDB,
  resetPasswordInDB,
  getMeFromDB,
};
