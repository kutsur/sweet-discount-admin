import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../lib/formatDate";
import type { ManagedPlaceListItem } from "./api";
import { PlaceStatusChip } from "./PlaceStatusChip";

interface BuildPlaceColumnsOptions {
  /** List rows carry city_id only; the picker's city list supplies the display name. */
  cityNameById: Map<string, string>;
  onDeleteRequest: (place: ManagedPlaceListItem) => void;
}

// Sort/filter are off on every column: the API takes limit/offset/city_id/status only,
// no sort param — same reasoning as the cities and users grids.
export function buildPlaceColumns({
  cityNameById,
  onDeleteRequest,
}: BuildPlaceColumnsOptions): GridColDef<ManagedPlaceListItem>[] {
  return [
    { field: "name", headerName: "Name", flex: 1, minWidth: 180, sortable: false, filterable: false },
    {
      field: "city_id",
      headerName: "City",
      width: 140,
      sortable: false,
      filterable: false,
      valueGetter: (value: string) => cityNameById.get(value) ?? "—",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <PlaceStatusChip status={params.row.status} deletedAt={params.row.deleted_at} />
      ),
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      valueGetter: (value: string | null) => value ?? "—",
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      sortable: false,
      filterable: false,
      valueGetter: (value: string | null) => value ?? "—",
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 180,
      sortable: false,
      filterable: false,
      valueFormatter: (value: string) => formatDate(value),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 56,
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          disabled={Boolean(params.row.deleted_at)}
          onClick={() => onDeleteRequest(params.row)}
        />,
      ],
    },
  ];
}
