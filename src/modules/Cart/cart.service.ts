import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import {
  AddToCartPayload,
  UpdateCartItemPayload,
  SyncCartPayload,
  CartResponse,
} from "./cart.interface";

const getCart = async (userId: string): Promise<CartResponse> => {
  // Find or create cart for user
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          medicine: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            medicine: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Calculate totals
  const totalItems = cart.items.reduce(
    (sum: number, item) => sum + item.quantity,
    0,
  );
  const totalAmount = cart.items.reduce(
    (sum: number, item) => sum + item.medicine.price * item.quantity,
    0,
  );

  return {
    ...cart,
    totalItems,
    totalAmount,
  };
};

const addToCart = async (
  userId: string,
  payload: AddToCartPayload,
): Promise<CartResponse> => {
  const { medicineId, quantity } = payload;

  // Validate quantity
  if (quantity <= 0) {
    throw new AppError(400, "Quantity must be greater than 0");
  }

  // Check if medicine exists and has enough stock
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  if (medicine.stock < quantity) {
    throw new AppError(400, `Only ${medicine.stock} items available in stock`);
  }

  // Find or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_medicineId: {
        cartId: cart.id,
        medicineId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (medicine.stock < newQuantity) {
      throw new AppError(
        400,
        `Only ${medicine.stock} items available in stock`,
      );
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        medicineId,
        quantity,
      },
    });
  }

  // Return updated cart
  return getCart(userId);
};

const updateCartItem = async (
  userId: string,
  payload: UpdateCartItemPayload,
): Promise<CartResponse> => {
  const { medicineId, quantity } = payload;

  // If quantity is 0 or less, remove the item
  if (quantity <= 0) {
    return removeFromCart(userId, medicineId);
  }

  // Check if medicine exists and has enough stock
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  if (medicine.stock < quantity) {
    throw new AppError(400, `Only ${medicine.stock} items available in stock`);
  }

  // Find cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(404, "Cart not found");
  }

  // Update cart item
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_medicineId: {
        cartId: cart.id,
        medicineId,
      },
    },
  });

  if (!cartItem) {
    throw new AppError(404, "Item not found in cart");
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  // Return updated cart
  return getCart(userId);
};

const removeFromCart = async (
  userId: string,
  medicineId: string,
): Promise<CartResponse> => {
  // Find cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(404, "Cart not found");
  }

  // Delete cart item
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      medicineId,
    },
  });

  // Return updated cart
  return getCart(userId);
};

const clearCart = async (userId: string): Promise<CartResponse> => {
  // Find cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(404, "Cart not found");
  }

  // Delete all cart items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  // Return updated cart
  return getCart(userId);
};

const syncCart = async (
  userId: string,
  payload: SyncCartPayload,
): Promise<CartResponse> => {
  const { items } = payload;

  // Find or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Clear existing cart items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  // Add new items with stock validation
  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId },
    });

    if (!medicine) {
      continue; // Skip invalid medicines
    }

    // Cap quantity at available stock
    const quantity = Math.min(item.quantity, medicine.stock);

    if (quantity > 0) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          medicineId: item.medicineId,
          quantity,
        },
      });
    }
  }

  // Return updated cart
  return getCart(userId);
};

export const CartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
