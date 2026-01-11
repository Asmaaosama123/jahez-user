import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    navigate("/admin/login", { replace: true });
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 text-white rounded">
      تسجيل الخروج
    </button>
  );
}
