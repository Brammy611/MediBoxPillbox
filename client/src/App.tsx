import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientSetup from "./pages/PatientSetup";
import DashboardUtama from "./pages/DashboardUtama";
import FamilyDashboard from "./pages/FamilyDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes - Tanpa Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Semi-Protected Route - Perlu login tapi belum setup pasien */}
          <Route 
            path="/setup-pasien" 
            element={
              <ProtectedRoute>
                <PatientSetup />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes - Dengan Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          
          {/* Protected Routes - Dengan Layout */}
          <Route 
            path="/dashboard-utama" 
            element={
              <ProtectedRoute>
                <Layout><DashboardUtama /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/family" 
            element={
              <ProtectedRoute>
                <Layout><FamilyDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pharmacy" 
            element={
              <ProtectedRoute>
                <Layout><PharmacyDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
