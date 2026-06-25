const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const PROFILE_PICTURE_OUTPUT_SIZE = 256;
export const PROFILE_PICTURE_CROP_VIEWPORT = 280;

export type ProfilePictureContentType = "image/jpeg" | "image/png" | "image/webp";

export interface ProfilePictureCrop {
  x: number;
  y: number;
  zoom: number;
}

export function validateProfilePictureFile(file: File): ProfilePictureContentType {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }
  return file.type as ProfilePictureContentType;
}

export function profilePictureContentType(file: File): ProfilePictureContentType {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

export function getCoverScale(
  mediaWidth: number,
  mediaHeight: number,
  cropSize: number,
  zoom: number
): number {
  return zoom * Math.max(cropSize / mediaWidth, cropSize / mediaHeight);
}

export function clampCropPosition(
  mediaWidth: number,
  mediaHeight: number,
  crop: ProfilePictureCrop,
  cropSize = PROFILE_PICTURE_CROP_VIEWPORT
): ProfilePictureCrop {
  const scale = getCoverScale(mediaWidth, mediaHeight, cropSize, crop.zoom);
  const displayWidth = mediaWidth * scale;
  const displayHeight = mediaHeight * scale;

  const minX = (cropSize - displayWidth) / 2;
  const maxX = (displayWidth - cropSize) / 2;
  const minY = (cropSize - displayHeight) / 2;
  const maxY = (displayHeight - cropSize) / 2;

  return {
    ...crop,
    x: Math.min(maxX, Math.max(minX, crop.x)),
    y: Math.min(maxY, Math.max(minY, crop.y)),
  };
}

export function getCropPixels(
  mediaWidth: number,
  mediaHeight: number,
  crop: ProfilePictureCrop,
  cropSize = PROFILE_PICTURE_CROP_VIEWPORT
): { x: number; y: number; width: number; height: number } {
  const scale = getCoverScale(mediaWidth, mediaHeight, cropSize, crop.zoom);
  const displayWidth = mediaWidth * scale;
  const displayHeight = mediaHeight * scale;
  const imageLeft = (cropSize - displayWidth) / 2 + crop.x;
  const imageTop = (cropSize - displayHeight) / 2 + crop.y;

  return {
    x: (-imageLeft) / scale,
    y: (-imageTop) / scale,
    width: cropSize / scale,
    height: cropSize / scale,
  };
}

export async function exportCroppedProfilePicture(
  imageSrc: string,
  crop: ProfilePictureCrop,
  contentType: ProfilePictureContentType
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const pixels = getCropPixels(image.naturalWidth, image.naturalHeight, crop);

  const canvas = document.createElement("canvas");
  canvas.width = PROFILE_PICTURE_OUTPUT_SIZE;
  canvas.height = PROFILE_PICTURE_OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }

  ctx.drawImage(
    image,
    pixels.x,
    pixels.y,
    pixels.width,
    pixels.height,
    0,
    0,
    PROFILE_PICTURE_OUTPUT_SIZE,
    PROFILE_PICTURE_OUTPUT_SIZE
  );

  const outputType: ProfilePictureContentType =
    contentType === "image/png"
      ? "image/png"
      : contentType === "image/webp"
        ? "image/webp"
        : "image/jpeg";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not process image."));
      },
      outputType,
      0.9
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}
