import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary.js';
import AppError from '../errors/AppError.js';

interface UploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  fileSize: number,
  folder: string = 'tasks',
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `taskora/${folder}`,
          resource_type: 'auto',
          public_id: `${Date.now()}-${originalName.replace(/\s/g, '_')}`,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(new AppError('File upload failed', 500));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              fileName: originalName,
              fileType: mimeType,
              fileSize,
            });
          }
        },
      )
      .end(fileBuffer);
  });
};
