import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import DashboardUtama from "./pages/DashboardUtama";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard-utama" element={<DashboardUtama />} />
      </Routes>
    </Layout>
  );
}
