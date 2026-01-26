import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Assuming the user is authenticated and req.user is populated by auth middleware
  const userEmail = req.user.email;

  await AuthService.logoutUser(userEmail);

  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  // Just return the decoded user info or fetch full details.
  // "Get current user" usually implies fetching DB data.
  // For now I'll use the decoded data or keys.
  // Let's fetch from DB to be clean if needed, but req.user has role/email.
  // I will just return req.user for lightweight, or maybe the service calls DB.
  // Let's keep it simple: return request user.
  // Wait, the endpoint is GET /api/auth/me.

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: req.user,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
