import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { ruRU as gridRuRU } from "@mui/x-data-grid/locales";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { todayIsoDate } from "../../lib/formatDate";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { PlacePicker } from "../places/PlacePicker";
import type { Discount, DiscountStatus } from "./api";
import { buildDiscountColumns } from "./columns";
import { DISCOUNT_STATUS_LABEL, DISCOUNT_STATUSES } from "./discountStatus";
import { useDeleteDiscount, useDiscountsList } from "./queries";

type FilterKey = "place_id" | "status" | "q" | "valid_today";

/** Filters live in the URL, so "Discounts of this place" links and reloads keep them. */
export function DiscountsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const placeId = searchParams.get("place_id") ?? "";
  const statusParam = searchParams.get("status");
  // A hand-edited ?status= would otherwise reach the API and come back 422.
  const status: DiscountStatus | "" = DISCOUNT_STATUSES.includes(statusParam as DiscountStatus)
    ? (statusParam as DiscountStatus)
    : "";
  const validToday = searchParams.get("valid_today") === "1";

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [toDelete, setToDelete] = useState<Discount | null>(null);

  const { data, isFetching, error } = useDiscountsList({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
    placeId: placeId || undefined,
    status: status || undefined,
    q: debouncedSearch || undefined,
    validOn: validToday ? todayIsoDate() : undefined,
  });
  const deleteDiscount = useDeleteDiscount();

  const setFilter = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = buildDiscountColumns({ onDeleteRequest: setToDelete });

  return (
    <Box>
      <PageHeader
        title="Скидки"
        subtitle="Предложения ваших заведений: скидки в процентах и сюрприз-боксы по дням, часам и датам."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(placeId ? `/discounts/new?place_id=${placeId}` : "/discounts/new")}
          >
            Добавить скидку
          </Button>
        }
      />

      <ErrorAlert error={error ?? deleteDiscount.error} />

      <Stack direction="row" spacing={2} useFlexGap sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          label="Поиск"
          placeholder="По названию…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setFilter("q", event.target.value.trim());
          }}
          sx={{ minWidth: 220 }}
        />
        <PlacePicker
          size="small"
          value={placeId}
          onChange={(id) => setFilter("place_id", id)}
          placeholder="Все заведения"
        />
        <TextField
          select
          size="small"
          label="Статус"
          value={status}
          onChange={(event) => setFilter("status", event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Любой статус</MenuItem>
          {DISCOUNT_STATUSES.map((value) => (
            <MenuItem key={value} value={value}>
              {DISCOUNT_STATUS_LABEL[value]}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Checkbox
              checked={validToday}
              onChange={(event) => setFilter("valid_today", event.target.checked ? "1" : "")}
            />
          }
          label="Действует сегодня"
        />
      </Stack>

      <Paper sx={{ overflow: "hidden" }}>
        <DataGrid
          columns={columns}
          rows={data?.items ?? []}
          rowCount={data?.meta.total ?? 0}
          loading={isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnMenu
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/discounts/${params.id}`)}
          localeText={{
            ...gridRuRU.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: "Скидок пока нет",
          }}
          sx={{ cursor: "pointer" }}
        />
      </Paper>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Удалить скидку?"
        description={`“${toDelete?.title ?? ""}” перестанет действовать и исчезнет из списка.`}
        confirmLabel="Удалить"
        destructive
        loading={deleteDiscount.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteDiscount.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </Box>
  );
}
