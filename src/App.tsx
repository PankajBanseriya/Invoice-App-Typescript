import { Navigate, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Items from "./pages/Items";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import OpenRoute from "./components/auth/OpenRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
