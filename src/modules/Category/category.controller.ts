import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { requireParam } from "../../utils/requireParam";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../lib/cloudinary";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "categories");
  }

  const payload = {
    ...req.body,
    image: uploadedImage?.secureUrl,
    imagePublicId: uploadedImage?.publicId,
  };

  try {
    const result = await CategoryService.createCategory(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = requireParam(req.params.id, "id");
  const image = req.files?.image as UploadedFile | undefined;
  let uploadedImage:
    | {
        secureUrl: string;
        publicId: string;
      }
    | undefined;

  if (image) {
    uploadedImage = await uploadImageToCloudinary(image.data, "categories");
  }

  const payload = {
    ...req.body,
    ...(uploadedImage
      ? { image: uploadedImage.secureUrl, imagePublicId: uploadedImage.publicId }
      : {}),
  };

  try {
    const result = await CategoryService.updateCategory(id, payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    if (uploadedImage?.publicId) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
    }
    throw error;
  }
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = requireParam(req.params.id, "id");
  const result = await CategoryService.deleteCategory(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const CategoryController = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

