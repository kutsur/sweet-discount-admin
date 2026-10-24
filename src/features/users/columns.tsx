import { ROLE_LABEL } from "../../auth/roles";
import { Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../lib/formatDate";
import type { AdminUser } from "./api";
import { StatusChip } from "./StatusChip";

// Sort/filter are off on every column: the API only supports limit/offset, no sort or search
// param. Data Grid Community's client-side sort/filter would silently only reorder the loaded
// page, misrepresenting the full dataset. Flip these on once the backend adds server-side params.
export const userColumns: GridColDef<AdminUser>[] = [
  { field: "email", headerName: "Эл. почта", flex: 1.5, minWidth: 220, sortable: false, filterable: false },
  {
    field: "display_name",
    headerName: "Имя",
    flex: 1,
    minWidth: 160,
    sortable: false,
    filterable: false,
  },
  {
    field: "role",
    headerName: "Роль",
    width: 130,
    sortable: false,
    filterable: false,
    renderCell: (params) => <Chip size="small" variant="outlined" label={ROLE_LABEL[params.row.role]} />,
  },
  {
    field: "status",
    headerName: "Статус",
    width: 130,
    sortable: false,
    filterable: false,
    renderCell: (params) => <StatusChip user={params.row} />,
  },
  {
    field: "created_at",
    headerName: "Создан",
    width: 180,
    sortable: false,
    filterable: false,
    valueFormatter: (value: string) => formatDate(value),
  },
];
