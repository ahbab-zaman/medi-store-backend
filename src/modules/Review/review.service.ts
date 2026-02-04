import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";

const createReview = async (
  userId: string,
  medicineId: string,
  payload: { rating: number; comment: string },
) => {
  // Check if medicine exists
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) {
    throw new AppError(404, "Medicine not found");
  }

  // Check if user already reviewed this medicine (optional, but good practice)
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      medicineId,
    },
  });

  if (existingReview) {
    throw new AppError(400, "You have already reviewed this medicine");
  }

  return prisma.review.create({
    data: {
      userId,
      medicineId,
      rating: payload.rating,
      comment: payload.comment,
      status: "PENDING",
    },
  });
};

const getMedicineReviews = async (medicineId: string) => {
  return prisma.review.findMany({
    where: {
      medicineId,
      status: "APPROVED",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllReviewsForAdmin = async () => {
  return prisma.review.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      medicine: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateReviewStatus = async (id: string, status: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return prisma.review.update({
    where: { id },
    data: { status },
  });
};

const deleteReview = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return prisma.review.delete({
    where: { id },
  });
};

export const ReviewService = {
  createReview,
  getMedicineReviews,
  getAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
};
