import { Box, Paper } from "@mui/material";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { userColumns } from "./columns";
import { useUsersList } from "./queries";

export function UsersListPage() {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const { data, isFetching, error } = useUsersList({
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });

  return (
    <Box>
      <PageHeader title="Users" subtitle="Search, review and moderate registered accounts." />
      <ErrorAlert error={error} />
      <Paper sx={{ overflow: "hidden" }}>
        <DataGrid
          columns={userColumns}
          rows={data?.items ?? []}
          rowCount={data?.meta.total ?? 0}
          loading={isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnMenu
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/users/${params.id}`)}
          sx={{ cursor: "pointer" }}
        />
      </Paper>
    </Box>
  );
}
