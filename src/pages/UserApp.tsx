import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import RestaurantPage from "./RestaurantPage";
import Cart from "./Cart";
import PublicOrder from "./PublicOrder";
import PrivacyPolicy from "./privacy";
import OrderSuccess from "./OrderSuccess";

export default function UserApp() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/restaurant/:name" element={<RestaurantPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/public-order/:orderId" element={<PublicOrder />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/order-success" element={<OrderSuccess />} />

    </Routes>
  );
}
