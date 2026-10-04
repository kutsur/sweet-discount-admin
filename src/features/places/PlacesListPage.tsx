import AddIcon from "@mui/icons-material/Add";
import { Box, Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { usePublicCities } from "../cities/queries";
import type { ManagedPlaceListItem, PlaceStatus } from "./api";
import { buildPlaceColumns } from "./columns";
import { PLACE_STATUS_LABEL, PLACE_STATUSES } from "./placeStatus";
import { useDeletePlace, usePlacesList } from "./queries";

/** City and status live in the URL so "Places in this city" links from a city page work. */
export function PlacesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get("city_id") ?? "";
  const statusParam = searchParams.get("status");
  // A hand-edited ?status= would otherwise reach the API and come back 422.
  const status: PlaceStatus | "" = PLACE_STATUSES.includes(statusParam as PlaceStatus)
    ? (statusParam as PlaceStatus)
    : "";

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [placeToDelete, setPlaceToDelete] = useState<ManagedPlaceListItem | null>(null);

  const { data: cities } = usePublicCities();
  const { data, isFetching, error } = usePlacesList({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
    cityId: cityId || undefined,
    status: status || undefined,
  });
  const deletePlace = useDeletePlace();

  const cityNameById = useMemo(
    () => new Map((cities?.items ?? []).map((city) => [city.id, city.name])),
    [cities],
  );

  const setFilter = (key: "city_id" | "status", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = buildPlaceColumns({ cityNameById, onDeleteRequest: setPlaceToDelete });
  const selectedCityName = cityId ? cityNameById.get(cityId) : undefined;

  return (
    <Box>
      <PageHeader
        title="Places"
        subtitle={
          selectedCityName
            ? `Venues in ${selectedCityName}. New places start as pending until approved.`
            : "Venues across the cities you manage. New places start as pending until approved."
        }
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(cityId ? `/places/new?city_id=${cityId}` : "/places/new")}
          >
            Add place
          </Button>
        }
      />

      <ErrorAlert error={error ?? deletePlace.error} />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <TextField
          select
          size="small"
          label="City"
          value={cityId}
          onChange={(event) => setFilter("city_id", event.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All cities</MenuItem>
          {(cities?.items ?? []).map((city) => (
            <MenuItem key={city.id} value={city.id}>
              {city.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => setFilter("status", event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Any status</MenuItem>
          {PLACE_STATUSES.map((value) => (
            <MenuItem key={value} value={value}>
              {PLACE_STATUS_LABEL[value]}
            </MenuItem>
          ))}
        </TextField>
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
          onRowClick={(params) => navigate(`/places/${params.id}`)}
          sx={{ cursor: "pointer" }}
        />
      </Paper>

      <ConfirmDialog
        open={Boolean(placeToDelete)}
        title="Delete this place?"
        description={`${placeToDelete?.name ?? ""} will be hidden from the public listing. This can be undone only from the database.`}
        confirmLabel="Delete"
        destructive
        loading={deletePlace.isPending}
        onCancel={() => setPlaceToDelete(null)}
        onConfirm={() => {
          if (!placeToDelete) return;
          deletePlace.mutate(placeToDelete.id, { onSuccess: () => setPlaceToDelete(null) });
        }}
      />
    </Box>
  );
}
