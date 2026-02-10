import { put, PutBlobResult } from "@vercel/blob";

export const uploadToBlob = async (dataUrl: string): Promise<PutBlobResult> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const uploadResult = await put(`image-${Date.now()}.jpg`, blob, {
    access: "public",
    addRandomSuffix: true,
  });

  return uploadResult;
};