import express from "express";
import { WishlistController } from "./wishlist.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// All wishlist routes require authentication
router.get("/", auth(), WishlistController.getWishlist);
router.post("/add", auth(), WishlistController.addToWishlist);
router.delete("/remove/:medicineId", auth(), WishlistController.removeFromWishlist);

export const WishlistRoutes = router;
