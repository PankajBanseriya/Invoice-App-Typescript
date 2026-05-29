import type { ChangeEvent } from "react";

import {
  Box,
  Avatar,
  Typography,
  Button,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ItemImageUploadProps {
  preview: string | null;
  onChange: (
    e: ChangeEvent<HTMLInputElement>,
  ) => void;
}

const ItemImageUpload = ({
  preview,
  onChange,
}: ItemImageUploadProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="body2"
        gutterBottom
        color="text.secondary"
      >
        Item Picture
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          variant="rounded"
          src={preview ?? ""}
          sx={{
            width: 80,
            height: 80,
          }}
        >
          <CloudUploadIcon />
        </Avatar>

        <Box>
          <Button
            variant="outlined"
            component="label"
            size="small"
            sx={{
              textTransform: "none",
              color: "black",
              borderColor: "#ccc",
            }}
          >
            {preview
              ? "Change File"
              : "No file chosen"}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={onChange}
            />
          </Button>

          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            PNG or JPG, max 5MB
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ItemImageUpload;