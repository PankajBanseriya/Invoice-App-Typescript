import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useItems } from "../hooks/useItems";
import type { Item } from "../hooks/useItems";
import { imageCache } from "../components/item/ItemsImage";
import ItemImageUpload from "../components/item/ItemImageUpload";
import ItemFormFields from "../components/item/ItemFormFields";
import { validateItem, type ItemErrors } from "../utils/validators/itemValidator";
import AppButton from "../components/common/AppButton";

interface ItemModalProps {
  open: boolean;
  handleClose: () => void;
  activeItem: Item | null;
}

export interface FormData {
  itemName: string;
  description: string;
  salesRate: string | number;
  discountPct: string | number;
}

const ItemModal: React.FC<ItemModalProps> = ({
  open,
  handleClose,
  activeItem,
}) => {
  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    description: "",
    salesRate: "",
    discountPct: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<ItemErrors>({});
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
    setErrors({});
    setLogoFile(null);
    setLogoPreview(null);
    setIsSaving(false);

    if (activeItem) {
      setFormData({
        itemName: activeItem.itemName || "",
        description: activeItem.description || "",
        salesRate: activeItem.salesRate || "",
        discountPct: activeItem.discountPct || "",
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG/JPG allowed.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Max size is 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const validationErrors = validateItem(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    const payload: Partial<Item> = {
      itemName: formData.itemName,
      description: formData.description,
      salesRate: parseFloat(formData.salesRate.toString()),
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
          await updatePictureAsync({
            itemID: newItemId,
            file: logoFile,
          });
        }

        toast.success("Item added successfully!");
      }

      handleClose();
    } catch (error) {
      console.error("Save failed", error);
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
        <ItemImageUpload preview={logoPreview} onChange={handleFileChange} />

        <ItemFormFields
          formData={formData}
          errors={errors}
          handleChange={handleChange}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <AppButton
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </AppButton>

        <Button
          onClick={handleClose}
          color="inherit"
          sx={{
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemModal;
