import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("isAuthenticated");

  if (!token) {
    // لو مفيش token → ارجع Login
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
