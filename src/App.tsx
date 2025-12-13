import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import CreateRestaurant from "./AdminPages/CreateRestaurant";
import RestaurantsPage from "./AdminPages/RestaurantsPage";
import Sidebar from "./components/Sidebar";
import RestaurantDetails from "./AdminPages/RestaurantDetails";
import OrdersPage from "./pages/OrdersPage";
import PublicOrder from "./pages/PublicOrder"; // ✅ حرف كبير

function App() {
  return (
    <CartProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* الصفحة الرئيسية / عرض طلب */}
        <Route path="/" element={<Home />} />
        <Route path="/public-order/:orderId" element={<PublicOrder />} />

        {/* باقي الصفحات */}
        <Route path="/restaurant/:name" element={<RestaurantPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/CreateRestaurant" element={<CreateRestaurant />} />
        <Route path="/RestaurantsPage" element={<RestaurantsPage />} />
        <Route path="/category/:categoryType" element={<RestaurantsPage />} />
        <Route path="/restaurantDetails/:id" element={<RestaurantDetails />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
