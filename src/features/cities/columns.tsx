import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../lib/formatDate";
import type { AdminCityListItem } from "./api";

// Sort/filter are off on every column: the API only supports limit/offset, no sort or search
// param — see the users columns.tsx for the same reasoning.
const baseCityColumns: GridColDef<AdminCityListItem>[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 160, sortable: false, filterable: false },
  { field: "slug", headerName: "Slug", flex: 1, minWidth: 140, sortable: false, filterable: false },
  { field: "country_code", headerName: "Country", width: 100, sortable: false, filterable: false },
  { field: "lat", headerName: "Lat", width: 110, sortable: false, filterable: false },
  { field: "lon", headerName: "Lon", width: 110, sortable: false, filterable: false },
  {
    field: "created_at",
    headerName: "Created",
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
          label="Delete"
          onClick={() => onDeleteRequest(params.row)}
        />,
      ],
    },
  ];
}
