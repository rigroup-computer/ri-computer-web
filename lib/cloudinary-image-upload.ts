import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary(): void {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name?.trim() || !api_key?.trim() || !api_secret?.trim()) {
    throw new Error(
      "Upload gambar tidak tersedia. Atur CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

/** Unggah buffer gambar ke folder Cloudinary; kembalikan URL delivery (f_auto, q_auto). */
export async function uploadImageBufferToFolder(
  buffer: Buffer,
  folder: string,
): Promise<string> {
  const result = await new Promise<{ public_id: string; version?: number }>(
    (resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        },
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          if (!res?.public_id) {
            reject(new Error("Upload gagal."));
            return;
          }
          resolve({
            public_id: res.public_id,
            version: typeof res.version === "number" ? res.version : undefined,
          });
        },
      );

      upload.end(buffer);
    },
  );

  return cloudinary.url(result.public_id, {
    secure: true,
    resource_type: "image",
    transformation: [{ fetch_format: "auto", quality: "auto" }],
    ...(typeof result.version === "number" ? { version: result.version } : {}),
  });
}
