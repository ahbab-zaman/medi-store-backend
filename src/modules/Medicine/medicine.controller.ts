import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MedicineService } from "./medicine.service";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../lib/cloudinary";

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
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "medicines");
  }

  const payload = {
    ...req.body,
    imageUrl: uploadedImage?.secureUrl,
    imagePublicId: uploadedImage?.publicId,
  };

  try {
    const result = await MedicineService.createMedicine(sellerEmail, payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Medicine created successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
});

const updateMedicine = catchAsync(async (req: Request, res: Response) => {
  const sellerEmail = req.user.email;
  const { id } = req.params;
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "medicines");
  }

  const payload = {
    ...req.body,
    ...(uploadedImage
      ? {
          imageUrl: uploadedImage.secureUrl,
          imagePublicId: uploadedImage.publicId,
        }
      : {}),
  };

  try {
    const result = await MedicineService.updateMedicine(id, sellerEmail, payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Medicine updated successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
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

const createMedicineAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const adminEmail = req.user.email;
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "medicines");
  }

  const payload = {
    ...req.body,
    imageUrl: uploadedImage?.secureUrl,
    imagePublicId: uploadedImage?.publicId,
  };

  try {
    const result = await MedicineService.createMedicineAsAdmin(
      adminEmail,
      payload,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Medicine created successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
});

const updateMedicineAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const adminEmail = req.user.email;
  const { id } = req.params;
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "medicines");
  }

  const payload = {
    ...req.body,
    ...(uploadedImage
      ? {
          imageUrl: uploadedImage.secureUrl,
          imagePublicId: uploadedImage.publicId,
        }
      : {}),
  };

  try {
    const result = await MedicineService.updateMedicineAsAdmin(
      id,
      adminEmail,
      payload,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Medicine updated successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
});

const deleteMedicineAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const adminEmail = req.user.email;
  const { id } = req.params;
  const result = await MedicineService.deleteMedicineAsAdmin(id, adminEmail);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Medicine deleted successfully",
    data: result,
  });
});

export const MedicineController = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicinesForAdmin,
  createMedicineAsAdmin,
  updateMedicineAsAdmin,
  deleteMedicineAsAdmin,
};
