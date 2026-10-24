import { Chip } from "@mui/material";
import type { DiscountStatus } from "./api";
import { DISCOUNT_STATUS_COLOR, DISCOUNT_STATUS_LABEL } from "./discountStatus";

export function DiscountStatusChip({
  status,
  deletedAt,
}: {
  status: DiscountStatus;
  deletedAt?: string | null;
}) {
  if (deletedAt) {
    return <Chip size="small" label="Удалена" />;
  }
  return <Chip size="small" label={DISCOUNT_STATUS_LABEL[status]} color={DISCOUNT_STATUS_COLOR[status]} />;
}
