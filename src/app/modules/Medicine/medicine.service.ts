import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";

export interface CreateMedicineInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  expiryDate?: string;
  categoryId: string;
  imageUrl?: string;
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
}

export interface MedicineQuery {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
}

const getAllMedicines = async (query: MedicineQuery) => {
  const { search, categoryId, minPrice, maxPrice } = query;

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

const createMedicine = async (sellerEmail: string, payload: CreateMedicineInput) => {
  const seller = await prisma.user.findUnique({
    where: { email: sellerEmail },
  });

  if (!seller) {
    throw new AppError(404, "Seller not found");
  }

  const { expiryDate, ...rest } = payload;

  return prisma.medicine.create({
    data: {
      ...rest,
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

  // Ensure seller can only modify their own medicines
  if (medicine.sellerId !== seller.id) {
    throw new AppError(403, "You are not allowed to modify this medicine");
  }

  const { expiryDate, ...rest } = payload;

  return prisma.medicine.update({
    where: { id },
    data: {
      ...rest,
      expiryDate: expiryDate ? new Date(expiryDate) : medicine.expiryDate,
    },
  });
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

  if (medicine.sellerId !== seller.id) {
    throw new AppError(403, "You are not allowed to delete this medicine");
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

export const MedicineService = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicinesForAdmin,
};

