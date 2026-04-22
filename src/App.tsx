import { Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Items from "./pages/Items";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";

function App() {
  return (
    <>
      <Header/>
      <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/items" element={<Items/>} />
          <Route path="/invoices" element={<Invoices/>} />
          <Route path="/invoices/form" element={<InvoiceForm />} />
      </Routes>
      <Footer/>
    </>
  );
}

export default App;
