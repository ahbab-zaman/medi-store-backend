import express from "express";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = express.Router();

// Manage user status (ban/unban)
router.get("/users", auth("ADMIN"), AdminController.getAllUsers);
router.patch(
  "/users/:id",
  auth("ADMIN"),
  AdminController.updateUserBanStatus,
);

// View all medicines and orders
router.get("/orders", auth("ADMIN"), AdminController.getAllOrders);

export const AdminRoutes = router;

