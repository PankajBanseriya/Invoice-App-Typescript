import { Grid, InputAdornment, Typography } from "@mui/material";

import AppTextField from "../common/AppTextField";
import type { FormData } from "../../pages/ItemModal";
import type { ItemErrors } from "../../utils/validators/itemValidator";

interface Props {
  formData: FormData;
  errors: ItemErrors;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ItemFormFields = ({ formData, errors, handleChange }: Props) => {
  return (
    <>
      <AppTextField
        label="Item Name*"
        name="itemName"
        placeholder="Enter item name"
        value={formData.itemName}
        onChange={handleChange}
        error={!!errors.itemName}
        helperText={errors.itemName}
        sx={{ mb: 3 }}
        inputProps={{
            maxLength: 50,
        }}
      />

      <AppTextField
        label="Description"
        name="description"
        placeholder="Enter item description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={3}
        inputProps={{
          maxLength: 500,
        }}
      />
      <Typography
        variant="caption"
        align="right"
        display="block"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {formData.description.length}
        /500
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <AppTextField
            label="Sale Rate*"
            name="salesRate"
            type="number"
            placeholder="0.00"
            value={formData.salesRate}
            onChange={handleChange}
            error={!!errors.salesRate}
            helperText={errors.salesRate}
            inputProps={{ style: { textAlign: "right" } }}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <AppTextField
            label="Discount %"
            name="discountPct"
            type="number"
            placeholder="0"
            value={formData.discountPct}
            onChange={handleChange}
            error={!!errors.discountPct}
            helperText={errors.discountPct}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ style: { textAlign: "right" } }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ItemFormFields;
