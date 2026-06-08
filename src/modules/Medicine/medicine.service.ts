import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { deleteImageFromCloudinary } from "../../lib/cloudinary";
import { Role } from "../../generated/prisma";

export interface CreateMedicineInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  expiryDate?: string;
  categoryId: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface UpdateMedicineInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  manufacturer?: string;
  expiryDate?: string;
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface MedicineQuery {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sellerId?: string;
}

const getAllMedicines = async (query: MedicineQuery) => {
  const { search, categoryId, minPrice, maxPrice, sellerId } = query;

  const filters: any = {};

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { manufacturer: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    filters.categoryId = categoryId;
  }

  if (sellerId) {
    filters.sellerId = sellerId;
  }

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) {
      filters.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      filters.price.lte = parseFloat(maxPrice);
    }
  }

  return prisma.medicine.findMany({
    where: filters,
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMedicineById = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: true,
    },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  return medicine;
};

const createMedicine = async (
  sellerEmail: string,
  payload: CreateMedicineInput,
) => {
  const seller = await prisma.user.findUnique({
    where: { email: sellerEmail },
  });

  if (!seller) {
    throw new AppError(404, "Seller not found");
  }

  const { expiryDate, price, stock, ...rest } = payload;

  return prisma.medicine.create({
    data: {
      ...rest,
      price: parseFloat(price as unknown as string),
      stock: parseInt(stock as unknown as string),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      sellerId: seller.id,
    },
  });
};

const updateMedicine = async (
  id: string,
  sellerEmail: string,
  payload: UpdateMedicineInput,
) => {
  const seller = await prisma.user.findUnique({
    where: { email: sellerEmail },
  });

  if (!seller) {
    throw new AppError(404, "Seller not found");
  }

  const medicine = await prisma.medicine.findUnique({
    where: { id },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  if (seller.role !== Role.ADMIN && medicine.sellerId !== seller.id) {
    throw new AppError(403, "You are not allowed to modify this medicine");
  }

  const { expiryDate, price, stock, ...rest } = payload;
  const oldImagePublicId = medicine.imagePublicId;

  const updated = await prisma.medicine.update({
    where: { id },
    data: {
      ...rest,
      ...(price !== undefined && {
        price: parseFloat(price as unknown as string),
      }),
      ...(stock !== undefined && {
        stock: parseInt(stock as unknown as string),
      }),
      expiryDate: expiryDate ? new Date(expiryDate) : medicine.expiryDate,
    },
  });

  if (payload.imagePublicId && oldImagePublicId) {
    await deleteImageFromCloudinary(oldImagePublicId);
  }

  return updated;
};

const deleteMedicine = async (id: string, sellerEmail: string) => {
  const seller = await prisma.user.findUnique({
    where: { email: sellerEmail },
  });

  if (!seller) {
    throw new AppError(404, "Seller not found");
  }

  const medicine = await prisma.medicine.findUnique({
    where: { id },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  const [orderItemCount, reviewCount] = await Promise.all([
    prisma.orderItem.count({
      where: { medicineId: id },
    }),
    prisma.review.count({
      where: { medicineId: id },
    }),
  ]);

  // Keep order history intact: medicines used in orders cannot be hard-deleted.
  if (orderItemCount > 0) {
    throw new AppError(
      400,
      "This medicine cannot be deleted because it exists in customer orders. Set stock to 0 instead.",
    );
  }

  if (seller.role !== Role.ADMIN && medicine.sellerId !== seller.id) {
    throw new AppError(403, "You are not allowed to delete this medicine");
  }

  if (reviewCount > 0) {
    await prisma.review.deleteMany({
      where: { medicineId: id },
    });
  }

  if (medicine.imagePublicId) {
    await deleteImageFromCloudinary(medicine.imagePublicId);
  }

  await prisma.medicine.delete({
    where: { id },
  });

  return {
    message: "Medicine deleted successfully",
  };
};

const getAllMedicinesForAdmin = async () => {
  return prisma.medicine.findMany({
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createMedicineAsAdmin = async (
  adminEmail: string,
  payload: CreateMedicineInput,
) => {
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  return createMedicine(adminEmail, payload);
};

const updateMedicineAsAdmin = async (
  id: string,
  adminEmail: string,
  payload: UpdateMedicineInput,
) => {
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  return updateMedicine(id, adminEmail, payload);
};

const deleteMedicineAsAdmin = async (id: string, adminEmail: string) => {
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  return deleteMedicine(id, adminEmail);
};

export const MedicineService = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicinesForAdmin,
  createMedicineAsAdmin,
  updateMedicineAsAdmin,
  deleteMedicineAsAdmin,
};
