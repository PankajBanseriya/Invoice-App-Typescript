  import { useState } from "react";
  import type { ChangeEvent } from "react";
  import {
    Box,
    Typography,
    Card,
    Button,
    IconButton,
    OutlinedInput,
    Stack,
    InputAdornment,
    Divider,
  } from "@mui/material";
  import { useNavigate } from "react-router-dom";
  import { useGridApiRef, GridPreferencePanelsValue } from "@mui/x-data-grid";
  import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
  
  import { FaColumns, FaDownload } from "react-icons/fa";
  import EditSquareIcon from "@mui/icons-material/EditSquare";
  import DeleteIcon from "@mui/icons-material/Delete";
  import AddIcon from "@mui/icons-material/Add";
  import SearchIcon from "@mui/icons-material/Search";
  import Paper from "@mui/material/Paper";
  import { useItems } from "../hooks/useItems";
  import ItemModal from "./ItemModal";
  import { IoArrowBack } from "react-icons/io5";
  import ItemImage from "../components/item/ItemsImage";
  import { DataGrid } from "@mui/x-data-grid";
  import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";

  export interface Item {
    itemID: number;
    primaryKeyID: number;
    itemName: string;
    description: string;
    salesRate: number;
    discountPct: number;
    updatedOn?: string;
  }

  const Items = () => {
    const navigate = useNavigate();
    const apiRef = useGridApiRef();

    const [search, setSearch] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeItem, setActiveItem] = useState<Item | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const { items, deleteItem } = useItems();

    const handleOpenAdd = () => {
      setActiveItem(null);
      setModalOpen(true);
    };

    const handleOpenEdit = (item: Item) => {
      setActiveItem(item);
      setModalOpen(true);
    };

    const capitalizeFirst = (text: string): string => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleDeleteClick = (id: number) => {
      setSelectedItemId(id);
      setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
      if (selectedItemId !== null) {
        deleteItem(selectedItemId);
        setDeleteModalOpen(false);
        setSelectedItemId(null);
      }
    };

    const columns: GridColDef<Item>[] = [
      {
        field: "picture",
        headerName: "Picture",
        sortable: false,
        // reorderable: false,
        disableReorder: true,
        width: 100,
        minWidth: 80,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction={"row"} alignItems={"center"} height={"100%"}>
            <ItemImage itemID={params.row.itemID} />
          </Stack>
        ),
      },
      {
        field: "itemName",
        headerName: "Item Name",
        width: 300,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <Typography
            fontSize={"16px"}
            fontWeight={500}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            color="primary"
            onClick={() => handleOpenEdit(params.row)}
          >
            {capitalizeFirst(params.row.itemName)}
          </Typography>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        width: 600,
        minWidth: 400,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              lineHeight: "1.4",
              fontSize: "16px",
              color: "text.secondary",
            }}
          >
            {capitalizeFirst(params.row.description) || "No description"}
          </Box>
        ),
      },
      {
        field: "salesRate",
        headerName: "Sale Rate",
        width: 150,
        minWidth: 150,
        type: "number",
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize={16}>
            ${params.row.salesRate?.toFixed(2)}
          </Typography>
        ),
      },
      {
        field: "discountPct",
        headerName: "Discount %",
        width: 120,
        minWidth: 120,
        type: "number",
        renderCell: (params: GridRenderCellParams) => (
          <Typography fontSize={16}>
            {params.row.discountPct?.toFixed(2)}%
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        flex: 1,
        disableReorder: true,
        headerAlign: "right",
        align: "right",
        minWidth: 120,
        hideable: false,
        resizable: false,
        headerClassName: "actions",
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
              <EditSquareIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.itemID)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ];

    const filteredItems = items.filter((item: Item) =>
      (item.itemName + (item.description ? item.description : ""))
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return (
      <Box width={"95%"} mx="auto">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="400" mb={0.75} fontSize={"30px"}>
              Items
            </Typography>
            <Typography variant="body2" fontSize={16} color="textSecondary">
              Manage your product and service catalog.
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ display: "flex", gap: 0.5, textTransform: "capitalize", fontSize: "15px", cursor: 'pointer' }}
              
              onClick={() => navigate("/invoices")}
            >
              <IoArrowBack fontSize={20} />
              Back to Dashboard
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          my={2}
        >
          <OutlinedInput
            name="search"
            type="text"
            size="medium"
            placeholder="Search items..."
            sx={{ height: "40px", mr: "10px", flex: 0.5 }}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />

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
              onClick={handleOpenAdd}
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
              size="medium"
              onClick={() =>
                apiRef.current?.exportDataAsCsv({
                  fileName: "items-data",
                  fields: ["itemName", "description", "salesRate", "discountPct"],
                })
              }
            >
              <FaDownload style={{ marginRight: "10px" }} fontSize={16} />
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
              size="medium"
              onClick={() => apiRef.current?.showPreferences(GridPreferencePanelsValue.columns)}
            >
              <FaColumns fontSize={20} />
            </Button>
          </Box>
        </Stack>
        <Divider />

        <Card sx={{ mt: 1.5 }}>
          <Paper sx={{ height: 370, width: "100%" }}>
            <DataGrid
              apiRef={apiRef}
              rows={filteredItems}
              getRowId={(row: Item) => row.primaryKeyID}
              columns={columns}
              getRowHeight={() => "auto"}
              hideFooter
              sx={{
                border: 0,
                px: 2,
                "& .MuiDataGrid-cell": {
                  p: 2,
                },
                "& .actions": {
                  paddingRight: "25px !important",
                },
              }}
            />
          </Paper>
        </Card>

        <ItemModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          activeItem={activeItem}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          handleClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Item"
          message="Are you sure you want to delete this item? This will remove it from your catalog permanently."
        />
      </Box>
    );
  };

  export default Items;