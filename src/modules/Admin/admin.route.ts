import express from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

// Get all users
router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);

// Update user ban status
router.patch(
  "/users/:id/ban",
  auth(Role.ADMIN),
  AdminController.updateUserBanStatus,
);

// Update user role
router.patch(
  "/users/:id/role",
  auth(Role.ADMIN),
  AdminController.updateUserRole,
);

// Delete user
router.delete("/users/:id", auth(Role.ADMIN), AdminController.deleteUser);

// Get all orders
router.get("/orders", auth(Role.ADMIN), AdminController.getAllOrders);

// Update order status - THIS IS YOUR PROBLEM LINE
router.patch(
  "/orders/:id",
  auth(Role.ADMIN),
  AdminController.updateOrderStatus,
);

// Delete order
router.delete("/orders/:id", auth(Role.ADMIN), AdminController.deleteOrder);

export const AdminRoutes = router;
