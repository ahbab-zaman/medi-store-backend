import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user.email;
  const result = await UserService.updateMyProfile(userEmail, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  updateMyProfile,
};
