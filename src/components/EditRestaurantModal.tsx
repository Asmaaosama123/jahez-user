import React, { useState, useEffect } from "react";

const BASE = "https://jahezdelivery.com";

interface EditRestaurantModalProps {
  restaurantId: number;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  currentCover?: string;
  currentProfile?: string;
}

interface WorkingDay {
  Day: number;
  OpenTime: string;
  CloseTime: string;
}

interface FormData {
  Id: number;
  NameAr: string;
  NameFr: string;
  AddressMain: string;
  AddressSecondary: string;
  DeliveryFee: string;
  Phone1: string;
  Phone2: string;
  CoverImage: File | null;
  ProfileImage: File | null;
  workingDays: Array<{ openTime: string; closeTime: string }>;
}

const EditRestaurantModal: React.FC<EditRestaurantModalProps> = ({ 
  restaurantId, 
  onClose, 
  onUpdated,
  currentCover,
  currentProfile
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<FormData>({
    Id: restaurantId,
    NameAr: "",
    NameFr: "",
    AddressMain: "2",
    AddressSecondary: "",
    DeliveryFee: "0",
    Phone1: "",
    Phone2: "",
    CoverImage: null as File | null,
    ProfileImage: null as File | null,
    workingDays: Array(7).fill({ openTime: "", closeTime: "" }),
  });

  const [currentImages, setCurrentImages] = useState({
    coverImageUrl: currentCover || "",
    profileImageUrl: currentProfile || ""
  });
  
  

  const daysAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${BASE}/${url.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);
      try {
        const storeRes = await fetch(`${BASE}/api/CustomerGet/store/${restaurantId}`);
        if (!storeRes.ok) throw new Error(`Failed to fetch store: ${storeRes.status}`);
        const storeData = await storeRes.json();

        const daysRes = await fetch(`${BASE}/api/CustomerGet/store-working-days/${restaurantId}`);
        const daysData = daysRes.ok ? await daysRes.json() : [];

        setCurrentImages({
          coverImageUrl: getFullImageUrl(storeData.coverImageUrl),
          profileImageUrl: getFullImageUrl(storeData.profileImageUrl)
        });

        const addressMainValue = storeData.addressMain === "Nouakchott" ? "2" : 
                                storeData.addressMain === "Nouadhibou" ? "1" : "2";

        const preparedWorkingDays = Array(7).fill({ openTime: "", closeTime: "" });
        if (Array.isArray(daysData)) {
          daysData.forEach((dayItem: any) => {
            const dayIndex = daysEn.findIndex(day => day === dayItem.day);
            if (dayIndex !== -1) {
              const openTime = dayItem.openTime ? dayItem.openTime.split(':').slice(0,2).join(':') : "";
              const closeTime = dayItem.closeTime ? dayItem.closeTime.split(':').slice(0,2).join(':') : "";
              preparedWorkingDays[dayIndex] = { openTime, closeTime };
            }
          });
        }

        setForm(prev => ({
          ...prev,
          NameAr: storeData.nameAr || "",
          NameFr: storeData.nameFr || "",
          AddressMain: addressMainValue,
          AddressSecondary: storeData.addressSecondary || "",
          DeliveryFee: storeData.deliveryFee?.toString() || "0",
          Phone1: storeData.phone1 || "",
          Phone2: storeData.phone2 || "",
          workingDays: preparedWorkingDays,
        }));
        
      } catch (error: any) {
        console.error("Error fetching restaurant data:", error);
        alert("حدث خطأ في تحميل بيانات المطعم: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchRestaurantData();
  }, [restaurantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (files && files[0]) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const newDays = [...form.workingDays];
    newDays[index] = { ...newDays[index], [field]: value };
    setForm(prev => ({ ...prev, workingDays: newDays }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("Id", restaurantId.toString());
      data.append("NameAr", form.NameAr);
      data.append("NameFr", form.NameFr || "");
      data.append("AddressMain", form.AddressMain);
      data.append("AddressSecondary", form.AddressSecondary || "");
      data.append("DeliveryFee", form.DeliveryFee || "0");
      data.append("Phone1", form.Phone1);
      data.append("Phone2", form.Phone2 || "");
     
     
      if (form.CoverImage instanceof File) data.append("CoverImage", form.CoverImage);
      if (form.ProfileImage instanceof File) data.append("ProfileImage", form.ProfileImage);

      const workingDaysArray: WorkingDay[] = form.workingDays.map((day, index) => ({
        Day: index,
        OpenTime: day.openTime ? (day.openTime.includes(':') ? `${day.openTime}:00` : `${day.openTime}:00:00`) : "",
        CloseTime: day.closeTime ? (day.closeTime.includes(':') ? `${day.closeTime}:00` : `${day.closeTime}:00:00`) : ""
      }));
      data.append("WorkingDays", JSON.stringify(workingDaysArray));

      const res = await fetch(`${BASE}/api/CustomerGet/update-store`, { method: "PUT", body: data });
      if (res.ok) {
        await onUpdated();
        onClose();
      } else {
        const errorText = await res.text();
        alert(`حدث خطأ أثناء التحديث: ${errorText || 'يرجى المحاولة مرة أخرى'}`);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      alert("تعذر الاتصال بالخادم: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getCoverImageSrc = () =>
  form.CoverImage ? URL.createObjectURL(form.CoverImage) : currentCover || "https://via.placeholder.com/400x150?text=صورة+الغلاف";

const getProfileImageSrc = () =>
  form.ProfileImage ? URL.createObjectURL(form.ProfileImage) : currentProfile || "https://via.placeholder.com/100x100?text=البروفايل";

  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-800">تعديل بيانات المطعم</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Images Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الغلاف
                </label>
                <div className="relative">
                <img
  src={getCoverImageSrc()}
  alt="Cover"
  className="w-full h-40 object-cover rounded-lg border border-gray-300"
/>
                  <div className="absolute bottom-2 left-2">
                    <label className="cursor-pointer bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70">
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        name="CoverImage"
                        onChange={e => setForm({...form, CoverImage: e.target.files?.[0] || null })}                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة البروفايل
                </label>
                <div className="relative">
                <img
  src={getProfileImageSrc()}
  alt="Profile"
  className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg mx-auto"
/>
                  <div className="text-center mt-2">
                    <label className="cursor-pointer bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70">
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        name="ProfileImage"
                        onChange={e => setForm({...form, ProfileImage: e.target.files?.[0] || null })}                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> الاسم بالعربي
              </label>
              <input
                type="text"
                name="NameAr"
                value={form.NameAr}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالفرنسية</label>
              <input
                type="text"
                name="NameFr"
                value={form.NameFr}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> المدينة
              </label>
              <select
                name="AddressMain"
                value={form.AddressMain}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="2">أنواكشوط</option>
                <option value="1">أنواذيبو</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان التفصيلي</label>
              <input
                type="text"
                name="AddressSecondary"
                value={form.AddressSecondary}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> الهاتف 1
              </label>
              <input
                type="tel"
                name="Phone1"
                value={form.Phone1}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف 2</label>
              <input
                type="tel"
                name="Phone2"
                value={form.Phone2}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الخصم</label>
              <input
                type="number"
                name="DeliveryFee"
                value={form.DeliveryFee}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          {/* Working Days */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أوقات العمل (نظام 24 ساعة)
            </label>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {daysAr.map((day, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="font-medium text-gray-700 w-24">{day}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={form.workingDays[index].openTime}
                      onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent w-28"
                    />
                    <span className="text-gray-400">إلى</span>
                    <input
                      type="time"
                      value={form.workingDays[index].closeTime}
                      onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent w-28"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRestaurantModal;