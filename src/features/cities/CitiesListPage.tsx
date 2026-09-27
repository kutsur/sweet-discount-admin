import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import type { AdminCityListItem } from "./api";
import { buildCityColumns } from "./columns";
import { useCitiesList, useDeleteCity } from "./queries";

export function CitiesListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [cityToDelete, setCityToDelete] = useState<AdminCityListItem | null>(null);

  const { data, isFetching, error } = useCitiesList({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });
  const deleteCity = useDeleteCity();

  const columns = buildCityColumns((city) => setCityToDelete(city));

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Cities</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/cities/new")}>
          Add city
        </Button>
      </Stack>

      <ErrorAlert error={error ?? deleteCity.error} />

      <Box sx={{ bgcolor: "background.paper" }}>
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
          onRowClick={(params) => navigate(`/cities/${params.id}`)}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      <ConfirmDialog
        open={Boolean(cityToDelete)}
        title="Delete this city?"
        description={`${cityToDelete?.name ?? ""} will be removed from the public listing. This can be undone only from the database.`}
        confirmLabel="Delete"
        destructive
        loading={deleteCity.isPending}
        onCancel={() => setCityToDelete(null)}
        onConfirm={() => {
          if (!cityToDelete) return;
          deleteCity.mutate(cityToDelete.id, { onSuccess: () => setCityToDelete(null) });
        }}
      />
    </Box>
  );
}
