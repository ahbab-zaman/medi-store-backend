import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TUpdateProfile } from "./user.interface";

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

export const UserService = {
  updateMyProfile,
};
