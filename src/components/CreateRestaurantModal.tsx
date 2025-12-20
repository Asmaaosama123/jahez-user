// components/CreateRestaurantModal.jsx
import React, { useState } from "react";

const BASE = "https://deliver-web-app2.runasp.net";

const CreateRestaurantModal = ({ subcategoryId, subcategoryName, onClose }) => {
  const initialWorkingDays = [
    { openTime: "09:00", closeTime: "17:00" }, // الأحد
    { openTime: "09:00", closeTime: "17:00" }, // الإثنين
    { openTime: "09:00", closeTime: "17:00" }, // الثلاثاء
    { openTime: "09:00", closeTime: "17:00" }, // الأربعاء
    { openTime: "09:00", closeTime: "17:00" }, // الخميس
    { openTime: "10:00", closeTime: "15:00" }, // الجمعة
    { openTime: "09:00", closeTime: "17:00" }, // السبت
  ];
  
  const [form, setForm] = useState({
    NameAr: "",
    NameFr: "",
    AddressMain: "2", // Default: أنواكشوط
    AddressSecondary: "",
    DeliveryFee: "",
    SubcategoryId: subcategoryId,
    Phone1: "",
    Phone2: "",
    CoverImage: null,
    ProfileImage: null,
    workingDays: initialWorkingDays,
  });

  const daysAr = [
    "الأحد", "الإثنين", "الثلاثاء", 
    "الأربعاء", "الخميس", "الجمعة", "السبت"
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleDayChange = (index, field, value) => {
    const newDays = [...form.workingDays];
    newDays[index] = { ...newDays[index], [field]: value };
    setForm(prev => ({ ...prev, workingDays: newDays }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    const addressText = form.AddressMain === "1" ? "أنواذيبو" : "أنواكشوط";
    
    // Add text fields
    const fields = [
      "NameAr", "NameFr", "AddressMain", "AddressSecondary",
      "DeliveryFee", "SubcategoryId", "Phone1", "Phone2"
    ];
    
    fields.forEach(field => {
      if (form[field]) data.append(field, form[field]);
    });
    
    data.append("Address", `${form.AddressSecondary}, ${addressText}`);
    
    // Add images
    if (form.CoverImage) data.append("CoverImage", form.CoverImage);
    if (form.ProfileImage) data.append("ProfileImage", form.ProfileImage);
    
    // Add working days
    const workingDaysArray = form.workingDays.map((day, index) => ({
      Day: index,
      OpenTime: day.openTime ? `${day.openTime}:00` : "",
      CloseTime: day.closeTime ? `${day.closeTime}:00` : "",
    }));
    
    data.append("WorkingDays", JSON.stringify(workingDaysArray));
    
    try {
      const res = await fetch(`${BASE}/api/Post/create-store`, {
        method: "POST",
        body: data,
      });
      
      const result = await res.json();
      alert(result.message || "تم إنشاء المطعم بنجاح");
      onClose();
    } catch (error) {
      alert("حدث خطأ في إنشاء المطعم");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          {/* <div>
            <h2 className="text-2xl font-bold text-gray-800">إضافة مطعم جديد</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">سيتم إضافة المطعم إلى:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {subcategoryName || "قسم غير محدد"}
              </span>
            </div>
          </div> */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images & Working Hours */}
            <div className="space-y-8">
              {/* Cover Image */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  صورة الغلاف
                </label>
                <label className="block relative w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors cursor-pointer overflow-hidden">
                  {form.CoverImage ? (
                    <img
                      src={URL.createObjectURL(form.CoverImage)}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>اضغط لرفع صورة الغلاف</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    name="CoverImage"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Profile Image */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  صورة البروفايل
                </label>
                <div className="flex items-center gap-6">
                  <label className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors cursor-pointer overflow-hidden">
                    {form.ProfileImage ? (
                      <img
                        src={URL.createObjectURL(form.ProfileImage)}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs">صورة البروفايل</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      name="ProfileImage"
                      onChange={handleChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  أوقات العمل
                </label>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {daysAr.map((day, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <span className="font-medium text-gray-700 w-24">{day}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={form.workingDays[index].openTime}
                          onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <span className="text-gray-400">إلى</span>
                        <input
                          type="time"
                          value={form.workingDays[index].closeTime}
                          onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Restaurant Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-l from-green-50 to-emerald-50 border-r-4 border-green-500 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">إضافة مطعم جديد</h3>
                    <p className="text-sm text-gray-600">المطعم سيضاف إلى القسم: {subcategoryName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الاسم بالعربي *</label>
                  <input
                    type="text"
                    name="NameAr"
                    value={form.NameAr}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="أدخل الاسم باللغة العربية"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الاسم بالفرنسية</label>
                  <input
                    type="text"
                    name="NameFr"
                    value={form.NameFr}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom en français"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">المدينة *</label>
                  <select
                    name="AddressMain"
                    value={form.AddressMain}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="2">أنواكشوط</option>
                    <option value="1">أنواذيبو</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">العنوان التفصيلي *</label>
                  <input
                    type="text"
                    name="AddressSecondary"
                    value={form.AddressSecondary}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="الحي، الشارع، رقم المنزل"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">رقم الهاتف 1 *</label>
                  <input
                    type="tel"
                    name="Phone1"
                    value={form.Phone1}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثال: 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">رقم الهاتف 2</label>
                  <input
                    type="tel"
                    name="Phone2"
                    value={form.Phone2}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">خصم</label>
                  <input
                    type="number"
                    name="DeliveryFee"
                    value={form.DeliveryFee}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">القسم الفرعي</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{subcategoryName}</p>
                        <p className="text-sm text-gray-500">سيتم إضافة المطعم إلى هذا القسم تلقائيًا</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        ID: {subcategoryId}
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t p-6 mt-8 flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-l from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>إنشاء المطعم</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurantModal;