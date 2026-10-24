import DeleteIcon from "@mui/icons-material/Delete";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { imageColumn } from "../../components/images/imageColumn";
import { formatCalendarDate } from "../../lib/formatDate";
import type { Discount } from "./api";
import { DISCOUNT_KINDS } from "./discountKinds";
import { formatDiscountSchedule } from "./discountSchedule";
import { DiscountStatusChip } from "./DiscountStatusChip";

function formatPeriod(discount: Discount): string {
  if (!discount.starts_on && !discount.ends_on) return "Бессрочно";
  if (!discount.ends_on) return `С ${formatCalendarDate(discount.starts_on)}`;
  if (!discount.starts_on) return `По ${formatCalendarDate(discount.ends_on)}`;
  return `${formatCalendarDate(discount.starts_on)} – ${formatCalendarDate(discount.ends_on)}`;
}

// Sort/filter are off on every column: the API filters by query params and has no sort.
export function buildDiscountColumns({
  onDeleteRequest,
}: {
  onDeleteRequest: (discount: Discount) => void;
}): GridColDef<Discount>[] {
  return [
    imageColumn<Discount>(),
    { field: "title", headerName: "Название", flex: 1, minWidth: 180, sortable: false, filterable: false },
    {
      field: "place_name",
      headerName: "Заведение",
      flex: 1,
      minWidth: 160,
      sortable: false,
      filterable: false,
    },
    {
      field: "value",
      headerName: "Размер",
      width: 90,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => DISCOUNT_KINDS[row.kind].formatValue(row),
    },
    {
      field: "schedule",
      headerName: "Когда",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => formatDiscountSchedule(row.schedule),
    },
    {
      field: "period",
      headerName: "Срок",
      width: 210,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => formatPeriod(row),
    },
    {
      field: "status",
      headerName: "Статус",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <DiscountStatusChip status={params.row.status} deletedAt={params.row.deleted_at} />
      ),
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
          label="Удалить"
          onClick={() => onDeleteRequest(params.row)}
        />,
      ],
    },
  ];
}
