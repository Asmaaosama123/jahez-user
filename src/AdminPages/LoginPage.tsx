import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("https://jahezdelivery.com/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "حدث خطأ أثناء تسجيل الدخول");
        return;
      }

     // ✅ التحقق من 2FA
if (data.requires2FA) {
  localStorage.setItem("tempAdminEmail", email); // تخزين email مؤقت
  navigate("/admin/otp"); // توجيه OTP
} else {
  localStorage.setItem("adminToken", data.token); // JWT النهائي
  navigate("/admin/orders");
}
      
    } catch (err) {
      setError("حدث خطأ في الخادم. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول الأدمن</h1>

        <label className="block mb-2">البريد الإلكتروني</label>
        <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full p-2 mb-4 border rounded"
  required
  disabled={isLoading}
/>

        <label className="block mb-2">كلمة المرور</label>
        <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full p-2 mb-4 border rounded"
  required
  disabled={isLoading}
/>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {isLoading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
