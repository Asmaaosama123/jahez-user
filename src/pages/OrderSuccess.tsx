import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { language } = useLang();

//   useEffect(() => {
//     setTimeout(() => {
//       navigate("/");
//     }, 5000);
//   }, []);



  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">

      <div className="w-32 h-32 rounded-full border-4 border-green-700 flex items-center justify-center animate-pop">
      <svg
  className="w-32 h-32"
  viewBox="0 0 120 120"
>
  {/* الدائرة */}
  <circle
    cx="60"
    cy="60"
    r="54"
    fill="none"
    stroke="#15803d"
    strokeWidth="6"
    className="circle-draw"
  />

  {/* الصح */}
  <path
    d="M35 62 L55 80 L85 45"
    fill="none"
    stroke="#15803d"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="check-draw"
  />
</svg>

      </div>

      <h2 className="text-xl font-bold mt-6">
        {language === "ar"
          ? "تم إرسال الطلب بنجاح"
          : "Commande envoyée avec succès"}
      </h2>

      <p className="text-gray-500 mt-2 text-center px-6">
        {language === "ar"
          ? "سيتم الاتصال بك قريبًا من طرف أحد مندوبي التوصيل"
          : "Vous serez contacté prochainement par l’un de nos agents"}
      </p>
      <button
  onClick={() => navigate("/")}
  className="mt-8 px-6 py-3 bg-green-700 text-white rounded-lg shadow-lg"
>
  {language === "ar" ? "الصفحة الرئيسية" : "Page d’accueil"}
</button>

    </div>
  );
}
