import type { ChangeEvent } from "react";
import {
  Card,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import type { InvoiceDetails } from "../../pages/InvoiceForm";

interface Props {
  values: InvoiceDetails;
  errors: any;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const textProps = {
  size: "small" as const,
  fullWidth: true,
  sx: { bgcolor: "white" },
};

const InvoiceDetailsCard = ({
  values,
  errors,
  onChange,
}: Props) => {
  return (
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
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Invoice No
          </Typography>

          <TextField
            {...textProps}
            type="number"
            name="invoiceNo"
            value={values.invoiceNo}
            onChange={onChange}
            error={!!errors.invoiceNo}
            helperText={errors.invoiceNo}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Invoice Date *
          </Typography>

          <TextField
            {...textProps}
            type="date"
            name="invoiceDate"
            value={values.invoiceDate}
            onChange={onChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Customer Name *
          </Typography>

          <TextField
            {...textProps}
            name="customerName"
            value={values.customerName}
            onChange={onChange}
            placeholder="Enter customer name"
            error={!!errors.customerName}
            helperText={errors.customerName}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            City
          </Typography>

          <TextField
            {...textProps}
            name="city"
            value={values.city}
            onChange={onChange}
            placeholder="Enter city"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Address
          </Typography>

          <TextField
            {...textProps}
            name="address"
            value={values.address}
            onChange={onChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Notes
          </Typography>

          <TextField
            {...textProps}
            name="notes"
            value={values.notes}
            onChange={onChange}
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default InvoiceDetailsCard;