import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserApp from "./pages/UserApp";
import AdminApp from "./AdminPages/AdminApp";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* كل روابط اليوزر */}
        <Route path="/*" element={<UserApp />} />

        {/* كل روابط الإدارة */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </>
  );
}

export default App;
