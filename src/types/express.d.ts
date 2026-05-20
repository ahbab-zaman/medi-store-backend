import { FileArray, UploadedFile } from "express-fileupload";

declare global {
  namespace Express {
    interface Request {
      file?: UploadedFile;
      files?: FileArray;
    }
  }
}

export {};
