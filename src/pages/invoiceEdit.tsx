// ... imports and interfaces remain same

const InvoiceForm: React.FC = () => {
  // ... existing hooks (navigate, location, useInvoices, useItems)
  // ... existing states (invoiceDetails, lineItems, taxPct, taxAmt, errors)

  const amountRegex = /^\d{1,10}(\.\d{1,2})?$/;

  // Helper to validate numeric fields
  const getNumericError = (value: any, fieldName: string) => {
    const val = parseFloat(value.toString());
    if (value === "" || value === null || isNaN(val)) return `${fieldName} is Required`;
    if (val < 0) return "Negative not allowed";
    if (!amountRegex.test(val.toFixed(2))) return "Invalid (Max 10 digit allowed)";
    return null;
  };

  const validate = () => {
    let newErrors: any = { lines: {} };
    let isValid = true;

    // Header Validation
    if (!invoiceDetails.invoiceNo) { newErrors.invoiceNo = "Invoice No. is Required"; isValid = false; }
    if (!invoiceDetails.customerName) { newErrors.customerName = "Customer Name is Required"; isValid = false; }

    // Line Items Validation
    lineItems.forEach(line => {
      let lErr: any = {};
      if (!line.itemObject) lErr.item = "Item is Required";
      
      const qtyErr = getNumericError(line.qty, "Quantity");
      if (qtyErr) lErr.qty = qtyErr;

      const rateErr = getNumericError(line.rate, "Rate");
      if (rateErr) lErr.rate = rateErr;

      const disc = parseFloat(line.discountPct.toString()) || 0;
      if (disc < 0) lErr.disc = "Negative not allowed";
      if (disc > 100) lErr.disc = "Max 100%";

      // Item Amount Validation
      const itemAmtErr = getNumericError(line.amount, "Amount");
      if (itemAmtErr) lErr.itemAmt = itemAmtErr;

      if (Object.keys(lErr).length > 0) {
        newErrors.lines[line.id] = lErr;
        isValid = false;
      }
    });

    // Totals Validation
    const subTotalErr = getNumericError(subTotal, "Sub Total");
    if (subTotalErr) { toast.error(`Sub Total: ${subTotalErr}`); isValid = false; }

    const totalInvoiceAmt = subTotal + (parseFloat(taxAmt.toString()) || 0);
    const totalErr = getNumericError(totalInvoiceAmt, "Total Amount");
    if (totalErr) { toast.error(`Total Amount: ${totalErr}`); isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const finalPayload: any = {
      invoiceNo: parseInt(invoiceDetails.invoiceNo),
      invoiceDate: invoiceDetails.invoiceDate,
      customerName: invoiceDetails.customerName,
      address: invoiceDetails.address,
      city: invoiceDetails.city || null,
      taxPercentage: parseFloat(taxPct.toString()),
      notes: invoiceDetails.notes,
      subTotal: parseFloat(subTotal.toFixed(2)),
      taxAmount: parseFloat(taxAmt.toString()),
      invoiceAmount: parseFloat((subTotal + (parseFloat(taxAmt.toString()) || 0)).toFixed(2)),
      lines: lineItems.filter(l => l.itemObject).map((l, i) => ({
        rowNo: i + 1,
        itemID: l.itemObject?.itemID,
        description: l.description,
        quantity: parseFloat(l.qty.toString()),
        rate: parseFloat(l.rate.toString()),
        discountPct: parseFloat(l.discountPct.toString()),
      })),
    };

    try {
      if (isEdit && activeInvoice) {
        finalPayload.invoiceID = activeInvoice.invoiceID;
        finalPayload.updatedOn = activeInvoice.updatedOn;
        await updateInvoice(finalPayload);
      } else {
        await addInvoice(finalPayload);
      }
      toast.success("Invoice Saved Successfully");
      navigate("/invoices"); // Only happens on success
    } catch (error) {
      console.error("Submission failed", error);
      // toast.error is handled by the hook usually, but we stay on this page
    }
  };

  // ... rest of the component (UI code with TextField errors={!!errors.lines?.[row.id]?.qty} helperText={errors.lines?.[row.id]?.qty})
  // Make sure your Tax Amt TextField looks like this:
  // <TextField 
  //    ... 
  //    value={taxAmt} 
  //    onChange={(e) => handleTaxAmtChange(e.target.value)} 
  //    error={parseFloat(taxAmt.toString()) < 0}
  //    helperText={parseFloat(taxAmt.toString()) < 0 ? "Negative not allowed" : ""}
  // />
};