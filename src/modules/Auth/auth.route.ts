import express from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  AuthController.forgotPassword,
);
router.post("/reset-password", AuthController.resetPassword);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", auth(), AuthController.logout);
router.get("/me", auth(), AuthController.getMe);

export const AuthRoutes = router;
