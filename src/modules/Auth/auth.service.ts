import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import config from "../../config/index";
import AppError from "../../errors/AppError";
import { TLoginUser } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utils";
import { User } from "@prisma/client";
import { sendEmail } from "../../utils/emailSender";

const registerUser = async (payload: User) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "User with this email already exists!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const userData = {
    ...payload,
    password: hashedPassword,
  };

  const result = await prisma.user.create({
    data: userData,
  });

  const { password, ...userWithoutPassword } = result;

  return userWithoutPassword;
};

const loginUser = async (payload: TLoginUser) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new AppError(404, "User does not exist!");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(403, "Password does not match!");
  }

  // Removed strict single-session check to allow re-login if user clears cookies

  const jwtPayload = {
    id: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      refreshToken,
    },
  });

  const { password, refreshToken: storedRefreshToken, ...userWithoutPassword } =
    userData;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, config.jwt.refresh_secret as string);
  } catch (err) {
    throw new AppError(401, "You are not authorized!");
  }

  const { email } = decodedData as { email: string };

  const userData = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!userData) {
    throw new AppError(404, "User does not exist!");
  }

  // Check if the refresh token matches the one in DB
  if (userData.refreshToken !== token) {
    throw new AppError(401, "Invalid Refresh Token!");
  }

  const jwtPayload = {
    id: userData.id,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string,
  );

  // ✅ FIX: Don't rotate refresh token on every access token refresh
  // This prevents race conditions with multiple tabs/requests
  // The refresh token should remain valid for its full lifetime

  // Simply return the same refresh token
  return {
    accessToken,
    refreshToken: token, // Return the same refresh token that was sent
  };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Avoid user enumeration: always return success even if the email is not found.
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetTokenHash,
      resetPasswordTokenExpiresAt: resetTokenExpiresAt,
    },
  });

  const resetUrl = `${config.frontend_url}/reset-password?token=${encodeURIComponent(
    resetToken,
  )}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="color:#2b6cb0">Reset your MediStore password</h2>
      <p>Hello ${user.name || user.email},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;margin:16px 0;background:#81604a;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}" style="color:#1d4ed8">${resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>Thanks,<br/>The MediStore Team</p>
    </div>
  `;

  const sendResult = await sendEmail(
    email,
    "MediStore Password Reset",
    html,
  );

  if (!sendResult) {
    throw new AppError(
      500,
      "Unable to send password reset email. Please try again later.",
    );
  }
};

const resetPassword = async (token: string, password: string) => {
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: resetTokenHash,
      resetPasswordTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(400, "Reset token is invalid or has expired.");
  }

  if (password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      refreshToken: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    },
  });
};

const getMe = async (payload: { id?: string; email?: string }) => {
  if (!payload.id && !payload.email) {
    throw new AppError(401, "You are not authorized!");
  }

  const userData = await prisma.user.findUnique({
    where: payload.id
      ? { id: payload.id }
      : {
          email: payload.email as string,
        },
  });

  if (!userData) {
    throw new AppError(404, "User does not exist!");
  }

  const { password, ...userWithoutPassword } = userData;

  return userWithoutPassword;
};

const logoutUser = async (email: string) => {
  // We can rely on req.user from auth middleware for the email
  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      refreshToken: null,
    },
  });
  return {
    message: "Logged out successfully",
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser,
  getMe,
};
