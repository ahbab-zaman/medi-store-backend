import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../config";
import AppError from "../../errors/AppError";
import { TLoginUser } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utils";
import { User } from "../../../../generated/prisma/client";

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

  return {
    accessToken,
    refreshToken,
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

  // Check if the refresh token matches the one in DB (Single Session Strictness)
  if (userData.refreshToken !== token) {
    throw new AppError(401, "Invalid Refresh Token!");
  }

  const jwtPayload = {
    email: userData.email,
    role: userData.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret as string,
    config.jwt.expires_in as string,
  );

  // Rotate refresh token on each successful refresh, so that
  // access tokens can be regenerated without logging out while
  // still keeping a single active session.
  const newRefreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string,
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const getMe = async (email: string) => {
  const userData = await prisma.user.findUnique({
    where: {
      email,
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
  refreshToken,
  logoutUser,
  getMe,
};
