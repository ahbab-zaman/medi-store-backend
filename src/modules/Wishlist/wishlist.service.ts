import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { WishlistResponse } from "./wishlist.interface";

const getWishlist = async (userId: string): Promise<WishlistResponse[]> => {
  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId },
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return wishlist as unknown as WishlistResponse[];
};

const addToWishlist = async (
  userId: string,
  medicineId: string,
): Promise<WishlistResponse> => {
  // Check if medicine exists
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  // Find or create wishlist item
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
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
  });

  if (existingItem) {
    return existingItem as unknown as WishlistResponse;
  }

  const newItem = await prisma.wishlistItem.create({
    data: {
      userId,
      medicineId,
    },
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
  });

  return newItem as unknown as WishlistResponse;
};

const removeFromWishlist = async (
  userId: string,
  medicineId: string,
): Promise<{ message: string }> => {
  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  if (!item) {
    throw new AppError(404, "Wishlist item not found");
  }

  await prisma.wishlistItem.delete({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  return { message: "Item removed from wishlist successfully" };
};

export const WishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
