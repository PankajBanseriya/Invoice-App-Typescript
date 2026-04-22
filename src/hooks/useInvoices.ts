import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// --- Interfaces ---

export interface Invoice {
  primaryKeyID: number;
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  totalItems: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  updatedOn?: string;
}

export interface InvoiceMetrics {
  invoiceCount: number;
  totalAmount: number;
}

export interface TopItem {
  itemName: string;
  amountSum: number;
}

export interface InvoiceTrend {
  monthStart: string;
  amountSum: number;
  invoiceCount: number;
}

interface QueryParams {
  fromDate: string | null;
  toDate?: string | null;
  topN?: number;
}

export const useInvoices = (fromDate: string | null, toDate: string | null) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch Invoices
  const invoicesQuery = useQuery<Invoice[]>({
    queryKey: ["invoices", fromDate, toDate],
    queryFn: async () => {
      const params: QueryParams = { fromDate };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetList", { params });
      return response.data;
    },
  });

  // Fetch Invoice Metrics
  const invoiceMetrics = useQuery<InvoiceMetrics>({
    queryKey: ["invoiceMetrics", fromDate, toDate],
    queryFn: async () => {
      const params: QueryParams = { fromDate };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetMetrices", { params });

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      return data || { invoiceCount: 0, totalAmount: 0 };
    },
  });

  // Fetch top 5 items
  const topItemsQuery = useQuery<TopItem[]>({
    queryKey: ["topItems", fromDate, toDate],
    queryFn: async () => {
      const params: QueryParams = { fromDate, topN: 5 };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/TopItems", { params });
      return response.data;
    },
  });

  // Add Invoice
  const addMutation = useMutation({
    mutationFn: (newInvoice: Partial<Invoice>) =>
      api.post("/Invoice", newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice Created Successfully.");
      navigate("/invoices");
    },
    onError: (err: AxiosError<string>) => {
      toast.error(err.response?.data || "Failed to create invoice.");
    },
  });

  // Update Invoice
  const updateMutation = useMutation({
    mutationFn: (updatedInvoice: Invoice) =>
      api.put("/Invoice", updatedInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated successfully!");
      navigate("/invoices");
    },
    onError: (err: AxiosError<string>) => {
      toast.error(err.response?.data || "Failed to update invoice.");
    },
  });

  // Delete Invoice
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/Invoice/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoiceMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["topItems"] });
      queryClient.invalidateQueries({ queryKey: ["invoiceChart"] });
      toast.success("Invoice deleted successfully!");
    },
    onError: (err: AxiosError<string>) => {
      toast.error(err.response?.data || "Failed to delete invoice.");
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,

    invoiceMetrics: invoiceMetrics.data,
    isLoadingMetrics: invoiceMetrics.isLoading,

    topItems: topItemsQuery.data || [],
    isLoadingTopItems: topItemsQuery.isLoading,

    addInvoice: addMutation.mutate,
    isAdding: addMutation.isPending,

    updateInvoice: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

// Line Chart
export const useInvoiceChart = () => {
  const invoiceChart = useQuery<InvoiceTrend[]>({
    queryKey: ["invoiceChart"],
    queryFn: async () => {
      const response = await api.get("/Invoice/GetTrend12m");
      return response.data;
    },
  });

  return {
    data: invoiceChart.data || [],
    isLoading: invoiceChart.isLoading,
  };
};
