import React, { useState } from "react";
import { BASE_URL } from "../utils/apiConfig";

const BASE = BASE_URL;

interface AddVehicleTypeModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddVehicleTypeModal: React.FC<AddVehicleTypeModalProps> = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    Name: "",
    Icon: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, Icon: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Name || !form.Icon) {
      alert("يرجى إدخال الاسم واختيار أيقونة");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("Name", form.Name);
    data.append("Icon", form.Icon);

    try {
      const res = await fetch(`${BASE}/api/VehicleTypes`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        onAdded();
        onClose();
      } else {
        alert("حدث خطأ في الإضافة");
      }
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">إضافة نوع مركبة جديد</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المركبة *</label>
            <input
              type="text"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="مثال: شاحنة، دراجة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة (صورة) *</label>
            <div className="flex flex-col items-center gap-3">
              <label className="relative w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center text-gray-400">
                {imagePreview ? (
                  <img src={imagePreview} alt="Icon Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">اختر صورة</span>
                  </>
                )}
                <input type="file" accept="image/*" name="Icon" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
              </label>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleTypeModal;
