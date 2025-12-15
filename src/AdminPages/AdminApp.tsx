import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import OrdersPage from "../pages/OrdersPage";
import CreateRestaurant from "./CreateRestaurant";
import RestaurantsPage from "./RestaurantsPage";
import RestaurantDetails from "./RestaurantDetails";
import LayoutWithSidebar from "./LayoutWithSidebar";

export default function AdminApp() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  return (
    <Routes>
      {/* صفحة تسجيل الدخول */}
      <Route path="/login" element={<LoginPage />} />

      {/* كل صفحات الإدارة داخل LayoutWithSidebar */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <LayoutWithSidebar />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      >
        {/* Default route عند الدخول للـ admin */}
        <Route index element={<OrdersPage />} />

        {/* باقي الصفحات */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="CreateRestaurant" element={<CreateRestaurant />} />
        <Route path="RestaurantsPage" element={<RestaurantsPage />} />
        <Route path="category/:categoryType" element={<RestaurantsPage />} />
        <Route path="restaurantDetails/:id" element={<RestaurantDetails />} />
      </Route>
    </Routes>
  );
}
