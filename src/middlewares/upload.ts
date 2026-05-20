import fileUpload, { UploadedFile } from "express-fileupload";
import { RequestHandler } from "express";
import AppError from "../errors/AppError";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

export const fileUploadMiddleware = fileUpload({
  useTempFiles: false,
  limits: { fileSize: MAX_IMAGE_SIZE },
  abortOnLimit: true,
  createParentPath: false,
  parseNested: true,
  safeFileNames: true,
  preserveExtension: true,
});

const validateImageFile = (file?: UploadedFile | UploadedFile[]) => {
  if (!file) return;
  if (Array.isArray(file)) {
    throw new AppError(400, "Only one image file is allowed");
  }

  if (!file.mimetype?.startsWith("image/")) {
    throw new AppError(400, "Invalid file type. Only image uploads are allowed");
  }

  if (file.size <= 0) {
    throw new AppError(400, "Uploaded image is empty");
  }
};

const singleImageField = (fieldName: string): RequestHandler => {
  return (req, _res, next) => {
    validateImageFile(req.files?.[fieldName]);
    next();
  };
};

export const uploadMedicineImage = singleImageField("image");
export const uploadCategoryImage = singleImageField("image");

