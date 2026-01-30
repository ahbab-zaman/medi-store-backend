import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { processAndSaveImage } from "../../middlewares/upload";

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
  let imageUrl: string | undefined;

  if (req.file) {
    imageUrl = await processAndSaveImage(req.file, "categories");
  }

  const payload = {
    ...req.body,
    imageUrl,
  };

  const result = await CategoryService.createCategory(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let imageUrl: string | undefined;

  if (req.file) {
    imageUrl = await processAndSaveImage(req.file, "categories");
  }

  const payload = {
    ...req.body,
    ...(imageUrl ? { imageUrl } : {}),
  };

  const result = await CategoryService.updateCategory(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
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
