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

const updateUserBanStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isBanned } = req.body as { isBanned: boolean };

    const result = await AdminService.updateUserBanStatus(id as string, isBanned);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
      data: result,
    });
  },
);

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllOrders();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserBanStatus,
  getAllOrders,
};

