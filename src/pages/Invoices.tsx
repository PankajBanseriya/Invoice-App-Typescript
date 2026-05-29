import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Typography, Stack, Grid, Card } from "@mui/material";
import { useGridApiRef } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useInvoices, useInvoiceChart } from "../hooks/useInvoices";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import DateRangeDialog from "../components/invoices/DateRangeDialog";
import AppSearchField from "../components/common/SearchInput";
import InvoiceActions from "../components/invoices/InvoiceActions";
import InvoiceFilterButtons from "../components/invoices/InvoiceFilterButtons";
import InvoiceTable from "../components/invoices/InvoiceTable";
import { getInvoiceColumns } from "../components/invoices/invoiceColumns";

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
}

interface CustomDates {
  from: string | null;
  to: string | null;
}

interface ChartData {
  amountSum: number;
  invoiceCount: number;
  monthStart: string;
}

const Invoices = () => {
  const navigate = useNavigate();
  const apiRef = useGridApiRef();
  const [search, setSearch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("Month");
  const [dateDialogOpen, setDateDialogOpen] = useState<boolean>(false);
  const [customDates, setCustomDates] = useState<CustomDates>({
    from: null,
    to: null,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );

  const dateParams = useMemo(() => {
    const today = new Date();
    let from: string | null;
    let to: string | null = null;

    switch (activeFilter) {
      case "Today":
        from = format(today, "yyyy-MM-dd");
        break;
      case "Week":
        from = format(subDays(today, 7), "yyyy-MM-dd");
        break;
      case "Month":
        from = format(subDays(today, 30), "yyyy-MM-dd");
        break;
      case "Year":
        from = format(subDays(today, 365), "yyyy-MM-dd");
        break;
      case "Custom":
        from = customDates.from;
        to = customDates.to;
        break;
      default:
        from = format(subDays(today, 30), "yyyy-MM-dd");
    }

    return { from, to };
  }, [activeFilter, customDates]);

  const {
    invoices,
    invoiceMetrics,
    isLoadingMetrics,
    deleteInvoice,
    topItems,
    isLoadingTopItems,
  } = useInvoices(dateParams.from, dateParams.to);

  const { data } = useInvoiceChart();

  const chartData = data.map((item: ChartData) => {
    const date = new Date(item.monthStart);

    return {
      month: date.toLocaleString("default", {
        month: "short",
      }),

      amount: item.amountSum,
      invoices: item.invoiceCount,
    };
  });

  const pieData = useMemo(() => {
    return topItems.map((item, index: number) => ({
      id: index,
      value: item.amountSum,
      label: item.itemName,
    }));
  }, [topItems]);

  const handleDeleteClick = (id: number) => {
    setSelectedInvoiceId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedInvoiceId !== null) {
      deleteInvoice(selectedInvoiceId);
      setDeleteModalOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  const handleInvoiceRange = (label: string) => {
    if (label === "Custom") {
      setDateDialogOpen(true);
    } else {
      setActiveFilter(label);
    }
  };

  const handleCustomDateApply = (dates: CustomDates) => {
    setCustomDates(dates);
    setActiveFilter("Custom");
  };

  const columns = getInvoiceColumns({
    navigate,
    handleDeleteClick,
  });

  const filteredRows = invoices.filter((row: Invoice) => {
    const searchTerm = search.toLowerCase();

    return (
      row.invoiceNo?.toLowerCase().includes(searchTerm) ||
      row.customerName?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Box
      sx={{
        width: "95%",
        mx: "auto",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h5" component="h2" fontWeight="500">
          Invoices
        </Typography>

        <InvoiceFilterButtons
          activeFilter={activeFilter}
          onChange={handleInvoiceRange}
        />
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: "150px",
            }}
          >
            <Typography variant="h4" fontWeight="500">
              {isLoadingMetrics ? "..." : invoiceMetrics?.invoiceCount}
            </Typography>
            <Typography color="text.secondary">Number of Invoices</Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFilter}
            </Typography>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: "150px",
            }}
          >
            <Typography variant="h4" fontWeight="500">
              {isLoadingMetrics
                ? "..."
                : `$${invoiceMetrics?.totalAmount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`}
            </Typography>

            <Typography color="text.secondary">Total Invoice Amount</Typography>

            <Typography variant="caption" color="text.secondary">
              {activeFilter}
            </Typography>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              py: 2,
              px: 3,
              height: "150px",
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography color="textSecondary" fontSize={13} mb={2}>
              Last 12 Months
            </Typography>

            <Card
              variant="outlined"
              sx={{
                height: "75%",
                bgcolor: "#eee",
                border: "none",
              }}
            >
              <LineChart
                height={100}
                series={[
                  {
                    data: chartData.map((item) => item.amount),
                    label: "Revenue",
                    valueFormatter: (value: number | null) =>
                      `₹ ${value?.toFixed(2)}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: chartData.map((item) => item.month),
                  },
                ]}
              />
            </Card>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              py: 2,
              px: 3,
              height: "150px",
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography color="textSecondary" fontSize={13} mb={2}>
              Top 5 Items
            </Typography>
            <Box
              sx={{
                height: "85%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: -0.4,
              }}
            >
              {isLoadingTopItems ? (
                <Typography variant="caption">Loading...</Typography>
              ) : pieData.length > 1 ? (
                <PieChart
                  width={150}
                  height={150}
                  margin={{
                    top: 30,
                    bottom: 30,
                    left: 0,
                    right: 35,
                  }}
                  series={[
                    {
                      data: pieData,
                      innerRadius: 25,
                      outerRadius: 50,
                      paddingAngle: 2,
                      cornerRadius: 3,
                    },
                  ]}
                  slotProps={{
                    legend: {
                      sx: {
                        maxWidth: 120,
                        overflow: "hidden",
                        "& .MuiChartsLegend-label": {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Typography variant="caption" color="textDisabled">
                  No data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
        mb={2}
        gap={2}
      >
        <AppSearchField
          placeholder="Search Invoice No, Customer..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
        <InvoiceActions apiRef={apiRef} />
      </Stack>

      <InvoiceTable apiRef={apiRef} rows={filteredRows} columns={columns} />

      <DateRangeDialog
        open={dateDialogOpen}
        onClose={() => setDateDialogOpen(false)}
        onApply={handleCustomDateApply}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? All associated data will be removed."
      />
    </Box>
  );
};
export default Invoices;
