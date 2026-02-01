import express from "express";
import { CartController } from "./cart.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// All cart routes require authentication
router.get("/", auth(), CartController.getCart);
router.post("/add", auth(), CartController.addToCart);
router.put("/update", auth(), CartController.updateCartItem);
router.delete("/remove/:medicineId", auth(), CartController.removeFromCart);
router.delete("/clear", auth(), CartController.clearCart);
router.post("/sync", auth(), CartController.syncCart);

export const CartRoutes = router;
