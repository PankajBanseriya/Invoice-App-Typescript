import { Typography, Stack, IconButton } from "@mui/material";
import { Edit, Delete, Print } from "@mui/icons-material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid-pro";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { printInvoice } from "../../utils/printInvoice";
import type { NavigateFunction } from "react-router-dom";

interface Invoice {
  primaryKeyID: number;
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  totalItems: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
}

interface Props {
  navigate: NavigateFunction;
  handleDeleteClick: (id: number) => void;
}

export const getInvoiceColumns = ({
  navigate,
  handleDeleteClick,
}: Props): GridColDef<Invoice>[] => [
  {
    field: "invoiceNo",
    headerName: "Invoice No",
    flex: 0.75,
    minWidth: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Typography
        fontWeight="600"
        color="primary"
        sx={{
          fontSize: 14,
          cursor: "pointer",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
        onClick={() =>
          navigate("/invoices/form", {
            state: {
              activeInvoice: params.row,
            },
          })
        }
      >
        {params.row.invoiceNo}
      </Typography>
    ),
  },

  {
    field: "invoiceDate",
    headerName: "Date",
    flex: 0.75,
    minWidth: 120,
    valueFormatter: (value?: string) =>
      value ? format(new Date(value), "dd-MMM-yyyy") : "",
  },

  {
    field: "customerName",
    headerName: "Customer",
    flex: 1,
    minWidth: 180,
  },

  {
    field: "totalItems",
    headerName: "Items",
    type: "number",
    minWidth: 100,
  },

  {
    field: "subTotal",
    headerName: "Sub Total",
    width: 150,
    minWidth: 150,
    type: "number",
    valueFormatter: (value?: number) =>
      value ? `$${value.toLocaleString()}` : "$0",
  },

  {
    field: "taxPercentage",
    headerName: "Tax %",
    minWidth: 150,
    type: "number",
    valueFormatter: (value?: number) => `${value}%`,
  },

  {
    field: "taxAmount",
    headerName: "Tax Amt",
    minWidth: 150,
    type: "number",
    valueFormatter: (value?: number) => `$${value}`,
  },

  {
    field: "invoiceAmount",
    headerName: "Total",
    minWidth: 150,
    type: "number",
    renderCell: (params: GridRenderCellParams) => (
      <Typography
        fontWeight="600"
        sx={{
          display: "flex",
          justifyContent: "end",
        }}
      >
        ${params.value?.toFixed(2)}
      </Typography>
    ),
  },

  {
    field: "actions",
    headerName: "Actions",
    sortable: false,
    hideable: false,
    headerAlign: "right",
    align: "right",
    disableReorder: true,
    flex: 1,
    minWidth: 130,
    headerClassName: "actions",

    renderCell: (params: GridRenderCellParams) => (
      <Stack
        direction="row"
        alignItems="center"
        height="100%"
        justifyContent="end"
      >
        <IconButton
          size="small"
          onClick={() =>
            navigate("/invoices/form", {
              state: {
                activeInvoice: params.row,
              },
            })
          }
        >
          <Edit fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={async () => {
            try {
              await printInvoice(params.row.invoiceID);
            } catch {
              toast.error("Failed to generate print view");
            }
          }}
        >
          <Print fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => handleDeleteClick(params.row.invoiceID)}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
