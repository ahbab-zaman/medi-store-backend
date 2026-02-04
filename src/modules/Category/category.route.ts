import express from "express";
import { CategoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import { upload, uploadCategory } from "../../middlewares/upload";

const router = express.Router();

// Public
router.get("/", CategoryController.getAllCategories);

// Admin only
router.post(
  "/",
  auth("ADMIN"),
  uploadCategory.single("image"),
  CategoryController.createCategory,
);
router.put(
  "/:id",
  auth("ADMIN"),
  uploadCategory.single("image"),
  CategoryController.updateCategory,
);
router.delete("/:id", auth("ADMIN"), CategoryController.deleteCategory);

export const CategoryRoutes = router;
