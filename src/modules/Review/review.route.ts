import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Public/Authenticated User Routes
router.post(
  "/",
  auth("CUSTOMER", "SELLER", "ADMIN"),
  ReviewController.createReview,
);
router.get("/medicine/:medicineId", ReviewController.getMedicineReviews);

// Admin Routes
router.get("/admin/all", auth("ADMIN"), ReviewController.getAllReviewsForAdmin);
router.patch(
  "/admin/:id/status",
  auth("ADMIN"),
  ReviewController.updateReviewStatus,
);
router.delete("/admin/:id", auth("ADMIN"), ReviewController.deleteReview);

export const ReviewRoutes = router;
