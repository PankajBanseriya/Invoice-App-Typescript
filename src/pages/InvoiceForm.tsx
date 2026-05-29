import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Typography, Button, Stack, Card, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInvoices } from "../hooks/useInvoices";
import { useItems } from "../hooks/useItems";
import api from "../api/axios";
import InvoiceDetailsCard from "../components/invoices/InvoiceDetailsCard";
import InvoiceItemsTable from "../components/invoices/InvoiceItemsTable";
import InvoiceTotalsCard from "../components/invoices/InvoiceTotalsCard";
import { validateInvoiceForm } from "../utils/validators/invoiceValidator";
import type { Invoice } from "../hooks/useInvoices";
import type { Item } from "../hooks/useItems";

export interface LineItem {
  id: number;
  itemObject: Item | null;
  description: string;
  qty: number;
  rate: number;
  discountPct: number;
  amount: number;
}

export interface InvoiceDetails {
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

const amountRegex = /^\d{1,10}(\.\d{1,2})?$/;

const createRow = (): LineItem => ({
  id: Date.now() + Math.random(),
  itemObject: null,
  description: "",
  qty: 1,
  rate: 0,
  discountPct: 0,
  amount: 0,
});

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state: LocationState;
  };

  const activeInvoice = state?.activeInvoice || null;
  const isEdit = !!activeInvoice;
  const { addInvoice, updateInvoice, invoices } = useInvoices(null, null);
  const { items } = useItems();
  const [taxType, setTaxType] = useState<"PCT" | "AMT">("AMT");
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

  const [lineItems, setLineItems] = useState<LineItem[]>([createRow()]);
  const [taxPct, setTaxPct] = useState(0);
  const [taxAmt, setTaxAmt] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) return;

    if (invoices.length > 0) {
      const lastNo = Math.max(
        ...invoices.map((invoice) => parseInt(invoice.invoiceNo) || 0),
      );
      const nextNo = lastNo + 1;

      setInvoiceDetails((prev) => ({
        ...prev,
        invoiceNo: nextNo.toString(),
        invoiceID: nextNo,
      }));
    } else {
      setInvoiceDetails((prev) => ({
        ...prev,
        invoiceNo: "1",
        invoiceID: 1,
      }));
    }
  }, [invoices, isEdit]);

  useEffect(() => {
    if (!isEdit || !activeInvoice) return;

    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/Invoice/${activeInvoice.invoiceID}`);

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
        setTaxAmt(data.taxAmount || 0);
        console.log(data.lines)
        if (data.lines?.length) {
          setLineItems(
            data.lines.map((line: any) => {
              const item = items.find((i) => i.itemID === line.itemID);
              return {
                id: Math.random(),
                itemObject: item || {
                  itemID: line.itemID,
                  itemName: line.description,
                },

                description: line.description || "",
                qty: line.quantity || 0,
                rate: line.rate || 0,
                discountPct: line.discountPct || 0,
                amount:
                  (line.quantity || 0) *
                  (line.rate || 0) *
                  (1 - (line.discountPct || 0) / 100),
              };
            }),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchInvoice();
  }, [isEdit, activeInvoice, items]);

  const subTotal = useMemo(() => {
    return lineItems.reduce((sum, row) => sum + row.amount, 0);
  }, [lineItems]);

  const totals = useMemo(() => {
    const tax = taxType === "PCT" ? subTotal * (taxPct / 100) : taxAmt;

    return {
      subTotal: subTotal.toFixed(2),
      taxAmt: tax.toFixed(2),
      invoiceAmount: (subTotal + tax).toFixed(2),
    };
  }, [lineItems, taxPct, taxAmt, taxType, subTotal]);

  const handleDetails = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setInvoiceDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaxPct = (value: string) => {
    const pct = parseFloat(value) || 0;
    setTaxType("PCT");
    setTaxPct(pct);
    const amt = subTotal * (pct / 100);
    setTaxAmt(Number(amt.toFixed(2)));
  };

  const handleTaxAmt = (value: string) => {
    const amt = parseFloat(value) || 0;
    setTaxType("AMT");
    setTaxAmt(amt);
    if (subTotal > 0) {
      const pct = (amt / subTotal) * 100;
      setTaxPct(parseFloat(pct.toFixed(4)));
    }
  };

  const updateLine = (id: number, field: keyof LineItem, value: Item | string) => {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = {
          ...row,
          [field]: value === "" ? 0 : value,
        };

        if (field === "itemObject") {
          const item = value as Item;
          updated.description = item?.description || "";
          updated.rate = item?.salesRate || 0;
          updated.discountPct = item?.discountPct || 0;
        }

        const qty = parseFloat(updated.qty.toString()) || 0;
        const rate = parseFloat(updated.rate.toString()) || 0;
        const disc = parseFloat(updated.discountPct.toString()) || 0;
        const gross = qty * rate;
        const discount = gross * (disc / 100);

        updated.amount = parseFloat((gross - discount).toFixed(2));
        return updated;
      }),
    );
  };

  const addRow = () => {
    setLineItems((prev) => [...prev, createRow()]);
  };

  const deleteRow = (id: number) => {
    setLineItems((prev) => prev.filter((row) => row.id !== id));
  };

  const copyRow = (row: LineItem) => {
    setLineItems((prev) => [
      ...prev,
      {
        ...row,
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const handleSubmit = () => {
    const { valid, errors } = validateInvoiceForm({
      invoiceDetails,
      lineItems,
      subTotal,
      taxAmt,
    });

    setErrors(errors);
    if (!valid) return;
    const validLines = lineItems.filter((line) => line.itemObject);

    if (!validLines.length) {
      toast.error("Please add at least one item");
      return;
    }

    const payload: any = {
      invoiceNo: parseInt(invoiceDetails.invoiceNo),
      invoiceDate: invoiceDetails.invoiceDate,
      customerName: invoiceDetails.customerName,
      address: invoiceDetails.address,
      city: invoiceDetails.city || null,
      notes: invoiceDetails.notes,
      taxPercentage: taxPct,
      subTotal: parseFloat(totals.subTotal),
      taxAmount: parseFloat(totals.taxAmt),
      invoiceAmount: parseFloat(totals.invoiceAmount),
      lines: validLines.map((line, index) => ({
        rowNo: index + 1,
        itemID: line.itemObject?.itemID,
        description: line.description,
        quantity: parseFloat(line.qty.toString()),
        rate: parseFloat(line.rate.toString()),
        discountPct: parseFloat(line.discountPct.toString()) || 0,
      })),
    };

    if (isEdit && activeInvoice) {
      payload.invoiceID = activeInvoice.invoiceID;
      payload.updatedOn = activeInvoice.updatedOn;
      updateInvoice(payload);
    } else {
      addInvoice(payload);
    }
  };

  return (
    <Box
      sx={{
        width: "95%",
        mx: "auto",
        py: 2,
      }}
    >
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
            sx={{
              color: "black",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "black",
              px: 4,
              py: 1,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            Save
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <InvoiceDetailsCard
          values={invoiceDetails}
          errors={errors}
          onChange={handleDetails}
        />

        <Card
          variant="outlined"
          sx={{
            borderRadius: "8px",
          }}
        >
          <InvoiceItemsTable
            rows={lineItems}
            errors={errors}
            onAdd={addRow}
            onDelete={deleteRow}
            onCopy={copyRow}
            onChange={updateLine}
          />
        </Card>

        <Divider />

        <InvoiceTotalsCard
          totals={totals}
          subTotal={subTotal}
          taxPct={taxPct}
          taxAmt={taxAmt}
          amountRegex={amountRegex}
          onTaxPctChange={handleTaxPct}
          onTaxAmtChange={handleTaxAmt}
        />
      </Stack>
    </Box>
  );
};

export default InvoiceForm;
