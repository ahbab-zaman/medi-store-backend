import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { medicineId, rating, comment } = req.body;

  const result = await ReviewService.createReview(userId, medicineId, {
    rating,
    comment,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully! Waiting for admin approval.",
    data: result,
  });
});

const getMedicineReviews = catchAsync(async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const result = await ReviewService.getMedicineReviews(medicineId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getAllReviewsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviewsForAdmin();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All reviews retrieved successfully",
      data: result,
    });
  },
);

const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await ReviewService.updateReviewStatus(id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review status updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.deleteReview(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getMedicineReviews,
  getAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
};
