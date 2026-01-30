import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import AppError from "../../errors/AppError";

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
  // If a valid refresh token cookie already exists, treat the user as
  // "already logged in" and block repeated logins until they logout.
  const existingRefreshToken = req.cookies?.refreshToken;

  if (existingRefreshToken) {
    try {
      // This will throw if the refresh token is invalid/expired/mismatched.
      await AuthService.refreshToken(existingRefreshToken);

      // If we reached here, the refresh token is valid and user is logged in.
      throw new AppError(
        400,
        "You are already logged in. Please logout first to login again.",
      );
    } catch (error) {
      // If the refresh token is invalid or user not found, allow normal login.
      // Re-throw any non-AuthError or unexpected server-side issues.
      if (error instanceof AppError && [401, 404].includes(error.statusCode)) {
        // ignore and continue to login
      } else if (error instanceof AppError && error.statusCode === 400) {
        // our own "already logged in" error, rethrow so it bubbles to handler
        throw error;
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw error;
      }
    }
  }

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
  const { accessToken, refreshToken: newRefreshToken } = result;

  // If we rotated the refresh token, update the cookie transparently.
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token retrieved successfully!",
    data: {
      accessToken,
    },
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
  // Fetch full user profile from DB using id or email from decoded token
  const { id, email } = req.user as { id?: string; email?: string };
  const user = await AuthService.getMe({ id, email });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
