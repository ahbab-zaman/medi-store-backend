import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WishlistService } from "./wishlist.service";
import { requireParam } from "../../utils/requireParam";

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await WishlistService.getWishlist(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Wishlist retrieved successfully",
    data: result,
  });
});

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { medicineId } = req.body;
  const result = await WishlistService.addToWishlist(userId, medicineId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Item added to wishlist successfully",
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const medicineId = requireParam(req.params.medicineId, "medicineId");
  const result = await WishlistService.removeFromWishlist(userId, medicineId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Item removed from wishlist successfully",
    data: result,
  });
});

export const WishlistController = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
