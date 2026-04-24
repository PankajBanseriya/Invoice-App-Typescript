import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import OpenRoute from "./components/auth/OpenRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { CircularProgress, Box } from "@mui/material";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceForm = lazy(() => import("./pages/InvoiceForm"));
const Items = lazy(() => import("./pages/Items"));

function App() {
  return (
    <>
      <ErrorBoundary>
        <Suspense
          fallback={
            <Box sx={{ height: "80vh" ,display: "flex", justifyContent: "center", alignItems: "center" }}>
              <CircularProgress color="inherit" />
            </Box>
          }
        >
          <Header />
          <Routes>
            <Route element={<OpenRoute />}>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/form" element={<InvoiceForm />} />
              <Route path="/items" element={<Items />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
