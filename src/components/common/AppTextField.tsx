import {
  TextField,
  InputLabel,
  Box,
} from "@mui/material";

interface Props extends Omit<React.ComponentProps<typeof TextField>, "label"> {
  label: string;
}

export default function AppTextField({
  label,
  sx,
  ...props
}: Props) {
  return (
    <Box sx={{ width: "100%" }}>
      <InputLabel
        sx={{
          mb: 1,
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        {label}
      </InputLabel>

      <TextField
        fullWidth
        size="small"
        sx={sx}
        {...props}
      />
    </Box>
  );
}