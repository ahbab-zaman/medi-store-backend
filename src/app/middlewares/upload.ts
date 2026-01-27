import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Request } from "express";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const processAndSaveImage = async (
  file: Express.Multer.File,
  subfolder: "medicines" | "categories",
) => {
  const folderPath = path.join(uploadDir, subfolder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.originalname.split(".")[0]}.webp`;
  const filePath = path.join(folderPath, fileName);

  await sharp(file.buffer)
    .rotate()
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(filePath);

  // Return relative path that can be served statically
  return `/uploads/${subfolder}/${fileName}`;
};

