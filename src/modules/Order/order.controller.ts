import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderService } from "./order.service";
import { Role } from "../../../generated/prisma/client";
import { requireParam } from "../../utils/requireParam";

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

const getOrders = catchAsync(async (req: Request, res: Response) => {
  const { role, id } = req.user;
  let result;

  if (role === Role.ADMIN) {
    result = await OrderService.getAllOrders();
  } else if (role === Role.SELLER) {
    if (req.query.sellerView === "true") {
      result = await OrderService.getAllOrders();
    } else {
      result = await OrderService.getUserOrders(id);
    }
  } else {
    result = await OrderService.getUserOrders(id);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = requireParam(req.params.id, "id");
  const { id: userId, role } = req.user;
  const result = await OrderService.getOrderById(id, userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order details retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const id = requireParam(req.params.id, "id");
  const { id: userId, role } = req.user;
  const { status } = req.body;

  const result = await OrderService.updateOrderStatus(id, userId, role, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const id = requireParam(req.params.id, "id");
  const { id: userId, role } = req.user;

  await OrderService.deleteOrder(id, userId, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order deleted successfully",
    data: null,
  });
});

export const OrderController = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
