import { Stack, Button } from "@mui/material";

interface Props {
  activeFilter: string;
  onChange: (label: string) => void;
}

const filters = ["Today", "Week", "Month", "Year", "Custom"];

export default function InvoiceFilterButtons({
  activeFilter,
  onChange,
}: Props) {
  return (
    <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1}>
      {filters.map((label) => {
        const isActive = activeFilter === label;

        return (
          <Button
            key={label}
            variant="contained"
            onClick={() => onChange(label)}
            sx={{
              bgcolor: isActive ? "#1a1a1a" : "#f1f3f5",

              color: isActive ? "#ffffff" : "#495057",

              borderRadius: "50px",
              textTransform: "none",
              fontSize: "14px",
              px: 2,
              py: 0.5,
              fontWeight: isActive ? "500" : "400",

              boxShadow: "none",

              "&:hover": {
                bgcolor: isActive ? "#000000" : "#e9ecef",

                boxShadow: "none",
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
