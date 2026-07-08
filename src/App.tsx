import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";

// Public Pages
import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import VendorProfile from "./pages/VendorProfile";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import VendorsDashboard from "./pages/VendorsDashboard";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Vendor Dashboard Route (No Client Layout) */}
        <Route path="/vendors" element={<VendorsDashboard />} />

        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore-vendors" element={<Vendors />} />
          <Route path="/vendor/:id" element={<VendorProfile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}
