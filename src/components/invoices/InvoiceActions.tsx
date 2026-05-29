import { Button, Box } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { FaColumns, FaDownload } from "react-icons/fa";

import { GridPreferencePanelsValue } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";
import AppButton from "../common/AppButton";

interface InvoiceActionsProps {
  apiRef: React.RefObject<GridApiCommunity | null>;
}

export default function InvoiceActions({
  apiRef,
}: InvoiceActionsProps) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Button
        variant="outlined"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          borderColor: "text.primary",
          color: "text.primary",
          py: 0.9,
          mb: 1,
        }}
        onClick={() => navigate("/items")}
      >
        All Items
      </Button>

      <AppButton
        startIcon={<AddIcon />}
        sx={{
          mr: 1,
          px: 2,
          mb: 1,
        }}
        onClick={() => navigate("/invoices/form")}
      >
        New Invoice
      </AppButton>

      <Button
        variant="outlined"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          borderColor: "text.primary",
          color: "text.primary",
          py: 0.9,
          mb: 1,
        }}
        onClick={() =>
          apiRef.current?.exportDataAsCsv({
            fileName: "invoices-data",
            fields: [
              "invoiceNo",
              "invoiceDate",
              "customerName",
              "totalItems",
              "subTotal",
              "taxPercentage",
              "taxAmount",
              "invoiceAmount",
            ],
          })
        }
      >
        <FaDownload style={{ marginRight: "10px" }} fontSize={16} />
        Export
      </Button>

      <Button
        variant="outlined"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          borderColor: "text.primary",
          color: "text.primary",
          py: 1.2,
          mb: 1,
          minWidth: "50px",
        }}
        onClick={() =>
          apiRef.current?.showPreferences(GridPreferencePanelsValue.columns)
        }
      >
        <FaColumns fontSize={20} />
      </Button>
    </Box>
  );
}
