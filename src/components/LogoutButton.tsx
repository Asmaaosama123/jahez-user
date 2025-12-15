import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // ✅ إزالة حالة الدخول
    localStorage.removeItem("username");
    navigate("/admin/login", { replace: true }); // ✅ ارجع لصفحة اللوجين
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      تسجيل الخروج
    </button>
  );
}
