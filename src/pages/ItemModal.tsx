import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Avatar,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { imageCache } from "../components/item/ItemsImage";
import { useItems } from "../hooks/useItems";
import type { Item } from "../hooks/useItems";
import api from "../api/axios";
import toast from "react-hot-toast";

// --- Types ---
interface ItemModalProps {
  open: boolean;
  handleClose: () => void;
  activeItem: Item | null;
}

interface FormData {
  itemName: string;
  description: string;
  salesRate: string | number;
  discountPct: string | number;
}

interface FormErrors {
  itemName?: string;
  salesRate?: string;
  discountPct?: string;
}

const ItemModal: React.FC<ItemModalProps> = ({
  open,
  handleClose,
  activeItem,
}) => {
  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    description: "",
    salesRate: 0,
    discountPct: 0,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { addItemAsync, updateItem, updatePictureAsync } = useItems();

  const fetchExistingImage = async (id: number) => {
    try {
      const idStr = id.toString();
      if (imageCache[idStr]) {
        setLogoPreview(imageCache[idStr]);
        return;
      }
      const response = await api.get(`/Item/Picture/${id}`);
      if (response.data && typeof response.data === "string") {
        const cleanUrl = response.data.replace(/^"|"$/g, "");
        setLogoPreview(cleanUrl);
      } else {
        setLogoPreview(null);
      }
    } catch (error) {
      console.error("Error fetching existing image", error);
      setLogoPreview(null);
    }
  };

  useEffect(() => {
    setLogoPreview(null);
    setLogoFile(null);
    setErrors({});
    setIsSaving(false);

    if (activeItem) {
      setFormData({
        itemName: activeItem.itemName || "",
        description: activeItem.description || "",
        salesRate: activeItem.salesRate || 0,
        discountPct: activeItem.discountPct || 0,
      });
      fetchExistingImage(activeItem.itemID);
    } else {
      setFormData({
        itemName: "",
        description: "",
        salesRate: "",
        discountPct: "",
      });
    }
  }, [activeItem, open]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    let tempErrors: FormErrors = {};

    // Item Name Validation
    if (!formData.itemName.trim())
      tempErrors.itemName = "Item Name is required.";
    if (formData.itemName.length > 50)
      tempErrors.itemName = "Max 50 characters allowed.";

    // Sales Rate Validation
    const rateStr = formData.salesRate.toString();
    const rateValue = parseFloat(rateStr);

    // Regex Explanation:
    // ^\d{1,10} -> Start with 1 to 10 digits
    // (\.\d{1,2})?$ -> Optional dot followed by 1 to 2 digits at the end
    const salesRateRegex = /^\d{1,10}(\.\d{1,2})?$/;

    if (!rateStr.trim() || rateStr === "") {
      tempErrors.salesRate = "Sale Rate is required.";
    } else if (rateValue < 0) {
      tempErrors.salesRate = "Sale Rate cannot be negative.";
    } else if (!salesRateRegex.test(rateStr)) {
      tempErrors.salesRate =
        "Max 10 digits and 2 decimal places allowed (e.g. 9999999999.99).";
    }

    // Discount Validation
    const disc =
      typeof formData.discountPct === "string"
        ? parseFloat(formData.discountPct)
        : formData.discountPct;
    if (disc < 0 || disc > 100) {
      tempErrors.discountPct = "Discount must be between 0 and 100%.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type))
      return toast.error("Only PNG/JPG allowed.");
    if (file.size > maxSize) return toast.error("Max size is 5MB.");

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);

    const payload: Partial<Item> = {
      itemName: formData.itemName,
      description: formData.description,
      salesRate: parseFloat(formData.salesRate.toString() || "0"),
      discountPct: parseFloat(formData.discountPct.toString() || "0"),
    };

    try {
      if (activeItem) {
        if (logoFile) {
          await updatePictureAsync({
            itemID: activeItem.itemID,
            file: logoFile,
          });
        }

        payload.itemID = activeItem.itemID;
        payload.updatedOn = activeItem.updatedOn;
        await updateItem(payload as Item);
        toast.success("Item updated successfully!");
      } else {
        const response = await addItemAsync(payload);
        const newItemId = response.data.primaryKeyID;
        if (logoFile && newItemId) {
          await updatePictureAsync({ itemID: newItemId, file: logoFile });
        }
        toast.success("Item added successfully!");
      }
      handleClose();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { overflowX: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {activeItem ? "Edit Item" : "New Item"}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Item Picture
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              variant="rounded"
              src={logoPreview ?? ""}
              sx={{ width: 80, height: 80 }}
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
                {logoPreview ? "Change File" : "Choose File"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
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

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
          Item Name*
        </Typography>
        <TextField
          fullWidth
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="Enter item name"
          size="small"
          sx={{ mb: 3 }}
          error={!!errors.itemName}
          helperText={errors.itemName}
        />

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
          Description
        </Typography>
        <TextField
          fullWidth
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter item description"
          multiline
          rows={3}
          size="small"
          inputProps={{ maxLength: 500 }}
        />
        <Typography
          variant="caption"
          align="right"
          display="block"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {formData.description.length}/500
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Sale Rate*
            </Typography>
            <TextField
              fullWidth
              name="salesRate"
              type="number"
              value={formData.salesRate}
              onChange={handleChange}
              error={!!errors.salesRate}
              helperText={errors.salesRate}
              inputProps={{ style: { textAlign: "right" } }}
              placeholder="0.00"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Discount %
            </Typography>
            <TextField
              fullWidth
              name="discountPct"
              type="number"
              value={formData.discountPct}
              onChange={handleChange}
              error={!!errors.discountPct}
              helperText={errors.discountPct}
              size="small"
              placeholder="0"
              inputProps={{ style: { textAlign: "right" } }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          variant="contained"
          sx={{
            bgcolor: "#444",
            "&:hover": { bgcolor: "#222" },
            textTransform: "none",
            px: 4,
          }}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemModal;
