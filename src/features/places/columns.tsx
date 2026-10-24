import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { imageColumn } from "../../components/images/imageColumn";
import { formatDate } from "../../lib/formatDate";
import type { ManagedPlaceListItem } from "./api";
import { PlaceStatusChip } from "./PlaceStatusChip";

interface BuildPlaceColumnsOptions {
  /** List rows carry city_id only; the picker's city list supplies the display name. */
  cityNameById: Map<string, string>;
  /** Omitted for roles that may not delete places — the actions column is then left out. */
  onDeleteRequest?: (place: ManagedPlaceListItem) => void;
}

// Sort/filter are off on every column: the API takes limit/offset/city_id/status only,
// no sort param — same reasoning as the cities and users grids.
export function buildPlaceColumns({
  cityNameById,
  onDeleteRequest,
}: BuildPlaceColumnsOptions): GridColDef<ManagedPlaceListItem>[] {
  const columns: GridColDef<ManagedPlaceListItem>[] = [
    imageColumn<ManagedPlaceListItem>(),
    { field: "name", headerName: "Название", flex: 1, minWidth: 180, sortable: false, filterable: false },
    {
      field: "city_id",
      headerName: "Город",
      width: 140,
      sortable: false,
      filterable: false,
      valueGetter: (value: string) => cityNameById.get(value) ?? "—",
    },
    {
      field: "status",
      headerName: "Статус",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <PlaceStatusChip status={params.row.status} deletedAt={params.row.deleted_at} />
      ),
    },
    {
      field: "address",
      headerName: "Адрес",
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      valueGetter: (value: string | null) => value ?? "—",
    },
    {
      field: "phone",
      headerName: "Телефон",
      width: 150,
      sortable: false,
      filterable: false,
      valueGetter: (value: string | null) => value ?? "—",
    },
    {
      field: "created_at",
      headerName: "Создано",
      width: 180,
      sortable: false,
      filterable: false,
      valueFormatter: (value: string) => formatDate(value),
    },
  ];

  if (!onDeleteRequest) return columns;

  return [
    ...columns,
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 56,
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Удалить"
          disabled={Boolean(params.row.deleted_at)}
          onClick={() => onDeleteRequest(params.row)}
        />,
      ],
    },
  ];
}
