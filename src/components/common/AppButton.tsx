import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

export default function AppButton({
  children,
  sx,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="contained"
      sx={{
        textTransform: "none",
        bgcolor: "text.primary",
        px: 4,
        py: 1,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}