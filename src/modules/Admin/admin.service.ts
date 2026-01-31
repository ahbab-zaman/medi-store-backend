import { prisma } from "../../lib/prisma";
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

const updateUserRole = async (
  id: string,
  role: "ADMIN" | "SELLER" | "CUSTOMER",
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      role,
    },
  });
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.delete({
    where: { id },
  });
};

const updateOrderStatus = async (
  id: string,
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    throw new AppError(404, "Order not found");
  }

  return prisma.order.update({
    where: { id },
    data: {
      status,
    },
  });
};

const deleteOrder = async (id: string) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    throw new AppError(404, "Order not found");
  }

  return prisma.order.delete({
    where: { id },
  });
};

export const AdminService = {
  getAllUsers,
  updateUserBanStatus,
  updateUserRole,
  getAllOrders,
  deleteUser,
  updateOrderStatus,
  deleteOrder,
};
