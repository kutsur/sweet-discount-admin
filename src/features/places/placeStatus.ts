import type { ChipProps } from "@mui/material";
import type { PlaceStatus } from "./api";

export const PLACE_STATUS_LABEL: Record<PlaceStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const PLACE_STATUS_COLOR: Record<PlaceStatus, ChipProps["color"]> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const PLACE_STATUSES: PlaceStatus[] = ["pending", "approved", "rejected"];
