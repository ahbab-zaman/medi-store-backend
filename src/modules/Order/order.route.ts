import express from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth("CUSTOMER"), OrderController.createOrder);

router.get("/seller", auth("SELLER", "ADMIN"), OrderController.getSellerOrders);

router.patch(
  "/seller/:id",
  auth("SELLER", "ADMIN"),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
