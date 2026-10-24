import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../lib/formatDate";
import type { AdminCityListItem } from "./api";

// Sort/filter are off on every column: the API only supports limit/offset, no sort or search
// param — see the users columns.tsx for the same reasoning.
const baseCityColumns: GridColDef<AdminCityListItem>[] = [
  { field: "name", headerName: "Название", flex: 1, minWidth: 160, sortable: false, filterable: false },
  { field: "slug", headerName: "Короткое имя", flex: 1, minWidth: 140, sortable: false, filterable: false },
  { field: "country_code", headerName: "Страна", width: 100, sortable: false, filterable: false },
  { field: "lat", headerName: "Широта", width: 110, sortable: false, filterable: false },
  { field: "lon", headerName: "Долгота", width: 110, sortable: false, filterable: false },
  {
    field: "created_at",
    headerName: "Создан",
    width: 180,
    sortable: false,
    filterable: false,
    valueFormatter: (value: string) => formatDate(value),
  },
];

export function buildCityColumns(
  onDeleteRequest: (city: AdminCityListItem) => void,
): GridColDef<AdminCityListItem>[] {
  return [
    ...baseCityColumns,
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
          onClick={() => onDeleteRequest(params.row)}
        />,
      ],
    },
  ];
}
