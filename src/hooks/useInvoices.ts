import useSWR, { mutate as globalMutate } from "swr";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

const fetcher = (url: string, params?: QueryParams) =>
  api.get(url, { params }).then((res) => res.data);

const getErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<string>;
  return axiosErr?.response?.data || fallback;
};

const invalidateAllInvoiceKeys = async (
  fromDate: string | null,
  toDate: string | null
) => {
  await Promise.all([
    globalMutate(["invoices", fromDate, toDate]),
    globalMutate(["invoiceMetrics", fromDate, toDate]),
    globalMutate(["topItems", fromDate, toDate]),
    globalMutate(["invoiceChart"]),
  ]);
};

export const useInvoices = (fromDate: string | null, toDate: string | null) => {
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dateParams: QueryParams = fromDate
    ? { fromDate, ...(toDate ? { toDate } : {}) }
    : { fromDate: null };

  // Fetch Invoices
  const { data: invoicesData, isLoading } = useSWR<Invoice[]>(
    ["invoices", fromDate, toDate],
    () => fetcher("/Invoice/GetList", dateParams)
  );

  // Fetch Invoice Metrics
  const { data: invoiceMetricsData, isLoading: isLoadingMetrics } =
    useSWR<InvoiceMetrics>(
      ["invoiceMetrics", fromDate, toDate],
      async () => {
        const response = await api.get("/Invoice/GetMetrices", {
          params: dateParams,
        });
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        return data || { invoiceCount: 0, totalAmount: 0 };
      }
    );

  // Fetch Top 5 Items
  const { data: topItemsData, isLoading: isLoadingTopItems } = useSWR<
    TopItem[]
  >(
    ["topItems", fromDate, toDate],
    () => fetcher("/Invoice/TopItems", { ...dateParams, topN: 5 })
  );

  // Add Invoice
  const addInvoice = (newInvoice: Partial<Invoice>) => {
    (async () => {
      setIsAdding(true);
      try {
        await api.post("/Invoice", newInvoice);
        await globalMutate(["invoices", fromDate, toDate]);
        toast.success("Invoice Created Successfully.");
        navigate("/invoices");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to create invoice."));
      } finally {
        setIsAdding(false);
      }
    })();
  };

  // Update Invoice
  const updateInvoice = (updatedInvoice: Invoice) => {
    (async () => {
      setIsUpdating(true);
      try {
        await api.put("/Invoice", updatedInvoice);
        await globalMutate(["invoices", fromDate, toDate]);
        toast.success("Invoice updated successfully!");
        navigate("/invoices");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to update invoice."));
      } finally {
        setIsUpdating(false);
      }
    })();
  };

  // Delete Invoice
  const deleteInvoice = (id: number) => {
    (async () => {
      setIsDeleting(true);
      try {
        await api.delete(`/Invoice/${id}`);
        await invalidateAllInvoiceKeys(fromDate, toDate);
        toast.success("Invoice deleted successfully!");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to delete invoice."));
      } finally {
        setIsDeleting(false);
      }
    })();
  };

  return {
    invoices: invoicesData || [],
    isLoading,

    invoiceMetrics: invoiceMetricsData,
    isLoadingMetrics,

    topItems: topItemsData || [],
    isLoadingTopItems,

    addInvoice,
    isAdding,

    updateInvoice,
    isUpdating,

    deleteInvoice,
    isDeleting,
  };
};

// Line Chart
export const useInvoiceChart = () => {
  const { data, isLoading } = useSWR<InvoiceTrend[]>(
    ["invoiceChart"],
    () => fetcher("/Invoice/GetTrend12m")
  );

  return {
    data: data || [],
    isLoading,
  };
};