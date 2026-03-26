import React, { useState } from "react";
import { BASE_URL } from "../utils/apiConfig";

const BASE = BASE_URL;

interface EditUserModalProps {
  onClose: () => void;
  onAdded: () => void;
  user: any;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ onClose, onAdded, user }) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    Balance: user?.balance || user?.Balance || 0,
    Status: user?.status || user?.Status || "مفعل",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${BASE}/api/Users/${user.id || user.Id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatusMsg({ type: "success", text: "تم التعديل بنجاح" });
        setTimeout(() => {
          onAdded();
          onClose();
        }, 1200);
      } else {
        setStatusMsg({ type: "error", text: "حدث خطأ أثناء الحفظ." });
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: "error", text: "تعذر الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div className="flex flex-col items-center mb-2">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3 text-gray-400 overflow-hidden">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-700 tracking-wider">
              {user.phoneNumber || user.PhoneNumber}
            </h2>
          </div>

          <div className="space-y-4">
            {statusMsg && (
              <div className={`p-3 rounded-lg text-center text-sm font-bold animate-in fade-in slide-in-from-top-2 ${statusMsg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {statusMsg.text}
              </div>
            )}

            <div className="space-y-1">
              <input 
                type="text" 
                value={user.name || user.Name || ""} 
                readOnly
                placeholder="الاسم الكامل"
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-right text-gray-500 cursor-not-allowed outline-none font-bold" 
              />
            </div>

            <div className="space-y-1">
              <input 
                type="number" 
                name="Balance" 
                value={form.Balance} 
                onChange={handleChange} 
                placeholder="الرصيد"
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-right focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none font-bold" 
              />
            </div>

            <div className="space-y-1">
              <select 
                name="Status" 
                value={form.Status} 
                onChange={handleChange} 
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-right cursor-pointer focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none font-bold appearance-none"
              >
                <option value="مفعل" className="text-green-600">مفعل</option>
                <option value="متوقف" className="text-orange-500">متوقف</option>
                <option value="محظور" className="text-red-600">محظور</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" disabled={loading} 
              className="flex-1 py-3 bg-[#1e5a32] text-white rounded-md font-bold hover:bg-green-900 transition-all disabled:opacity-50 shadow-sm active:scale-95"
            >
              {loading ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button 
              type="button" onClick={onClose} 
              className="flex-1 py-3 border-2 border-red-600 text-red-600 bg-white rounded-md font-bold hover:bg-red-50 transition-colors shadow-sm active:scale-95"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
