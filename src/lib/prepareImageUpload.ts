/** Mirrors the backend's limits (internal/media): larger files or canvases are refused. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
/** The server stores at most this long an edge, so sending more is wasted bandwidth. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.9;
const SERVER_TYPES = new Set(["image/jpeg", "image/png"]);

/**
 * Shrinks a picked photo before upload. A phone photo is often 4000×3000 and 8 MB — over
 * both server limits — so anything larger than the stored size, over the byte cap, or in
 * a format the server doesn't take (WebP, HEIC where the browser can decode it) is drawn
 * onto a canvas and re-encoded as JPEG. A file already small enough goes as-is.
 */
export async function prepareImageUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new Error("Браузер не может прочитать этот файл. Используйте JPEG или PNG.");
  });

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && SERVER_TYPES.has(file.type) && file.size <= MAX_UPLOAD_BYTES) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Не удалось подготовить изображение к загрузке.");

    // JPEG has no transparency: white, as the server would flatten it.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Не удалось подготовить изображение к загрузке.")),
        "image/jpeg",
        JPEG_QUALITY,
      ),
    );
  } finally {
    bitmap.close();
  }
}
