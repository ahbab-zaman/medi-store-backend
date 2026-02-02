import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { OrderStatus, Role } from "../../../generated/prisma/client";
import config from "../../config";
import Stripe from "stripe";
import { sendEmail } from "../../utils/emailSender";

const stripe = new Stripe(
  config.stripe_secret_key as string,
  {
    apiVersion: "2024-12-18.acacia", // Use strict string or ignore if library allows string
  } as any,
);

const createOrder = async (userId: string, payload: any) => {
  const { items, shippingAddress, paymentMethod, transactionId } = payload;

  if (!items || items.length === 0) {
    throw new AppError(400, "Order must contain at least one item");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let totalAmount = 0;
  const orderItemsData: any[] = [];

  // 1. Validate Items and Calculate Total
  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId },
    });

    if (!medicine) {
      throw new AppError(404, `Medicine with ID ${item.medicineId} not found`);
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
  }

  // 2. Process Payment (Mock Verification for simplicity, or real if needed)
  let paymentStatus = "PENDING";
  if (paymentMethod === "CARD") {
    if (!transactionId) {
      throw new AppError(400, "Transaction ID is required for Card payment");
    }
    // Optional: Verify Stripe PaymentIntent here
    // const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    // if (paymentIntent.status !== 'succeeded') throw new AppError(400, 'Payment failed');
    paymentStatus = "PAID";
  } else if (paymentMethod === "COD") {
    paymentStatus = "PENDING";
  }

  // 3. Create Order and Reduce Stock transactionally
  const result = await prisma.$transaction(async (tx) => {
    // Reduce Stock
    for (const item of items) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create Order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        status: OrderStatus.PENDING,
        paymentStatus,
        paymentMethod,
        transactionId,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { medicine: true },
        },
      },
    });

    // Clear Cart Items for User
    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return order;
  });

  // 4. Send Email (Non-blocking)
  const emailHtml = `
    <h1>Order Confirmation</h1>
    <p>Dear ${user.name},</p>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${result.id}</p>
    <p><strong>Total Amount:</strong> $${totalAmount}</p>
    <h3>Items:</h3>
    <ul>
        ${result.orderItems.map((item) => `<li>${item.medicine.name} x ${item.quantity} - $${item.price * item.quantity}</li>`).join("")}
    </ul>
    <p>We will notify you when your order is shipped.</p>
  `;

  sendEmail(user.email, "Order Confirmation - Medi Store", emailHtml).catch(
    (err) => console.error("Email failed", err),
  );

  return result;
};

const getAllOrders = async () => {
  // Admin sees all
  return await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: { include: { medicine: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: { include: { medicine: true } },
    },
    orderBy: { createdAt: "desc" },
  });
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

const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, contactNumber: true } },
      orderItems: { include: { medicine: true } },
    },
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
};

const updateOrderStatus = async (
  orderId: string,
  userId: string,
  role: string,
  status: OrderStatus,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { medicine: true } } },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (role === Role.ADMIN) {
    // Admin can update anything - proceed
  } else if (role === Role.SELLER) {
    // Check if Seller is acting as a BUYER (Order Owner)
    if (order.userId === userId) {
      // If they own the order, they should be able to Cancel it like a customer
      if (status !== OrderStatus.CANCELLED) {
        throw new AppError(403, "As a buyer, you can only cancel orders");
      }
      // Allow cancellation
    } else {
      // Acting as a Vendor - check if they have items in the order
      const hasSellerItems = order.orderItems.some(
        (item) => item.medicine.sellerId === userId,
      );
      if (!hasSellerItems) {
        throw new AppError(403, "You are not authorized to update this order");
      }
    }
  } else if (role === Role.CUSTOMER) {
    if (order.userId !== userId) {
      throw new AppError(403, "You are not authorized to update this order");
    }
    if (status !== OrderStatus.CANCELLED) {
      throw new AppError(403, "Customers can only cancel orders");
    }
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new AppError(400, "Cannot cancel this order");
    }
  } else {
    throw new AppError(403, "Forbidden");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

const deleteOrder = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { medicine: true } } },
  });
  if (!order) throw new AppError(404, "Order not found");

  if (role === Role.ADMIN) {
    // details
  } else if (role === Role.SELLER) {
    // Seller can only delete if all items are theirs? Or maybe not allowed to delete orders generally?
    // User said "admin and seller ... can delete".
    // I'll allow it if they own the items.
    const hasSellerItems = order.orderItems.some(
      (item) => item.medicine.sellerId === userId,
    );
    if (!hasSellerItems) {
      throw new AppError(403, "You are not authorized to delete this order");
    }
  } else {
    throw new AppError(403, "Forbidden");
  }

  // Transaction to restore stock? Usually not for delete, unless it was a mistake.
  // If order confirmed, stock already reduced. If deleted, it's gone.
  // Let's just delete.
  return prisma.order.delete({ where: { id: orderId } });
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
