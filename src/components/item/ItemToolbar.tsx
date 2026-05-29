import { Box, Button } from "@mui/material";

import { FaColumns, FaDownload } from "react-icons/fa";

import AddIcon from "@mui/icons-material/Add";

interface ItemToolbarProps {
  onAdd: () => void;
  onExport: () => void;
  onColumns: () => void;
}

const ItemToolbar = ({
  onAdd,
  onExport,
  onColumns,
}: ItemToolbarProps) => {
  return (
    <Box>
      <Button
        variant="contained"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          bgcolor: "text.primary",
          py: 1,
          mb: 1,
        }}
        onClick={onAdd}
      >
        <AddIcon sx={{ mr: 1 }} />
        Add New Item
      </Button>

      <Button
        variant="outlined"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          borderColor: "text.primary",
          color: "text.primary",
          py: 0.9,
          mb: 1,
        }}
        onClick={onExport}
      >
        <FaDownload
          style={{ marginRight: "10px" }}
          fontSize={16}
        />
        Export
      </Button>

      <Button
        variant="outlined"
        sx={{
          mr: 1,
          textTransform: "capitalize",
          borderColor: "text.primary",
          color: "text.primary",
          py: 1.2,
          mb: 1,
          minWidth: "50Px",
        }}
        onClick={onColumns}
      >
        <FaColumns fontSize={20} />
      </Button>
    </Box>
  );
};

export default ItemToolbar;