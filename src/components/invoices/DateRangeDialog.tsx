import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AppButton from "../common/AppButton";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (dates: { from: string | null; to: string | null }) => void;
}

const DateRangeDialog = ({ open, onClose, onApply }: Props) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const handleApply = () => {
    onApply({
      from: fromDate ? fromDate.toISOString().split("T")[0] : null,
      to: toDate ? toDate.toISOString().split("T")[0] : null,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Date Range</DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} mt={1}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
            />

            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: "text.primary",
          }}
        >
          Cancel
        </Button>

        <AppButton onClick={handleApply}>
          Apply
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;
