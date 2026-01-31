import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

const getSellerOrders = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id; // Assuming user is Seller
  const result = await OrderService.getSellerOrders(sellerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Seller orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sellerId = req.user.id;
  const { status } = req.body;

  const result = await OrderService.updateOrderStatus(id, sellerId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getSellerOrders,
  updateOrderStatus,
};
