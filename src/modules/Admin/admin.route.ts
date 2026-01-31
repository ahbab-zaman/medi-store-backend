import express from "express";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = express.Router();

// Manage user status (ban/unban)
// Manage user status (ban/unban)
router.get("/users", auth("ADMIN"), AdminController.getAllUsers);
router.patch("/users/:id", auth("ADMIN"), AdminController.updateUserBanStatus);
router.put("/users/:id/role", auth("ADMIN"), AdminController.updateUserRole);
router.delete("/users/:id", auth("ADMIN"), AdminController.deleteUser);

// View all medicines and orders
router.get("/orders", auth("ADMIN"), AdminController.getAllOrders);
router.patch("/orders/:id", auth("ADMIN"), AdminController.updateOrderStatus);
router.delete("/orders/:id", auth("ADMIN"), AdminController.deleteOrder);

export const AdminRoutes = router;
