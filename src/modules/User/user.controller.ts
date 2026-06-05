import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { UserValidation } from "./user.validation";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user.email;

  // Validate request body
  const validated = UserValidation.updateProfileSchema.parse({
    body: req.body,
  });

  const result = await UserService.updateMyProfile(userEmail, validated.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user.email;

  // Validate request body
  const validated = UserValidation.changePasswordSchema.parse({
    body: req.body,
  });

  const result = await UserService.changePassword(userEmail, validated.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

export const UserController = {
  updateMyProfile,
  changePassword,
};
