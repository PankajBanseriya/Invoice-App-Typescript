import {
  Backdrop,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

interface Props {
  open: boolean;
  text?: string;
}

export default function LoadingBackdrop({
  open,
  text = "Processing...",
}: Props) {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Box textAlign="center">
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>
          {text}
        </Typography>
      </Box>
    </Backdrop>
  );
}