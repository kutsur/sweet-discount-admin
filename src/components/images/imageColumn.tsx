import { Box } from "@mui/material";
import type { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import type { Image } from "./api";
import { ImageThumb } from "./ImageThumb";

/** The thumbnail column every grid of rows with an `image` shares. */
export function imageColumn<R extends GridValidRowModel & { image: Image | null }>(): GridColDef<R> {
  return {
    field: "image",
    headerName: "",
    width: 56,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
        <ImageThumb image={params.row.image} />
      </Box>
    ),
  };
}
