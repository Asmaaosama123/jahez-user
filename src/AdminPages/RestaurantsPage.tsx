import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import CreateRestaurantModal from "../components/CreateRestaurantModal";

const BASE = "https://deliver-web-app2.runasp.net";

export default function RestaurantsPage() {
  const { categoryType } = useParams(); // CategoryType من URL
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedCity, setSelectedCity] = useState(2); // 2 = أنواكشوط, 1 = أنواذيبو
  const [stores, setStores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAr, setNewAr] = useState("");
  const [newFr, setNewFr] = useState("");
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const selectedSubObj = subCategories.find(s => s.id === selectedSub);

  
  // -------------------------------
  // 1️⃣ جلب Subcategories حسب Category
  // -------------------------------
  useEffect(() => {
    if (!categoryType) return;

    fetch(`${BASE}/api/Subcategories/by-category-type/${categoryType}?lang=ar`)
    .then((res) => res.json())
      .then((data) => {
        setSubCategories(data || []);
        if (data && data.length > 0) {
          setSelectedSub(data[0].id);
          fetchStores(data[0].id, selectedCity); // جلب المتاجر لأول Subcategory
        } else {
          setSelectedSub(null);
          setStores([]);
        }
      })
      .catch(() => {
        setSubCategories([]);
        setStores([]);
      });
  }, [categoryType, selectedCity]);

  // -------------------------------
  // 2️⃣ جلب Stores حسب Subcategory و City
  // -------------------------------
  const fetchStores = (subId, city = selectedCity) => {
    setSelectedSub(subId);

    fetch(`${BASE}/api/CustomerGet/by-city-sub/${city}/${subId}`)
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setStores(Array.isArray(data) ? data : []);
        } catch {
          setStores([]);
        }
      })
      .catch(() => setStores([]));
  };
  const cityMap: { [key: string]: string } = {
    "Nouakchott": "أنواكشوط",
    "Nouadhibou": "أنواذيبو",
  };

  const addSubCategory = async () => {
    const form = new FormData();
    form.append("NameAr", newAr);
    form.append("NameFr", newFr);
    form.append("CategoryType", categoryType.toString());

    const res = await fetch(`${BASE}/api/Post/subcategory`, {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      alert("تمت الإضافة بنجاح");
      setShowAddModal(false);
      setNewAr("");
      setNewFr("");

      // تحديث Subcategories بعد الإضافة
      fetch(`${BASE}/api/Subcategories/by-category-type/${categoryType}`)
        .then((res) => res.json())
        .then((data) => setSubCategories(data))
        .catch(() => setSubCategories([]));
    } else {
      alert("خطأ في البيانات");
    }
  };

  return (
    <div className="flex bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 mt-[77px]">
        <Header />

        <div className="p-6">
         
{/* <button
  onClick={() =>
    navigate(`/CreateRestaurant`, {
      state: { subcategoryId: selectedSub }   // ⬅️ إرسال الـ Subcategory
    })
  }
  className="bg-green-800 text-white font-bold mr-[1120px] px-7 py-2 mb-5"
>
  مطعم جديد
</button> */}
<button
  onClick={() => setShowCreateModal(true)}
  
  className="bg-green-800 text-white font-bold mr-[1120px] px-7 py-2 mb-5"
>

  مطعم جديد
</button>
{/* <div className="absolute top-full left-0 mb-2 hidden group-hover:block bg-black text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
    سيتم إضافة المنتج إلى قسم: {sub.name}
  </div> */}



          {/* Tabs Subcategories */}
          <div className="flex bg-white rounded shadow">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => fetchStores(sub.id, selectedCity)}
                className={`px-8 py-2 border ${
                  selectedSub === sub.id
                    ? "bg-green-800 text-white font-bold shadow"
                    : "bg-green-200 hover:bg-white text-gray-700"
                }`}
              >
                {sub.name}
              </button>
            ))}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-2 bg-white text-green-800 border rounded font-bold ml-2 hover: border-green-800"
            >
              +
            </button>
          
          </div>
         
          {/* جدول المتاجر */}
         {/* جدول المتاجر */}
<table className="w-full bg-white shadow rounded">
  <thead className="bg-black text-white text-sm">
    <tr>
      <th className="p-3">بروفايل</th>
      <th className="p-3">الاسم</th>
     
      <th className="p-3">الهاتف 1</th>
      <th className="p-3">الهاتف 2</th>
      <th className="p-3">الحالة</th>
      <th className="p-3">العنوان</th>
      <th className="p-3">
        
        <select
          className="ml-2 p-1 rounded text-black"
          value={selectedCity}
          onChange={(e) => {
            const cityValue = parseInt(e.target.value);
            setSelectedCity(cityValue);
            if (selectedSub) {
              fetchStores(selectedSub, cityValue);
            }
          }}
        >
          <option value={2}>أنواكشوط</option>
          <option value={1}>أنواذيبو</option>
        </select>
      </th>
    </tr>
  </thead>
  <tbody>
    {stores.length === 0 ? (
      <tr>
        <td colSpan="8" className="p-4 text-center text-gray-500">
          لا توجد بيانات
        </td>
      </tr>
    ) : (
      stores.map((s) => (
<tr
  key={s.id}
  className="text-center border-b cursor-pointer hover:bg-gray-100"
  onClick={() =>
    navigate(`/admin/restaurantDetails/${s.id}`, {
      state: {
        restaurant: s,
        categoryType: categoryType // ⬅️ هنا نبعت الـ Category
      }
    })
  }
>

          <td className="p-3">
            <img
              src={s.profileImageUrl}
              alt={s.nameAr}
              className="w-12 h-12 rounded object-cover mx-auto"
            />
          </td>
          <td>{s.nameAr}</td>
          <td>{s.phone1}</td>
          <td>{s.phone2}</td>
          <td className="text-green-700">{s.isOpen ? "نشط" : "مغلق"}</td>
          <td>{s.addressSecondary}</td>
          <td>{cityMap[s.addressMain] || s.addressMain}</td>
        </tr>
      ))
    )}
  </tbody>
</table>

        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow w-96 text-center">
              <input
                className="border-black p-2 mb-3 w-full bg-gray-200"
                placeholder="الاسم بالعربي"
                value={newAr}
                onChange={(e) => setNewAr(e.target.value)}
              />
              <input
                className="border-black p-2 mb-3 w-full bg-gray-200"
                placeholder="الاسم بالفرنسية"
                value={newFr}
                onChange={(e) => setNewFr(e.target.value)}
              />
              <div className="flex mt-4">
                <button
                  className="bg-green-700 text-white px-12 py-1 ml-2"
                  onClick={addSubCategory}
                >
                  حفظ
                </button>
                <button
                  className="bg-gray-100 border-2 border-red-700 text-red-700 px-12 py-1"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showCreateModal && (
  <CreateRestaurantModal
    subcategoryId={selectedSub}
    subcategoryName={selectedSubObj?.name}
    onClose={() => setShowCreateModal(false)}
  />
)}

    </div>
  );
}
