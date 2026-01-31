import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserBanStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBanned } = req.body as { isBanned: boolean };

  const result = await AdminService.updateUserBanStatus(id as string, isBanned);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role: "ADMIN" | "SELLER" | "CUSTOMER" };

  const result = await AdminService.updateUserRole(id as string, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User role updated to ${role} successfully`,
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllOrders();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteUser(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await AdminService.updateOrderStatus(id as string, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteOrder(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserBanStatus,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
