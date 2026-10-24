import type { ChipProps } from "@mui/material";
import type { DiscountStatus } from "./api";

export const DISCOUNT_STATUS_LABEL: Record<DiscountStatus, string> = {
  active: "Активна",
  paused: "На паузе",
};

export const DISCOUNT_STATUS_COLOR: Record<DiscountStatus, ChipProps["color"]> = {
  active: "success",
  paused: "default",
};

export const DISCOUNT_STATUSES: DiscountStatus[] = ["active", "paused"];
