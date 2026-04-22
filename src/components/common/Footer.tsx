import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      textAlign="center"
      component="footer"
      width="100%"
      bgcolor="background.paper"
      mt={2}
    >
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 500,
          mt: 1,
          py: 1,
        }}
      >
        <Typography color="text.secondary" fontSize={13} mb={1}>
          © 2026 InvoiceApp. All rights reserved.
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            color: "text.secondary",
          }}
        >
          <Typography fontSize={13} sx={{ cursor: "pointer" }}>
            Privacy Policy
          </Typography>
          <Typography fontSize={13} sx={{ cursor: "pointer" }}>
            Terms of Service
          </Typography>
          <Typography fontSize={13} sx={{ cursor: "pointer" }}>
            Support
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;