import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateUserBanStatus = async (id: string, isBanned: boolean) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      isBanned,
    },
  });
};

const getAllOrders = async () => {
  return prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const AdminService = {
  getAllUsers,
  updateUserBanStatus,
  getAllOrders,
};

