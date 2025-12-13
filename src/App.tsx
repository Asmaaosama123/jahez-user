import { Toaster, toast } from "react-hot-toast";
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
function AppContent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
   
    </div>
  );
}


function App() {
  return (
    <>
        <CartProvider>

      <Toaster position="top-right" />
      <Routes>
      <Route path="/" element={<Home />} />
   
      <Route path="/restaurant/:name" element={<RestaurantPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/CreateRestaurant" element={<CreateRestaurant />} />
      <Route path="/RestaurantsPage" element={<RestaurantsPage />} />
      <Route path="/category/:categoryType" element={<RestaurantsPage />} />
      <Route path="/restaurantDetails/:id" element={<RestaurantDetails />} />

      </Routes>
      </CartProvider>

    </>
  );
}

export default App;
