import { api } from "../../api/client";
import { unwrap } from "../../api/envelope";
import type { components } from "../../api/schema.gen";

export type Image = components["schemas"]["Image"];

/**
 * Step one of attaching a picture: upload it, then send the returned id as image_id on
 * the place or discount. The same endpoint serves every entity with a picture.
 */
export function uploadImage(file: Blob) {
  return unwrap<Image>(
    api.POST("/manage/images", {
      // The schema types `file` as a string (binary); the serializer sends the Blob.
      body: { file: "" },
      bodySerializer: () => {
        const form = new FormData();
        form.append("file", file, "upload");
        return form;
      },
    }),
  );
}
