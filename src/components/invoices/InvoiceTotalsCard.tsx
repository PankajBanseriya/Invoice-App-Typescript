import {
  Box,
  Card,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface Props {
  totals: {
    subTotal: string;
    taxAmt: string;
    invoiceAmount: string;
  };
  subTotal: number;
  taxPct: number;
  taxAmt: number;
  amountRegex: RegExp;
  onTaxPctChange: (value: string) => void;
  onTaxAmtChange: (value: string) => void;
}

const InvoiceTotalsCard = ({
  totals,
  subTotal,
  taxPct,
  taxAmt,
  amountRegex,
  onTaxPctChange,
  onTaxAmtChange,
}: Props) => {
  return (
    <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6">
            Invoice Totals
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
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
                ${totals.subTotal}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Tax
              </Typography>

              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  value={taxPct}
                  type="number"
                  sx={{ width: "100px" }}
                  onChange={(e) =>
                    onTaxPctChange(e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        %
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  size="small"
                  value={taxAmt}
                  type="number"
                  sx={{ width: "100px" }}
                  onChange={(e) =>
                    onTaxAmtChange(e.target.value)
                  }
                  error={taxAmt < 0}
                  helperText={
                    taxAmt < 0
                      ? "Negative not allowed"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        $
                      </InputAdornment>
                    ),
                  }}
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
              <Typography variant="h6">
                Invoice Amount
              </Typography>

              <Typography
                variant="h4"
                fontWeight="600"
                color={
                  !amountRegex.test(
                    (subTotal + taxAmt).toFixed(2),
                  )
                    ? "error"
                    : "inherit"
                }
              >
                ${totals.invoiceAmount}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default InvoiceTotalsCard;