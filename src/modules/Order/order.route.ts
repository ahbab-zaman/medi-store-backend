import express from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN, Role.SELLER), // Anyone can order? Typically Customer.
  OrderController.createOrder,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.SELLER, Role.CUSTOMER),
  OrderController.getOrders,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.SELLER, Role.CUSTOMER),
  OrderController.getOrderById,
);

router.patch(
  "/:id",
  auth(Role.ADMIN, Role.SELLER, Role.CUSTOMER),
  OrderController.updateOrderStatus,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.SELLER),
  OrderController.deleteOrder,
);

export const OrderRoutes = router;
