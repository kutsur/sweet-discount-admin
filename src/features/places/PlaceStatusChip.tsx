import { Chip } from "@mui/material";
import type { PlaceStatus } from "./api";
import { PLACE_STATUS_COLOR, PLACE_STATUS_LABEL } from "./placeStatus";

interface PlaceStatusChipProps {
  status: PlaceStatus;
  deletedAt?: string | null;
}

export function PlaceStatusChip({ status, deletedAt }: PlaceStatusChipProps) {
  if (deletedAt) {
    return <Chip size="small" label="Deleted" />;
  }
  return <Chip size="small" label={PLACE_STATUS_LABEL[status]} color={PLACE_STATUS_COLOR[status]} />;
}
