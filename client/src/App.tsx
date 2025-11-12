import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import DashboardUtama from "./pages/DashboardUtama";
import FamilyDashboard from "./pages/FamilyDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard-utama" element={<DashboardUtama />} />
        <Route path="/family" element={<FamilyDashboard />} />
        <Route path="/pharmacy" element={<PharmacyDashboard />} />
      </Routes>
    </Layout>
  );
}
