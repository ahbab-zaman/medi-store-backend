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
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0d9488; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
        .order-info { background-color: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #eee; }
        .order-info p { margin: 8px 0; color: #555; font-size: 15px; }
        .order-info strong { color: #333; font-weight: 600; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; }
        th { text-align: left; padding: 15px; border-bottom: 2px solid #0d9488; color: #0d9488; font-size: 13px; text-transform: uppercase; font-weight: 700; }
        td { padding: 15px; border-bottom: 1px solid #eee; color: #444; font-size: 15px; }
        .total-section { text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; }
        .grand-total { font-size: 24px; font-weight: bold; color: #0d9488; margin-top: 10px; }
        .footer { text-align: center; margin-top: 50px; color: #999; font-size: 13px; border-top: 1px solid #eee; padding-top: 30px; }
        .highlight { color: #0d9488; font-weight: bold; }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div class="container">
        <div class="header">
          <h1>Medi Store</h1>
        </div>
        
        <div class="order-info">
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Thank you for choosing Medi Store! Your order has been successfully placed.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
          <p><strong>Order ID:</strong> #${result.id.slice(0, 8)}</p>
          <p><strong>Order Status:</strong> <span class="highlight">Pending</span></p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>

        <h3>Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${result.orderItems
              .map(
                (item) => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.medicine.name}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">৳${item.price.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">৳${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <p style="font-size: 16px; margin: 5px 0;">Subtotal: ৳${totalAmount.toFixed(2)}</p>
          <p style="font-size: 16px; margin: 5px 0;">Shipping: ৳0.00</p>
          <div class="grand-total">Total: ৳${totalAmount.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>We'll notify you as soon as your order is on its way!</p>
          <p style="margin-top: 20px;">
            Need help? Contact us at <a href="mailto:support@medistore.com" style="color: #0d9488; text-decoration: none;">support@medistore.com</a>
          </p>
          <p>&copy; ${new Date().getFullYear()} Medi Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
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

  console.log("Update Order Debug:", {
    orderId,
    userId,
    userRole: role,
    targetStatus: status,
    orderOwnerId: order.userId,
    isAdmin: role === Role.ADMIN,
    isSeller: role === Role.SELLER,
    isOwner: order.userId === userId,
  });

  if (role === Role.ADMIN || role === Role.SELLER) {
    // Admin and Seller can update anything - proceed
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

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Permission Checks
  if (role === Role.ADMIN || role === Role.SELLER) {
    // Admin and Seller can delete any order
  } else {
    throw new AppError(403, "You do not have permission to delete orders.");
  }

  // Deletion with transaction to handle cascade manually (as not set in schema)
  return await prisma.$transaction(async (tx) => {
    // 1. Delete associated OrderItems first
    await tx.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    // 2. Delete the Order
    return await tx.order.delete({
      where: { id: orderId },
    });
  });
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
