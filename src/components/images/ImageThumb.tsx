import ImageIcon from "@mui/icons-material/Image";
import { Avatar } from "@mui/material";
import type { Image } from "./api";

/** A list-row thumbnail, with a neutral placeholder when there is no picture. */
export function ImageThumb({ image, size = 36 }: { image: Image | null; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      src={image?.url}
      alt=""
      sx={{ width: size, height: size, bgcolor: "action.hover" }}
    >
      <ImageIcon fontSize="small" color="disabled" />
    </Avatar>
  );
}
