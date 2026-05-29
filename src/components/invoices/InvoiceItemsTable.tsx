import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import ItemSelect from "../item/ItemSelect";
import type { LineItem } from "../../pages/InvoiceForm";

interface Props {
  rows: LineItem[];
  errors: any;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onCopy: (row: LineItem) => void;
  onChange: (
    (id: number, field: keyof LineItem, value: any) => void
  );
}

const InvoiceItemsTable = ({
  rows,
  errors,
  onAdd,
  onDelete,
  onCopy,
  onChange,
}: Props) => {
  return (
    <>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#fafafa" }}>
            <TableRow>
              <TableCell width={60}>S.No</TableCell>
              <TableCell width={300}>Item *</TableCell>
              <TableCell>Description</TableCell>
              <TableCell width={100}>Qty *</TableCell>
              <TableCell width={100}>Rate *</TableCell>
              <TableCell width={100}>Disc %</TableCell>
              <TableCell width={120} align="right">
                Amount
              </TableCell>
              <TableCell width={80} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <ItemSelect
                    size="small"
                    value={row.itemObject}
                    onChange={(_, val) =>
                      onChange(row.id, "itemObject", val)
                    }
                    error={!!errors.lines?.[row.id]?.item}
                    helperText={errors.lines?.[row.id]?.item}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.description}
                    onChange={(e) =>
                      onChange(
                        row.id,
                        "description",
                        e.target.value,
                      )
                    }
                    sx={{ minWidth: "150px" }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      onChange(
                        row.id,
                        "qty",
                        parseFloat(e.target.value),
                      )
                    }
                    error={!!errors.lines?.[row.id]?.qty}
                    helperText={errors.lines?.[row.id]?.qty}
                    sx={{ minWidth: "80px" }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.rate}
                    onChange={(e) =>
                      onChange(
                        row.id,
                        "rate",
                        parseFloat(e.target.value),
                      )
                    }
                    error={!!errors.lines?.[row.id]?.rate}
                    helperText={errors.lines?.[row.id]?.rate}
                    sx={{ minWidth: "100px" }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.discountPct}
                    onChange={(e) =>
                      onChange(
                        row.id,
                        "discountPct",
                        parseFloat(e.target.value),
                      )
                    }
                    error={!!errors.lines?.[row.id]?.disc}
                    helperText={errors.lines?.[row.id]?.disc}
                    sx={{ minWidth: "80px" }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Box fontWeight={600}  sx={{ minWidth: "100px" }}>
                    ${row.amount.toFixed(2)}

                    {errors.lines?.[row.id]?.itemAmt && (
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        {errors.lines?.[row.id]?.itemAmt}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                  >
                    <IconButton
                      size="small"
                      onClick={() => onCopy(row)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled={rows.length === 1}
                      onClick={() => onDelete(row.id)}
                    >
                      <DeleteOutlineIcon
                        fontSize="small"
                        color="error"
                      />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box p={3}>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          sx={{
            color: "black",
            borderColor: "#ccc",
          }}
          onClick={onAdd}
        >
          Add Row
        </Button>
      </Box>
    </>
  );
};

export default InvoiceItemsTable;