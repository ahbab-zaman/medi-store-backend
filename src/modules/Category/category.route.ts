import express from "express";
import { CategoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";

const router = express.Router();

// Public
router.get("/", CategoryController.getAllCategories);

// Admin only
router.post("/", auth("ADMIN"), CategoryController.createCategory);
router.put("/:id", auth("ADMIN"), CategoryController.updateCategory);
router.delete("/:id", auth("ADMIN"), CategoryController.deleteCategory);

export const CategoryRoutes = router;
