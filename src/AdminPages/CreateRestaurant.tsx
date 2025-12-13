import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function CreateRestaurant() {
  const [form, setForm] = useState({
    NameAr: "",
    NameFr: "",
    AddressMain: "",
    AddressSecondary: "",
    DeliveryFee: "",
    SubcategoryId: "",
    Phone1: "",
    Phone2: "",
    CoverImage: null,
    ProfileImage: null,
    workingDays: Array.from({ length: 7 }, () => ({ openTime: "", closeTime: "" })), // كل يوم object مستقل
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleWorkingDayChange = (index, field, value) => {
    const newDays = [...form.workingDays];
    newDays[index] = { ...newDays[index], [field]: value }; // نسخة جديدة لكل يوم
    setForm((prev) => ({ ...prev, workingDays: newDays }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    const addressText = form.AddressMain === "1" ? "أنواذيبو" : "أنواكشوط";
    data.append("NameAr", form.NameAr);
    data.append("NameFr", form.NameFr);
    data.append("AddressMain", form.AddressMain);
    data.append("AddressSecondary", form.AddressSecondary);
    data.append("Address", `${form.AddressSecondary}, ${addressText}`);
    data.append("DeliveryFee", form.DeliveryFee);
    data.append("SubcategoryId", form.SubcategoryId);
    data.append("Phone1", form.Phone1);
    data.append("Phone2", form.Phone2);
    if (form.CoverImage) data.append("CoverImage", form.CoverImage);
    if (form.ProfileImage) data.append("ProfileImage", form.ProfileImage);

    const workingDaysArray = form.workingDays.map((d, i) => ({
      Day: i,
      OpenTime: d.openTime ? d.openTime + ":00" : "",
      CloseTime: d.closeTime ? d.closeTime + ":00" : "",
    }));
    data.append("WorkingDays", JSON.stringify(workingDaysArray));

    try {
      const res = await fetch("http://deliver-web-app2.runasp.net/api/Post/create-store", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      alert(result.message || "تم الإنشاء بنجاح");
    } catch (err) {
      console.error("خطأ:", err);
      alert("حدث خطأ في إنشاء المتجر");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen" dir="rtl">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <div className="mt-[75px] flex gap-6 p-5">
          {/* العمود الأول */}
          <div className="flex flex-col w-full">
            {/* الغلاف + الصورة الشخصية */}
            <div className="flex flex-col w-[850px] mr-5">
              {/* Cover Image */}
              <label className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
                {form.CoverImage ? (
                  <img
                    src={URL.createObjectURL(form.CoverImage)}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    اختر صورة الغلاف
                  </div>
                )}
                <input
                  type="file"
                  name="CoverImage"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>

              {/* Profile Image */}
              <div className="relative w-24 h-24 -mt-12 ml-6">
                <label className="absolute w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-gray-200">
                  {form.ProfileImage ? (
                    <img
                      src={URL.createObjectURL(form.ProfileImage)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                      اختر صورة البروفايل
                    </div>
                  )}
                  <input
                    type="file"
                    name="ProfileImage"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* أيام العمل */}
            <div className="border rounded-lg p-4 mt-4 w-[850px]">
  <h2 className="font-bold mb-2">أيام العمل</h2>
  {["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"].map((day, i) => (
    <div key={i} className="grid grid-cols-2 gap-2 mb-2 items-center">
      <span className="font-semibold">{day}</span>
      <div className="flex gap-2">
        {/* وقت الفتح */}
        <input
          type="time"
          value={form.workingDays[i].openTime}
          onChange={(e) => handleWorkingDayChange(i, "openTime", e.target.value)}
          className="border rounded p-2"
          step="60" // خطوة كل ساعة
        />
        {/* وقت الإغلاق */}
        <input
          type="time"
          value={form.workingDays[i].closeTime}
          onChange={(e) => handleWorkingDayChange(i, "closeTime", e.target.value)}
          className="border rounded p-2"
          step="60"
        />
      </div>
    </div>
  ))}
</div>

          </div>

          {/* العمود الثاني: معلومات المتجر */}
          <div className="p-5 mt-5 shadow border border-black w-[350px]">
            <h1 className="text-2xl font-sans mb-2">الحساب</h1>
            <select
              name="AddressMain"
              value={form.AddressMain}
              onChange={handleChange}
              className="border rounded p-1 mt-1 w-full"
            >
              <option value="">اختر المدينة</option>
              <option value="1">أنواذيبو</option>
              <option value="2">أنواكشوط</option>
            </select>
            <input
              value={form.AddressSecondary}
              placeholder="العنوان الثانوي"
              onChange={handleChange}
              name="AddressSecondary"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.Phone1}
              placeholder="رقم الهاتف 1"
              onChange={handleChange}
              name="Phone1"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.Phone2}
              placeholder="رقم الهاتف 2"
              onChange={handleChange}
              name="Phone2"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.NameAr}
              placeholder="اسم المتجر بالعربي"
              onChange={handleChange}
              name="NameAr"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.NameFr}
              placeholder="اسم المتجر بالفرنسي"
              onChange={handleChange}
              name="NameFr"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.DeliveryFee}
              placeholder="سعر التوصيل"
              onChange={handleChange}
              name="DeliveryFee"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <input
              value={form.SubcategoryId}
              placeholder="رقم القسم الفرعي"
              onChange={handleChange}
              name="SubcategoryId"
              className="text-xl bg-gray-100 pl-4 py-1 mb-2 w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white mt-2 py-2 w-full rounded-lg hover:bg-blue-700"
            >
              إنشاء المتجر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
