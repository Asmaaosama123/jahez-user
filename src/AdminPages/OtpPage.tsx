import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/apiConfig";

export default function OtpPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    // لو وصل للصفحة من غير email → ارجع Login
    navigate("/admin/login");
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/verify-2fa?email=${email}&code=${code}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "الكود خاطئ");
        return;
      }

      // لو الكود صح → خزّن JWT وادخل Dashboard
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/orders");
    } catch (err) {
      setError("حدث خطأ في الخادم. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 via-white to-emerald-100 p-4">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-emerald-50 transition-all duration-300 hover:shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 text-center">تأكيد الهوية</h1>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
            تم إرسال كود تحقق مكون من 6 أرقام إلى بريدك الإلكتروني: <br />
            <strong className="text-emerald-600 font-semibold">{email}</strong>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2 text-right">
            أدخل كود التحقق
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="0 0 0 0 0 0"
            className="w-full p-3 border-2 border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.75em] placeholder-slate-300 focus:border-emerald-500 focus:outline-none transition duration-200 text-slate-800"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري التحقق...</span>
            </>
          ) : (
            <span>تحقق ودخول</span>
          )}
        </button>
      </form>
    </div>
  );
}
