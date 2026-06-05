import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TUpdateProfile, TChangePassword } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../config/index";

const updateMyProfile = async (userEmail: string, payload: TUpdateProfile) => {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // If email is being updated, check if it already exists
  if (payload.email && payload.email !== userEmail) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (existingUser) {
      throw new AppError(409, "Email already in use");
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      email: userEmail,
    },
    data: payload,
  });

  const { password, ...result } = updatedUser;
  return result;
};

const changePassword = async (
  userEmail: string,
  payload: TChangePassword,
) => {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    payload.currentPassword,
    user.password,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError(403, "Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { email: userEmail },
    data: { password: hashedNewPassword },
  });

  return { message: "Password changed successfully" };
};

export const UserService = {
  updateMyProfile,
  changePassword,
};
