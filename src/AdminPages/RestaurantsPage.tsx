import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import CreateRestaurantModal from "../components/CreateRestaurantModal";
import EditSubCategoryModal from "../components/EditSubCategoryModal";
import DeleteSubCategoryModal from "../components/DeleteSubCategoryModal";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { BASE_URL } from "../utils/apiConfig";

const BASE = BASE_URL;

export default function RestaurantsPage() {
  const { categoryType } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedCity, setSelectedCity] = useState(2);
  const [stores, setStores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState(null);
  const [selectedSubForDelete, setSelectedSubForDelete] = useState(null);
  const [newAr, setNewAr] = useState("");
  const [newFr, setNewFr] = useState("");
  const navigate = useNavigate();

  // جلب Subcategories
  useEffect(() => {
    if (!categoryType) return;

    fetch(`${BASE}/api/Subcategories/by-category-type/${categoryType}?lang=ar`)
      .then((res) => res.json())
      .then((data) => {
        setSubCategories(data || []);
        if (data && data.length > 0) {
          setSelectedSub(data[0].id);
        }
      })
      .catch(() => {
        setSubCategories([]);
      });
  }, [categoryType]);

  // جلب Stores عند تغيير Subcategory أو City
  useEffect(() => {
    if (selectedSub) {
      fetchStores(selectedSub, selectedCity);
    }
  }, [selectedSub, selectedCity]);

  const fetchStores = (subId, city = selectedCity) => {
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

  const cityMap = {
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

      // تحديث القائمة
      fetch(`${BASE}/api/Subcategories/by-category-type/${categoryType}?lang=ar`)
        .then((res) => res.json())
        .then((data) => {
          setSubCategories(data || []);
          if (data && data.length > 0) {
            setSelectedSub(data[0].id);
          }
        })
        .catch(() => setSubCategories([]));
    } else {
      alert("خطأ في البيانات");
    }
  };

  const handleEditSubCategory = (subcategory) => {
    setSelectedSubForEdit(subcategory);
    setShowEditModal(true);
  };

  const handleDeleteSubCategory = (subcategory) => {
    setSelectedSubForDelete(subcategory);
    setShowDeleteModal(true);
  };

  const handleUpdateSubCategory = (updatedSub) => {
    // تحديث القائمة بعد التعديل
    setSubCategories(prev =>
      prev.map(sub => sub.id === updatedSub.id ?
        { ...sub, name: updatedSub.nameAr, nameAr: updatedSub.nameAr, nameFr: updatedSub.nameFr } : sub
      )
    );
  };

  const handleDeleteSuccess = () => {
    // إعادة جلب القائمة بعد الحذف
    fetch(`${BASE}/api/Subcategories/by-category-type/${categoryType}?lang=ar`)
      .then((res) => res.json())
      .then((data) => {
        setSubCategories(data || []);
        if (data && data.length > 0) {
          setSelectedSub(data[0].id);
        } else {
          setSelectedSub(null);
          setStores([]);
        }
      })
      .catch(() => setSubCategories([]));
  };

  return (
    <div className="flex bg-gray-100" dir="rtl">
      <Sidebar />

      <div className="flex-1 mt-[77px]">
        <Header />

        <div className="p-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-800 text-white font-bold mr-[1120px] px-7 py-2 mb-5"
          >
            مطعم جديد
          </button>

          {/* Tabs Subcategories */}
          <div className="flex bg-white rounded shadow">
            {subCategories.map((sub) => (
              <div key={sub.id} className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedSub(sub.id);
                    fetchStores(sub.id, selectedCity);
                  }}
                  className={`px-6 py-3 border ${selectedSub === sub.id
                    ? "bg-green-800 text-white font-bold shadow"
                    : "bg-green-200 hover:bg-white text-gray-700"
                    }`}
                >
                  {sub.name}
                </button>

                {/* أزرار Edit و Delete */}
                <div className="flex">
                  <button
                    onClick={() => handleEditSubCategory(sub)}
                    className="px-1 py-1 mx-1 text-white text-sm rounded hover:border border-2"
                    title="تعديل"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-700" />

                  </button>
                  <button
                    onClick={() => handleDeleteSubCategory(sub)}
                    className="px-1 py-1 mx-1 text-white text-sm rounded hover:border border-2"
                    title="حذف"
                  >
                    <TrashIcon className="w-5 h-5 text-red-700" />

                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-white text-green-800 border rounded font-bold ml-2 hover:border-green-800"
            >
              +
            </button>
          </div>

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
                  المدينة
                  <select
                    className="ml-2 p-1 rounded text-black"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(parseInt(e.target.value))}
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
                  <td colSpan="7" className="p-4 text-center text-gray-500">
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
                          categoryType: categoryType
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
                    <td className={s.isOpen ? "text-green-700" : "text-red-700"}>
                      {s.isOpen ? "نشط" : "مغلق"}
                    </td>
                    <td>{s.addressSecondary}</td>
                    <td>{cityMap[s.addressMain] || s.addressMain}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal لإضافة Subcategory */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96 text-center">
            <h2 className="text-xl font-bold mb-4">إضافة قسم فرعي جديد</h2>
            <input
              className="border border-gray-300 p-2 mb-3 w-full bg-gray-50"
              placeholder="الاسم بالعربي"
              value={newAr}
              onChange={(e) => setNewAr(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 mb-3 w-full bg-gray-50"
              placeholder="الاسم بالفرنسية"
              value={newFr}
              onChange={(e) => setNewFr(e.target.value)}
            />
            <div className="flex mt-4">
              <button
                className="bg-green-700 text-white px-6 py-2 ml-2 rounded hover:bg-green-800"
                onClick={addSubCategory}
              >
                حفظ
              </button>
              <button
                className="bg-gray-100 border-2 border-red-700 text-red-700 px-6 py-2 rounded hover:bg-red-50"
                onClick={() => setShowAddModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لإنشاء مطعم جديد */}
      {showCreateModal && (
        <CreateRestaurantModal
          subcategoryId={selectedSub}
          subcategoryName={subCategories.find(s => s.id === selectedSub)?.name}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal لتعديل Subcategory */}
      {showEditModal && selectedSubForEdit && (
        <EditSubCategoryModal
          subcategory={selectedSubForEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubForEdit(null);
          }}
          onUpdate={handleUpdateSubCategory}
        />
      )}

      {/* Modal لحذف Subcategory */}
      {showDeleteModal && selectedSubForDelete && (
        <DeleteSubCategoryModal
          subcategory={selectedSubForDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSubForDelete(null);
          }}
          onDelete={handleDeleteSuccess}
        />
      )}
    </div>
  );
}