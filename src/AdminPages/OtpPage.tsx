// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function OtpPage() {
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email;

//   if (!email) {
//     // لو وصل للصفحة من غير email → ارجع Login
//     navigate("/admin/login");
//   }

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const res = await fetch(
//         `https://jahezdelivery.com/api/admin/verify-2fa?email=${email}&code=${code}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json"
//           }
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || "الكود خاطئ");
//         return;
//       }

//       // لو الكود صح → خزّن JWT وادخل Dashboard
//       localStorage.setItem("adminToken", data.token);
//       navigate("/admin/orders");
//     } catch (err) {
//       setError("حدث خطأ في الخادم. حاول مرة أخرى.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-100">
//       <form
//         onSubmit={handleVerify}
//         className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
//       >
//         <h1 className="text-2xl font-bold mb-6 text-center">التحقق بخطوتين (2FA)</h1>

//         <label className="block mb-2">أدخل الكود من Google Authenticator</label>
//         <input
//           type="text"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
//         >
//           {isLoading ? "جار التحقق..." : "تحقق"}
//         </button>
//       </form>
//     </div>
//   );
// }
