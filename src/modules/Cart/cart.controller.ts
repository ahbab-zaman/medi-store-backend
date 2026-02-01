import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CartService } from "./cart.service";

const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartService.getCart(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartService.addToCart(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Item added to cart successfully",
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartService.updateCartItem(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { medicineId } = req.params;
  const result = await CartService.removeFromCart(userId, medicineId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Item removed from cart successfully",
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartService.clearCart(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart cleared successfully",
    data: result,
  });
});

const syncCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartService.syncCart(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cart synced successfully",
    data: result,
  });
});

export const CartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
