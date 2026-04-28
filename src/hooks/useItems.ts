import useSWR, { mutate as globalMutate } from "swr";
import api from "../api/axios";
import toast from "react-hot-toast";
import { imageCache } from "../components/item/ItemsImage";
import { AxiosError } from "axios";
import { useState } from "react";

export interface Item {
  itemID: number;
  primaryKeyID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  updatedOn?: string;
}

interface UpdatePictureArgs {
  itemID: number | string;
  file: File;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const getErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<string>;
  return axiosErr?.response?.data || fallback;
};

export const useItems = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);

  // Fetch all items
  const {
    data,
    isLoading,
    error: swrError,
  } = useSWR<Item[]>("/Item/GetList", fetcher);

  // Add Item
  const addItem = async (newItem: Partial<Item>) => {
    setIsAdding(true);
    try {
      const response = await api.post("/Item", newItem);
      await globalMutate("/Item/GetList");
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add item."));
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  const addItemSync = (newItem: Partial<Item>) => {
    addItem(newItem).catch(() => {});
  };

  // Update Item
  const updateItem = async (updatedItem: Item) => {
    setIsUpdating(true);
    try {
      const response = await api.put("/Item", updatedItem);
      await globalMutate("/Item/GetList");
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed."));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Item
  const deleteItem = (id: number) => {
    (async () => {
      setIsDeleting(true);
      try {
        await api.delete(`/Item/${id}`);
        await globalMutate("/Item/GetList");
        toast.success("Item deleted!");
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not delete item."));
      } finally {
        setIsDeleting(false);
      }
    })();
  };

  // Update Item Picture
  const updatePictureAsync = async ({ itemID, file }: UpdatePictureArgs) => {
    setIsUpdatingPicture(true);
    try {
      const imageData = new FormData();
      imageData.append("ItemID", itemID.toString());
      imageData.append("File", file);
      const response = await api.post("/Item/UpdateItemPicture", imageData);

      if (itemID) {
        delete imageCache[itemID.toString()];
      }
      await globalMutate("/Item/GetList");
      await globalMutate(["itemPicture", itemID]);
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err, "Image upload failed."));
      throw err;
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  return {
    items: data || [],
    isLoading,
    isError: !!swrError,

    addItem: addItemSync,       
    isAdding,
    addItemAsync: addItem,

    updateItem,
    isUpdating,

    deleteItem,
    isDeleting,

    updatePictureAsync,
    isUpdatingPicture,
  };
};