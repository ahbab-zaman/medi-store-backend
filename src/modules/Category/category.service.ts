import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { deleteImageFromCloudinary } from "../../lib/cloudinary";

export interface CreateCategoryInput {
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
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
      imagePublicId: payload.imagePublicId,
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

  const oldImagePublicId = existing.imagePublicId;

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      description: payload.description ?? existing.description,
      image: payload.image ?? existing.image,
      imagePublicId: payload.imagePublicId ?? existing.imagePublicId,
    },
  });

  if (payload.imagePublicId && oldImagePublicId) {
    await deleteImageFromCloudinary(oldImagePublicId);
  }

  return updated;
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });

  if (!existing) {
    throw new AppError(404, "Category not found");
  }

  if (existing._count.medicines > 0) {
    throw new AppError(
      409,
      "Cannot delete category because medicines are linked to it"
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  if (existing.imagePublicId) {
    await deleteImageFromCloudinary(existing.imagePublicId);
  }

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
