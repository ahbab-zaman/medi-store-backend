import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads");

// ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* -------------------------------------------------------------------------- */
/*                              MULTER CONFIG                                 */
/* -------------------------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/*                         IMAGE PROCESSING HELPER                             */
/* -------------------------------------------------------------------------- */

export const processAndSaveImage = async (
  file: Express.Multer.File,
  folder: "categories" | "medicines",
): Promise<string> => {
  const outputDir = path.join(uploadDir, folder);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, file.filename);

  await sharp(file.path).resize(500, 500, { fit: "cover" }).toFile(outputPath);

  // delete original uploaded file
  fs.unlinkSync(file.path);

  return `/uploads/${folder}/${file.filename}`;
};
