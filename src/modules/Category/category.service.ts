import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";

export interface CreateCategoryInput {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
}

const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createCategory = async (payload: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existing) {
    throw new AppError(409, "Category with this name already exists");
  }

  return prisma.category.create({
    data: {
      name: payload.name,
      description: payload.description,
      image: payload.image,
    },
  });
};

const updateCategory = async (id: string, payload: UpdateCategoryInput) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      description: payload.description ?? existing.description,
      image: payload.image ?? existing.image,
    },
  });
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });

  return {
    message: "Category deleted successfully",
  };
};

export const CategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
