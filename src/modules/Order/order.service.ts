import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { OrderStatus } from "../../../generated/prisma/client";

const createOrder = async (userId: string, payload: any) => {
  // Payload should contain items: { medicineId, quantity }[]
  const { items, shippingAddress } = payload;

  let totalAmount = 0;
  const orderItemsData = [];

  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId },
    });

    if (!medicine) {
      throw new AppError(404, `Medicine not found`);
    }

    if (medicine.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${medicine.name}`);
    }

    totalAmount += medicine.price * item.quantity;
    orderItemsData.push({
      medicineId: item.medicineId,
      quantity: item.quantity,
      price: medicine.price,
    });

    // Reduce stock
    await prisma.medicine.update({
      where: { id: medicine.id },
      data: { stock: medicine.stock - item.quantity },
    });
  }

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress,
      orderItems: {
        create: orderItemsData,
      },
    },
    include: {
      orderItems: true,
    },
  });

  return order;
};

const getSellerOrders = async (sellerId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          medicine: {
            sellerId: sellerId,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
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

  return orders;
};

const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  status: OrderStatus,
) => {
  // Check if order contains seller's items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          medicine: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const hasSellerItems = order.orderItems.some(
    (item) => item.medicine.sellerId === sellerId,
  );

  if (!hasSellerItems) {
    throw new AppError(403, "You are not authorized to update this order");
  }

  // Update status
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

export const OrderService = {
  createOrder,
  getSellerOrders,
  updateOrderStatus,
};
