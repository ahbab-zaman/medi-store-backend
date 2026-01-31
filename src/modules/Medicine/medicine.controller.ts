import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MedicineService } from "./medicine.service";

const getAllMedicines = catchAsync(async (req: Request, res: Response) => {
  const result = await MedicineService.getAllMedicines(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medicines retrieved successfully",
    data: result,
  });
});

const getMedicineById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MedicineService.getMedicineById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medicine details retrieved successfully",
    data: result,
  });
});

const createMedicine = catchAsync(async (req: Request, res: Response) => {
  const sellerEmail = req.user.email;

  // Multer saves directly to uploads/medicines/ – URL path for frontend
  const imageUrl = req.file
    ? `/uploads/medicines/${req.file.filename}`
    : undefined;

  const payload = {
    ...req.body,
    imageUrl,
  };

  const result = await MedicineService.createMedicine(sellerEmail, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Medicine created successfully",
    data: result,
  });
});

const updateMedicine = catchAsync(async (req: Request, res: Response) => {
  const sellerEmail = req.user.email;
  const { id } = req.params;

  const imageUrl = req.file
    ? `/uploads/medicines/${req.file.filename}`
    : undefined;

  const payload = {
    ...req.body,
    ...(imageUrl ? { imageUrl } : {}),
  };

  const result = await MedicineService.updateMedicine(id, sellerEmail, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medicine updated successfully",
    data: result,
  });
});

const deleteMedicine = catchAsync(async (req: Request, res: Response) => {
  const sellerEmail = req.user.email;
  const { id } = req.params;
  const result = await MedicineService.deleteMedicine(id, sellerEmail);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medicine deleted successfully",
    data: result,
  });
});

const getAllMedicinesForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MedicineService.getAllMedicinesForAdmin();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All medicines (admin) retrieved successfully",
      data: result,
    });
  },
);

export const MedicineController = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicinesForAdmin,
};

