// pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // بيانات الاعتماد الثابتة (يمكنك تغييرها لاحقاً)
  const VALID_CREDENTIALS = {
    username: "admin123",
    password: "12345678"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // محاكاة تأخير للشبكة (حقيقية)
      await new Promise(resolve => setTimeout(resolve, 500));

      // التحقق من بيانات الاعتماد
      if (username === VALID_CREDENTIALS.username && 
          password === VALID_CREDENTIALS.password) {
        
        // حفظ حالة تسجيل الدخول في localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);
        
        // توجيه المستخدم إلى الصفحة المطلوبة أو الرئيسية
        const from = location.state?.from?.pathname || "/admin/orders";
        navigate(from, { replace: true });
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600">أدخل بيانات الاعتماد للوصول إلى لوحة التحكم</p>
        </div>

        {/* بطاقة النموذج */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقل اسم المستخدم */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="أدخل اسم المستخدم"
                dir="ltr"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="أدخل كلمة المرور"
                dir="ltr"
              />
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-l from-green-600 to-emerald-600 text-white font-medium py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>

            {/* تلميحات للبيانات الافتراضية */}
            {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-1">بيانات الاعتماد الافتراضية:</p>
                <div className="space-y-1 text-xs">
                  <p>اسم المستخدم: <code className="bg-gray-200 px-2 py-1 rounded">admin123</code></p>
                  <p>كلمة المرور: <code className="bg-gray-200 px-2 py-1 rounded">12345678</code></p>
                </div>
              </div>
            </div> */}
          </form>
        </div>

  
      </div>
    </div>
  );
}