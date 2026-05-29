import { useState } from "react";
import type { ChangeEvent } from "react";

import { Box, Typography, Card, Stack, Divider, Paper } from "@mui/material";
import { useGridApiRef, GridPreferencePanelsValue } from "@mui/x-data-grid";

import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { IoArrowBack } from "react-icons/io5";
import { useItems } from "../hooks/useItems";
import ItemModal from "./ItemModal";
import ItemImage from "../components/item/ItemsImage";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import PageHeader from "../components/item/PageHeader";
import SearchInput from "../components/common/SearchInput";
import GridActionButton from "../components/common/GridActionButton";
import ItemToolbar from "../components/item/ItemToolbar";

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

  const capitalizeFirst = (text: string): string => {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleOpenAdd = () => {
    setActiveItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Item) => {
    setActiveItem(item);
    setModalOpen(true);
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

  const handleExport = () => {
    apiRef.current?.exportDataAsCsv({
      fileName: "items-data",
      fields: ["itemName", "description", "salesRate", "discountPct"],
    });
  };

  const handleColumns = () => {
    apiRef.current?.showPreferences(GridPreferencePanelsValue.columns);
  };

  const columns: GridColDef<Item>[] = [
    {
      field: "picture",
      headerName: "Picture",
      sortable: false,
      disableReorder: true,
      width: 100,
      minWidth: 80,

      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" height="100%">
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
          fontSize="16px"
          fontWeight={500}
          color="primary"
          sx={{
            cursor: "pointer",

            "&:hover": {
              textDecoration: "underline",
            },
          }}
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
            lineHeight: 1.4,
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
          <GridActionButton
            icon={<EditSquareIcon />}
            onClick={() => handleOpenEdit(params.row)}
          />

          <GridActionButton
            icon={<DeleteIcon />}
            onClick={() => handleDeleteClick(params.row.itemID)}
          />
        </Box>
      ),
    },
  ];

  const filteredItems = items.filter((item: Item) =>
    (item.itemName + (item.description || ""))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <Box width="95%" mx="auto">
      <PageHeader
        title="Items"
        subtitle="Manage your product and service catalog."
        rightContent={
          <Typography
            sx={{
              display: "flex",
              gap: 0.5,
              textTransform: "capitalize",
              fontSize: "15px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/invoices")}
          >
            <IoArrowBack fontSize={20} />
            Back to Dashboard
          </Typography>
        }
      />

      <Divider />

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        justifyContent="space-between"
        my={2}
      >
        <SearchInput
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search items..."
        />

        <ItemToolbar
          onAdd={handleOpenAdd}
          onExport={handleExport}
          onColumns={handleColumns}
        />
      </Stack>

      <Divider />

      <Card sx={{ mt: 1.5 }}>
        <Paper
          sx={{
            height: 370,
            width: "100%",
          }}
        >
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
