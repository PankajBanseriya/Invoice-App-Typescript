import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import type { Invoice } from "../../pages/Invoices";
import type { GridColDef } from "@mui/x-data-grid";

interface InvoiceTableProps {
  apiRef: React.RefObject<GridApiCommunity | null>;
  rows: Invoice[];
  columns: GridColDef<Invoice>[];
}

export default function InvoiceTable({
  apiRef,
  rows,
  columns,
}: InvoiceTableProps) {
  return (
    <Paper sx={{ height: 245 }}>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowHeight={() => "auto"}
        getRowId={(row) => row.primaryKeyID}
        hideFooter
        sx={{
          border: 0,
          px: 2,
          "& .MuiDataGrid-cell": {
            p: 1,
          },

          "& .actions": {
            paddingRight:
              "25px !important",
          },
        }}
      />
    </Paper>
  );
}