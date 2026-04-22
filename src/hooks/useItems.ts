import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";
import { imageCache } from "../components/item/ItemsImage";
import { AxiosError } from "axios";

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

export const useItems = () => {
  const queryClient = useQueryClient();

  // Fetch All Items
  const itemsQuery = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/Item/GetList");
      return response.data;
    },
  });

  // Add Item
  const addMutation = useMutation({
    mutationFn: async (newItem: Partial<Item>) => {
      const response = await api.post("/Item", newItem);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err: AxiosError<string>) => {
      const errorMessage = err.response?.data || "Failed to add item.";
      toast.error(errorMessage);
    },
  });

  // Edit Item
  const editMutation = useMutation({
    mutationFn: (updatedItem: Item) => api.put(`/Item`, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err: AxiosError<string>) => {
      toast.error(err.response?.data || "Update failed.");
    },
  });

  // Delete Item
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/Item/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted!");
    },
    onError: (err: AxiosError<string>) =>
      toast.error(err.response?.data || "Could not delete item."),
  });

  // Update Item Picture
  const updatePictureMutation = useMutation({
    mutationFn: async ({ itemID, file }: UpdatePictureArgs) => {
      const imageData = new FormData();
      imageData.append("ItemID", itemID.toString());
      imageData.append("File", file);
      return api.post("/Item/UpdateItemPicture", imageData);
    },
    onSuccess: (_data, variables) => {
      if (variables.itemID) {
        delete imageCache[variables.itemID.toString()];
      }
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({
        queryKey: ["itemPicture", variables.itemID],
      });
    },
    onError: (err: AxiosError<string>) => {
      const errorMessage = err.response?.data || "Image upload failed.";
      toast.error(errorMessage);
    },
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,

    addItem: addMutation.mutate,
    isAdding: addMutation.isPending,
    addItemAsync: addMutation.mutateAsync,

    updateItem: editMutation.mutateAsync,
    isUpdating: editMutation.isPending,

    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    updatePictureAsync: updatePictureMutation.mutateAsync,
  };
};