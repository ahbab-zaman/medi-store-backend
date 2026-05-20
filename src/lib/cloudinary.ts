import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import AppError from "../errors/AppError";

const cloudName = config.cloudinary.cloud_name;
const apiKey = config.cloudinary.api_key;
const apiSecret = config.cloudinary.api_secret;

if (!cloudName || !apiKey || !apiSecret) {
  throw new AppError(
    500,
    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  folder: "medicines" | "categories",
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `medistore/${folder}`,
        resource_type: "image",
      },
      (error: any, result: any) => {
        if (error || !result) {
          return reject(
            new AppError(502, `Cloudinary upload failed: ${error?.message}`),
          );
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(fileBuffer);
  });
};

export const deleteImageFromCloudinary = async (publicId?: string | null) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error: any) {
    throw new AppError(
      502,
      `Cloudinary delete failed for image ${publicId}: ${error?.message}`,
    );
  }
};
