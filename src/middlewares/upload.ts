import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directories exist
const medicinesDir = path.join(uploadDir, "medicines");
const categoriesDir = path.join(uploadDir, "categories");
[uploadDir, medicinesDir, categoriesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/* -------------------------------------------------------------------------- */
/*                    MULTER – medicines (direct save, easy to see)           */
/* -------------------------------------------------------------------------- */

const medicineStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, medicinesDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

/** Use this for medicine create/update – saves directly to uploads/medicines/ */
export const uploadMedicine = multer({
  storage: medicineStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* -------------------------------------------------------------------------- */
/*                    MULTER – categories (for existing flows)               */
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
