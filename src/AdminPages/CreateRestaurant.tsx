import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function CreateRestaurant({ subcategoryId, isModal = false }) {
  const [form, setForm] = useState({
    NameAr: "",
    NameFr: "",
    AddressMain: "",
    AddressSecondary: "",
    DeliveryFee: "",
    SubcategoryId: subcategoryId || "",
    Phone1: "",
    Phone2: "",
    CoverImage: null,
    ProfileImage: null,
    workingDays: Array.from({ length: 7 }, () => ({ openTime: "", closeTime: "" })),
  });

  useEffect(() => {
    if (subcategoryId) {
      setForm((prev) => ({ ...prev, SubcategoryId: subcategoryId }));
    }
  }, [subcategoryId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleWorkingDayChange = (index, field, value) => {
    const days = [...form.workingDays];
    days[index] = { ...days[index], [field]: value };
    setForm((prev) => ({ ...prev, workingDays: days }));
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
      const res = await fetch(
        "https://deliver-web-app2.runasp.net/api/Post/create-store",
        { method: "POST", body: data }
      );
      const result = await res.json();
      alert(result.message || "تم إنشاء المطعم بنجاح");
    } catch {
      alert("حدث خطأ");
    }
  };

  return (
    <div className={`bg-gray-50 ${isModal ? "" : "min-h-screen"}`} dir="rtl">
      {!isModal && <Sidebar />}

      <div className="flex-1">
        {!isModal && <Header />}

        <div className="mt-[75px] flex gap-6 p-5">
          {/* العمود الأول */}
          <div className="flex flex-col w-full">
            {/* الغلاف */}
            <div className="flex flex-col w-[850px] mr-5">
              <label className="relative w-full h-64 bg-gray-200 rounded-lg cursor-pointer">
                {form.CoverImage ? (
                  <img
                    src={URL.createObjectURL(form.CoverImage)}
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
                  className="absolute inset-0 opacity-0"
                />
              </label>

              {/* البروفايل */}
              <div className="relative w-24 h-24 -mt-12 ml-6">
                <label className="absolute w-24 h-24 rounded-full bg-gray-200 cursor-pointer">
                  {form.ProfileImage ? (
                    <img
                      src={URL.createObjectURL(form.ProfileImage)}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-xs">
                      صورة البروفايل
                    </div>
                  )}
                  <input
                    type="file"
                    name="ProfileImage"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0"
                  />
                </label>
              </div>
            </div>

            {/* أيام العمل */}
            <div className="border rounded-lg p-4 mt-4 w-[850px]">
              <h2 className="font-bold mb-2">أيام العمل</h2>
              {["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"].map((day, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                  <span>{day}</span>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={form.workingDays[i].openTime}
                      onChange={(e) => handleWorkingDayChange(i, "openTime", e.target.value)}
                      className="border p-2"
                    />
                    <input
                      type="time"
                      value={form.workingDays[i].closeTime}
                      onChange={(e) => handleWorkingDayChange(i, "closeTime", e.target.value)}
                      className="border p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* العمود الثاني */}
          <div className="p-5 mt-5 shadow border w-[350px]">
            <h1 className="text-xl mb-2">الحساب</h1>

            <select
              name="AddressMain"
              onChange={handleChange}
              className="border p-1 w-full mb-2"
            >
              <option value="">اختر المدينة</option>
              <option value="1">أنواذيبو</option>
              <option value="2">أنواكشوط</option>
            </select>

            <input name="AddressSecondary" onChange={handleChange} placeholder="العنوان" className="input" />
            <input name="Phone1" onChange={handleChange} placeholder="هاتف 1" className="input" />
            <input name="Phone2" onChange={handleChange} placeholder="هاتف 2" className="input" />
            <input name="NameAr" onChange={handleChange} placeholder="الاسم بالعربي" className="input" />
            <input name="NameFr" onChange={handleChange} placeholder="الاسم بالفرنسي" className="input" />
            <input name="DeliveryFee" onChange={handleChange} placeholder="سعر التوصيل" className="input" />

            <div className="bg-gray-200 p-2 text-sm mb-2">
              القسم الفرعي تم اختياره تلقائيًا
            </div>

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              إنشاء المتجر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
