import express from "express";
import { MedicineController } from "./medicine.controller";
import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";

const router = express.Router();

// Public medicine listing and details
router.get("/", MedicineController.getAllMedicines);
router.get("/:id", MedicineController.getMedicineById);

// Seller routes - manage own medicines and stock
router.post(
  "/seller",
  auth("SELLER"),
  upload.single("image"),
  MedicineController.createMedicine,
);
router.put(
  "/seller/:id",
  auth("SELLER"),
  upload.single("image"),
  MedicineController.updateMedicine,
);
router.delete(
  "/seller/:id",
  auth("SELLER"),
  MedicineController.deleteMedicine,
);

// Admin view all medicines
router.get(
  "/admin/all",
  auth("ADMIN"),
  MedicineController.getAllMedicinesForAdmin,
);

export const MedicineRoutes = router;

