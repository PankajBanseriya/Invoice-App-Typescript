export interface ItemErrors {
  itemName?: string;
  salesRate?: string;
  discountPct?: string;
}

interface ItemFormData {
  itemName: string;
  description: string;
  salesRate: string | number;
  discountPct: string | number;
}

export const validateItem = (formData: ItemFormData): ItemErrors => {
  const errors: ItemErrors = {};

  // Item Name
  if (!formData.itemName.trim()) {
    errors.itemName = "Item Name is required.";
  } else if (formData.itemName.length > 50) {
    errors.itemName = "Max 50 characters allowed.";
  }

  // Sales Rate
  const rateStr = formData.salesRate.toString();
  const rateValue = parseFloat(rateStr);
  const salesRateRegex = /^\d{1,10}(\.\d{1,2})?$/;

  if (!rateStr.trim()) {
    errors.salesRate = "Sale Rate is required.";
  } else if (rateValue < 0) {
    errors.salesRate = "Sale Rate cannot be negative.";
  } else if (!salesRateRegex.test(rateStr)) {
    errors.salesRate = "Max 10 digits and 2 decimal places allowed.";
  }

  // Discount
  const discount =
    typeof formData.discountPct === "string"
      ? parseFloat(formData.discountPct)
      : formData.discountPct;

  if (discount < 0 || discount > 100) {
    errors.discountPct = "Discount must be between 0 and 100.";
  }

  return errors;
};
