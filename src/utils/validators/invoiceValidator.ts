import toast from "react-hot-toast";

const amountRegex = /^\d{1,10}(\.\d{1,2})?$/;

export const validateAmount = (
  value: any,
  label: string,
) => {
  const val = parseFloat(value?.toString());

  if (value === "" || isNaN(val)) {
    return `${label} is Required`;
  }

  if (val < 0) {
    return "Negative not allowed";
  }

  if (!amountRegex.test(val.toFixed(2))) {
    return "Invalid Amount";
  }

  return null;
};

export const validateInvoiceForm = ({
  invoiceDetails,
  lineItems,
  subTotal,
  taxAmt,
}: any) => {
  let valid = true;

  const errors: any = {
    lines: {},
  };

  if (!invoiceDetails.invoiceNo) {
    errors.invoiceNo = "Invoice No is Required";
    valid = false;
  }

  if (!invoiceDetails.customerName) {
    errors.customerName =
      "Customer Name is Required";
    valid = false;
  }

  lineItems.forEach((line: any) => {
    let lineError: any = {};

    if (!line.itemObject) {
      lineError.item = "Item is Required";
    }

    const qtyError = validateAmount(
      line.qty,
      "Quantity",
    );

    const rateError = validateAmount(
      line.rate,
      "Rate",
    );

    const amountError = validateAmount(
      line.amount,
      "Amount",
    );

    if (qtyError) lineError.qty = qtyError;
    if (rateError) lineError.rate = rateError;
    if (amountError)
      lineError.itemAmt = amountError;

    const disc =
      parseFloat(line.discountPct.toString()) || 0;

    if (disc < 0 || disc > 100) {
      lineError.disc = "0-100";
    }

    if (Object.keys(lineError).length) {
      errors.lines[line.id] = lineError;
      valid = false;
    }
  });

  const hasQty = lineItems.some(
    (line: any) =>
      (parseFloat(line.qty.toString()) || 0) > 0,
  );

  if (!hasQty) {
    toast.error("At least one Qty should be > 0");
    valid = false;
  }

  const subTotalError = validateAmount(
    subTotal,
    "Sub Total",
  );

  if (subTotalError) {
    toast.error(`Sub Total: ${subTotalError}`);
    valid = false;
  }

  const totalAmount =
    subTotal + (parseFloat(taxAmt.toString()) || 0);

  const totalError = validateAmount(
    totalAmount,
    "Total Amount",
  );

  if (totalError && !subTotalError) {
    toast.error(`Total Amount: ${totalError}`);
    valid = false;
  }

  return {
    valid,
    errors,
  };
};