import express from "express";
import { AddressController } from "./address.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Define /areas before /:id to prevent route clash
router.get("/areas", AddressController.getAreas);

router.get("/", auth(), AddressController.getMyAddresses);
router.get("/:id", auth(), AddressController.getAddressById);
router.post("/", auth(), AddressController.createAddress);
router.patch("/:id", auth(), AddressController.updateAddress);
router.delete("/:id", auth(), AddressController.deleteAddress);

export const AddressRoutes = router;
