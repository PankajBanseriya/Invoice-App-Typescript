import React, { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Card,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ItemSelect from "../components/item/ItemSelect";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "../hooks/useInvoices";
import { useItems } from "../hooks/useItems";
import type { Item } from "../hooks/useItems";
import api from "../api/axios";
import toast from "react-hot-toast";

interface LineItem {
  id: number;
  itemObject: Item | null;
  description: string;
  qty: number;
  rate: number;
  discountPct: number;
  amount: number;
}

interface InvoiceDetails {
  invoiceID: number;
  primaryKeyID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  city: string;
  address: string;
  notes: string;
}

interface LocationState {
  activeInvoice: Invoice | null;
}

const defaultRow = (): LineItem => ({
  id: Date.now() + Math.random(),
  itemObject: null,
  description: "",
  qty: 1,
  rate: 0,
  discountPct: 0,
  amount: 0,
});

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const activeInvoice = state?.activeInvoice || null;
  const isEdit = !!activeInvoice;

  const { addInvoice, updateInvoice, invoices } = useInvoices(null, null);
  const { items } = useItems();

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceID: 0,
    primaryKeyID: 0,
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    city: "",
    address: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([defaultRow()]);
  const [taxPct, setTaxPct] = useState<number>(0);
  const [taxAmt, setTaxAmt] = useState<number>(0);
  const [errors, setErrors] = useState<any>({});

  const amountRegex = /^\d{1,10}(\.\d{1,2})?$/;

  useEffect(() => {
    if (!isEdit && invoices.length > 0) {
      const lastNo = Math.max(
        ...invoices.map((inv) => parseInt(inv.invoiceNo) || 0),
      );
      const nextNo = lastNo + 1;
      setInvoiceDetails((prev) => ({
        ...prev,
        invoiceNo: nextNo.toString(),
        invoiceID: nextNo,
      }));
    } else if (!isEdit) {
      setInvoiceDetails((prev) => ({ ...prev, invoiceNo: "1", invoiceID: 1 }));
    }
  }, [isEdit, invoices]);

  useEffect(() => {
    const fetchFullInvoice = async () => {
      if (isEdit && activeInvoice) {
        try {
          const response = await api.get(`/Invoice/${activeInvoice.invoiceID}`);
          const data = response.data;

          setInvoiceDetails({
            primaryKeyID: data.primaryKeyID,
            invoiceID: data.invoiceID,
            invoiceNo: data.invoiceNo.toString(),
            invoiceDate: data.invoiceDate.split("T")[0],
            customerName: data.customerName,
            address: data.address,
            city: data.city || "",
            notes: data.notes || "",
          });

          setTaxPct(data.taxPercentage || 0);

          if (data.lines && data.lines.length > 0) {
            const mappedRows: LineItem[] = data.lines.map((line: any) => {
              const masterItem = items.find((it) => it.itemID === line.itemID);
              return {
                id: Math.random(),
                itemObject:
                  masterItem ||
                  ({ itemID: line.itemID, itemName: line.description } as any),
                description: line.description || "",
                qty: line.quantity || 0,
                rate: line.rate || 0,
                discountPct: line.discountPct || 0,
                amount:
                  (line.quantity || 0) *
                  (line.rate || 0) *
                  (1 - (line.discountPct || 0) / 100),
              };
            });
            setLineItems(mappedRows);
          }
        } catch (error) {
          console.error("Error fetching full invoice model:", error);
        }
      }
    };
    fetchFullInvoice();
  }, [isEdit, activeInvoice, items]);

  const subTotal = useMemo(() => {
    return lineItems.reduce((sum, row) => sum + (row.amount || 0), 0);
  }, [lineItems]);

  // // Handle Tax changes
  useEffect(() => {
    const pct = parseFloat(taxPct.toString()) || 0;
    setTaxAmt(Number((subTotal * (pct / 100)).toFixed(2)));
  }, [taxPct, subTotal]);

  const handleTaxAmtChange = (value: string) => {
    setTaxAmt(Number(value));
    const amt = parseFloat(value) || 0;
    if (subTotal > 0) {
      setTaxPct(Number(((amt / subTotal) * 100).toFixed(2)));
    }
  };

  const handleDetailChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (
    id: number,
    field: keyof LineItem,
    value: any,
  ) => {
    setLineItems((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value === "" ? 0 : value };

          if (field === "itemObject") {
            const selectedItem = value as Item;
            updatedRow.description = selectedItem?.description || "";
            updatedRow.rate = selectedItem?.salesRate || 0;
            updatedRow.discountPct = selectedItem?.discountPct || 0;
          }

          const qty = parseFloat(updatedRow.qty.toString()) || 0;
          const rate = parseFloat(updatedRow.rate.toString()) || 0;
          const disc = parseFloat(updatedRow.discountPct.toString()) || 0;

          const amount = qty * rate;
          const discountAmt = amount * (disc / 100);
          updatedRow.amount =
            parseFloat((amount - discountAmt).toFixed(2)) || 0;

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const getNumericError = (value: any, fieldName: string) => {
    const val = parseFloat(value.toString());
    if (value === "" || value === null || isNaN(val))
      return `${fieldName} is Required`;
    if (val < 0) return "Negative not allowed";
    if (!amountRegex.test(val.toFixed(2)))
      return "Invalid (Max 10 digit allowed)";
    return null;
  };

  const validate = () => {
    let newErrors: any = { lines: {} };
    let isValid = true;

    if (!invoiceDetails.invoiceNo) {
      newErrors.invoiceNo = "Invoice No. is Required";
      isValid = false;
    }
    if (!invoiceDetails.customerName) {
      newErrors.customerName = "Customer Name is Required";
      isValid = false;
    }

    
    lineItems.forEach((line) => {
      let lErr: any = {};
      if (!line.itemObject) lErr.item = "Item is Required";

      const qtyErr = getNumericError(line.qty, "Quantity");
      if (qtyErr) lErr.qty = qtyErr;
      
      const rateErr = getNumericError(line.rate, "Rate");
      if (rateErr) lErr.rate = rateErr;
      
      const d = parseFloat(line.discountPct.toString()) || 0;
      if (d < 0 || d > 100) lErr.disc = "0-100";

      // Item Amount Validation
      const itemAmtErr = getNumericError(line.amount, "Amount");
      if (itemAmtErr) lErr.itemAmt = itemAmtErr;
      
      if (Object.keys(lErr).length > 0) {
        newErrors.lines[line.id] = lErr;
        isValid = false;
      }
    });
    
    const hasValidQty = lineItems.some(
      (l) => (parseFloat(l.qty.toString()) || 0) > 0,
    );
    if (!hasValidQty) {
      toast.error("At least one line must have Qty > 0");
      isValid = false;
    }

    const subTotalErr = getNumericError(subTotal, "Sub Total");
    if (subTotalErr) {
      toast.error(`Sub Total: ${subTotalErr}`);
      isValid = false;
    }

    const totalInvoiceAmt = subTotal + (parseFloat(taxAmt.toString()) || 0);
    const totalErr = getNumericError(totalInvoiceAmt, "Total Amount");
    if (totalErr && !subTotalErr) {
      toast.error(`Total Amount: ${totalErr}`);
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addRow = () => setLineItems([...lineItems, defaultRow()]);
  const deleteRow = (id: number) =>
    setLineItems(lineItems.filter((r) => r.id !== id));
  const copyRow = (rowToCopy: LineItem) =>
    setLineItems([
      ...lineItems,
      { ...rowToCopy, id: Date.now() + Math.random() },
    ]);

  const invoiceTotals = useMemo(() => {
    const subTotal = lineItems.reduce((sum, row) => sum + (row.amount || 0), 0);
    const calculatedTaxAmt = subTotal * (taxPct / 100);

    // Side effect check to prevent infinite loop
    if (Math.abs(calculatedTaxAmt - taxAmt) > 0.01) {
      setTimeout(() => setTaxAmt(calculatedTaxAmt), 0);
    }

    const finalAmount = subTotal + calculatedTaxAmt;

    return {
      subTotal: subTotal.toFixed(2),
      taxAmt: calculatedTaxAmt.toFixed(2),
      invoiceAmount: finalAmount.toFixed(2),
    };
  }, [lineItems, taxPct, taxAmt]);

  const handleSubmit = async () => {
    if (!validate()) return;
    const validLines = lineItems.filter((line) => line.itemObject);
    if (validLines.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const finalPayload: any = {
      invoiceNo: parseInt(invoiceDetails.invoiceNo),
      invoiceDate: invoiceDetails.invoiceDate,
      customerName: invoiceDetails.customerName,
      address: invoiceDetails.address,
      city: invoiceDetails.city || null,
      taxPercentage: taxPct,
      notes: invoiceDetails.notes,
      subTotal: parseFloat(invoiceTotals.subTotal),
      taxAmount: parseFloat(invoiceTotals.taxAmt),
      invoiceAmount: parseFloat(invoiceTotals.invoiceAmount),
      lines: lineItems
        .filter((l) => l.itemObject)
        .map((l, i) => ({
          rowNo: i + 1,
          itemID: l.itemObject?.itemID,
          description: l.description,
          quantity: parseFloat(l.qty.toString()),
          rate: parseFloat(l.rate.toString()),
          discountPct: parseFloat(l.discountPct.toString()) || 0,
        })),
    };

    if (isEdit && activeInvoice) {
      finalPayload.invoiceID = activeInvoice.invoiceID;
      finalPayload.updatedOn = activeInvoice.updatedOn;
      updateInvoice(finalPayload);
    } else {
      addInvoice(finalPayload);
    }
  };

  const textProps = {
    size: "small" as const,
    fullWidth: true,
    sx: { bgcolor: "white" },
  };

  return (
    <Box sx={{ width: "96%", mx: "auto", py: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="500">
          {isEdit ? "Edit Invoice" : "New Invoice"}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={() => navigate(-1)}
            sx={{ color: "black", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: "black",
              "&:hover": { bgcolor: "#333" },
              textTransform: "none",
              px: 4,
              py: 1,
            }}
          >
            Save
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight="400"
            mb={3}
          >
            Invoice Details
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice No
              </Typography>
              <TextField
                {...textProps}
                name="invoiceNo"
                type="number"
                value={invoiceDetails.invoiceNo}
                onChange={handleDetailChange}
                error={!!errors.invoiceNo}
                helperText={errors.invoiceNo}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice Date *
              </Typography>
              <TextField
                {...textProps}
                type="date"
                name="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={handleDetailChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Customer Name *
              </Typography>
              <TextField
                {...textProps}
                name="customerName"
                value={invoiceDetails.customerName}
                onChange={handleDetailChange}
                placeholder="Enter customer name"
                error={!!errors.customerName}
                helperText={errors.customerName}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                City
              </Typography>
              <TextField
                {...textProps}
                name="city"
                value={invoiceDetails.city}
                onChange={handleDetailChange}
                placeholder="Enter city"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Address
              </Typography>
              <TextField
                {...textProps}
                name="address"
                value={invoiceDetails.address}
                onChange={handleDetailChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Notes
              </Typography>
              <TextField
                {...textProps}
                name="notes"
                value={invoiceDetails.notes}
                onChange={handleDetailChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Card>

        <Card variant="outlined" sx={{ p: 0, borderRadius: "8px" }}>
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
                {lineItems.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <ItemSelect
                        size="small"
                        value={row.itemObject}
                        onChange={(_, val) =>
                          handleLineItemChange(row.id, "itemObject", val)
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
                          handleLineItemChange(
                            row.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "qty",
                            parseFloat(e.target.value),
                          )
                        }
                        error={!!errors.lines?.[row.id]?.qty}
                        helperText={errors.lines?.[row.id]?.qty}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.rate}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "rate",
                            parseFloat(e.target.value),
                          )
                        }
                        error={!!errors.lines?.[row.id]?.rate}
                        helperText={errors.lines?.[row.id]?.rate}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.discountPct}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "discountPct",
                            parseFloat(e.target.value),
                          )
                        }
                        error={!!errors.lines?.[row.id]?.disc}
                        helperText={errors.lines?.[row.id]?.disc}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      <Box>
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
                        <IconButton size="small" onClick={() => copyRow(row)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteRow(row.id)}
                          disabled={lineItems.length === 1}
                        >
                          <DeleteOutlineIcon fontSize="small" color="error" />
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
              sx={{ color: "black", borderColor: "#ccc" }}
              onClick={addRow}
            >
              Add Row
            </Button>
          </Box>
        </Card>

        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6">Invoice Totals</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Sub Total
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color={
                      !amountRegex.test(subTotal.toFixed(2))
                        ? "error"
                        : "inherit"
                    }
                  >
                    ${invoiceTotals.subTotal}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Tax
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      value={taxPct}
                      onChange={(e) =>
                        setTaxPct(parseFloat(e.target.value) || 0)
                      }
                      sx={{ width: "100px" }}
                      error={!!errors.taxPct}
                      helperText={errors.taxPct}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      size="small"
                      value={taxAmt.toFixed(2)}
                      sx={{ width: "100px" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      onChange={(e) => handleTaxAmtChange(e.target.value)}
                      error={parseFloat(taxAmt.toString()) < 0}
                      helperText={
                        parseFloat(taxAmt.toString()) < 0
                          ? "Negative not allowed"
                          : ""
                      }
                    />
                  </Stack>
                </Stack>
                <Divider />
                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    p: 2.5,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">Invoice Amount</Typography>
                  <Typography
                    variant="h4"
                    fontWeight="600"
                    color={
                      !amountRegex.test((subTotal + taxAmt).toFixed(2))
                        ? "error"
                        : "inherit"
                    }
                  >
                    ${invoiceTotals.invoiceAmount}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Box>
  );
};

export default InvoiceForm;
