import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, initialLoading } = useAuth();

  // Saat initialLoading, tampilkan konten (Sidebar & Topbar akan show skeleton)
  // Jangan tampilkan full screen loading
  if (initialLoading) {
    return <>{children}</>;
  }

  // Setelah loading selesai, redirect ke login jika tidak ada user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
