import { Routes, Route } from "react-router-dom";
import UserApp from "./pages/UserApp";
import AdminApp from "./AdminPages/AdminApp";

function App() {
  return (
    <Routes>
      {/* كل روابط اليوزر */}
      <Route path="/*" element={<UserApp />} />

      {/* كل روابط الإدارة */}
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;
