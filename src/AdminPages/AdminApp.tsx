import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import OtpPage from "./OtpPage";
import OrdersPage from "../pages/OrdersPage";
import CreateRestaurant from "./CreateRestaurant";
import RestaurantsPage from "./RestaurantsPage";
import RestaurantDetails from "./RestaurantDetails";
import ProtectedRoute from "./ProtectedRoute";

export default function AdminApp() {
  return (
    <Routes>
      {/* صفحة تسجيل الدخول */}
      <Route path="/login" element={<LoginPage />} />

      {/* صفحة OTP */}
      <Route path="/otp" element={<OtpPage />} />

      {/* صفحات الإدارة محمية */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-restaurant"
        element={
          <ProtectedRoute>
            <CreateRestaurant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurants"
        element={
          <ProtectedRoute>
            <RestaurantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category/:categoryType"
        element={
          <ProtectedRoute>
            <RestaurantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurantDetails/:id"
        element={
          <ProtectedRoute>
            <RestaurantDetails />
          </ProtectedRoute>
        }
      />

      {/* أي route مش معروف → Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
