import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const BASE = "https://deliver-web-app2.runasp.net";

interface Restaurant {
  id: number;
  nameAr: string;
  nameFr?: string;
  coverImageUrl: string;
  profileImageUrl: string;
  isOpen: boolean;
  addressMain: string;
  addressSecondary: string;
}

interface Section {
  id: number;
  nameAr: string;
  nameFr?: string;
}

interface Product {
  id: number;
  storeSectionId: number;
  nameAr: string;
  nameFr?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
}

interface WorkingDay {
  day: string;
  openTime: string;
  closeTime: string;
}

export default function RestaurantDetailsPage() {
  const location = useLocation();
  const restaurant = location.state?.restaurant as Restaurant;
  const categoryType = location.state?.categoryType; 
  const [categoryType1, setCategoryType] = useState<number | null>(null);
  const [showDeleteStoreConfirm, setShowDeleteStoreConfirm] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, productId: null as number | null });
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionAr, setNewSectionAr] = useState('');
  const [newSectionFr, setNewSectionFr] = useState('');

  const cityMap: { [key: string]: string } = {
    "Nouakchott": "أنواكشوط",
    "Nouadhibou": "أنواذيبو",
  };
  useEffect(() => {
    const fetchCategoryType = async () => {
      try {
        const res = await fetch(`${BASE}/api/Subcategories/GetStoreCategory/${restaurant.id}`);
        const data = await res.json();
        setCategoryType(data.category);  // <-- نخزن الرقم
      } catch (err) {
        console.error(err);
        setCategoryType(1); // default
      }
    };
    if (restaurant?.id) fetchCategoryType();
  }, [restaurant]);
  // ---------- FETCH DATA ----------
  const fetchSections = async () => {
    try {
      const res = await fetch(`${BASE}/api/Subcategories/${restaurant.id}/sections?lang=ar`);
      const data = await res.json();
      setSections(data);
      if (data.length > 0) setSelectedSection(data[0]);
    } catch {
      setSections([]);
    }
  };

  useEffect(() => {
    const fetchCategoryType = async () => {
      try {
        const res = await fetch(`${BASE}/api/Subcategories/GetStoreCategory/${restaurant.id}`);
        const data = await res.json();
        setCategoryType(data.category.toString());
      } catch (err) {
        console.error(err);
        setCategoryType("1");
      }
    };
    if (restaurant?.id) fetchCategoryType();
  }, [restaurant]);
  
  const fetchProducts = async () => {
    if (!selectedSection) return;
    try {
      const res = await fetch(`${BASE}/api/Subcategories/section/${selectedSection.id}/products?lang=ar`);
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts([]);
    }
  };

  const fetchWorkingDays = async () => {
    try {
      const res = await fetch(`${BASE}/api/CustomerGet/store-working-days/${restaurant.id}`);
      const data = await res.json();
      setWorkingDays(data);
    } catch {
      setWorkingDays([]);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchSections();
      fetchWorkingDays();
    }
  }, [restaurant]);

  useEffect(() => {
    fetchProducts();
  }, [selectedSection]);

  const translateDay = (day: string) => {
    const days: any = {
      Sunday: "الأحد",
      Monday: "الإثنين",
      Tuesday: "الثلاثاء",
      Wednesday: "الأربعاء",
      Thursday: "الخميس",
      Friday: "الجمعة",
      Saturday: "السبت",
    };
    return days[day] || day;
  };

  // ---------- PRODUCT ACTIONS ----------
  const requestDeleteProduct = (id: number) => setConfirmDelete({ show: true, productId: id });
  const confirmDeleteProduct = async () => {
    if (!confirmDelete.productId) return;
    try {
      const res = await fetch(`${BASE}/api/CustomerGet/product/${confirmDelete.productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== confirmDelete.productId));
        setConfirmDelete({ show: false, productId: null });
      }
    } catch {}
  };
  const editProduct = (p: Product) => setEditingProduct(p);
  const deleteStore = async () => {
    try {
      const res = await fetch(
        `${BASE}/api/CustomerGet/store/${restaurant.id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );
  
      if (res.ok) {
        alert("تم حذف الحساب بنجاح");
        // رجوع لصفحة المطاعم أو الرئيسية
        window.location.href = "/restaurants";
      } else {
        alert("حدث خطأ أثناء حذف الحساب");
      }
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بالسيرفر");
    }
  };
  
  return (
    <div className="flex bg-gray-50 min-h-screen" dir="rtl">
      <Sidebar />
      <div className="flex-1">
        <Header />

        {/* ************** COVER + PROFILE + ACCOUNT ************** */}
        <div className="mt-[75px] flex gap-6"> {/* 75px = ارتفاع الهيدر */}

          {/* العمود الأول: الغلاف + الصورة الشخصية + الأقسام + جدول المنتجات */}
          <div className="flex flex-col">
            {/* الغلاف + الصورة الشخصية */}
           <div className="flex flex-col w-[850px] mr-5">
  <img src={restaurant.coverImageUrl} className="w-full h-64 object-cover shadow-lg" />
  <div className="flex items-end gap-2 -mt-12 mr-8">
    <img src={restaurant.profileImageUrl} className="w-24 h-24 rounded shadow-lg" />
    <div>
      <h1 className="text-2xl font-bold">{restaurant.nameAr}</h1>
      <p className={`font-bold ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
        {restaurant.isOpen ? 'مفتوح' : 'مغلق'}
      </p>
    </div>
    {/* <button className="bg-green-700 text-white px-10 py-2 shadow mr-[500px]"
                    onClick={() => setShowAddProductModal(true)}> إضافة منتج</button> */}
                                {categoryType1 !== "2" &&(
<>
                    <div className="relative group">
  <button
    className="bg-green-700 text-white px-10 py-2 shadow mr-[500px]"
    onClick={() => setShowAddProductModal(true)}
  >
    إضافة منتج
  </button>

  {/* Tooltip */}
  <div className="absolute top-full left-0 mb-2 hidden group-hover:block bg-black text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
    سيتم إضافة المنتج إلى قسم: {selectedSection?.name}
  </div>
</div>
</>
   )}
  </div>
</div>


            {/* الأقسام */}

            {categoryType1 !== "2" &&(
              <>
            <div className="mt-20 flex overflow-x-auto mr-5">
              {sections.map(sec => (
                <button key={sec.id} onClick={() => setSelectedSection(sec)}
                  className={`px-6 py-2 border-l-2 border-white ${selectedSection?.id === sec.id ? 'bg-green-800 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}>
                  {sec.name}
                </button>
              ))}
              <button className="bg-gray-100 text-green-500 text-xl px-10 shadow"
                onClick={() => setShowAddSectionModal(true)}>+</button>
            </div>

            <div className="bg-white shadow overflow-hidden w-[850px] mr-5">
              <table className="w-full text-center">
                <thead className="bg-green-800 text-white">
                  <tr>
                    <th className="p-3">الصورة</th>
                    <th className="p-3">الاسم عربي</th>
                    <th className="p-3">الوصف</th>
                    <th className="p-3">السعر</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={5} className="p-5 text-gray-500">لا توجد منتجات</td></tr>
                  ) : products.map(prod => (
                    <tr key={prod.id} className="border-b">
                      <td className="p-2"><img src={prod.imageUrl} className="w-14 h-14 object-cover rounded mx-auto" /></td>
                      <td>{prod.name}</td>
                      <td>{prod.description|| '-'}</td>
                      <td>{prod.price} ر.م</td>
                      <td className="flex justify-center gap-2 py-2">
                        <button className="bg-black  rounded w-6 h-6" onClick={() => editProduct(prod)}>    <PencilIcon className="w-5 h-5 text-white" />
</button>
                        <button className="bg-red-700 rounded w-6 h-6" onClick={() => requestDeleteProduct(prod.id)}>    <TrashIcon className="w-5 h-5 text-white" />
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
</>
)}

          </div>

          {/* العمود الثاني: الحساب */}
          <div className="p-5 mt-5 shadow border border-black w-[350px]">
            <h1 className="text-2xl font-sans mb-2">الحساب</h1>
            <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">{restaurant.nameAr}</p>
            <p className="text-xl bg-gray-100 pr-4 text-left pl-1 py-1 mb-2">{restaurant.nameFr}</p>
            {categoryType1 == "1" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">مطعم</p>}
            {categoryType1 == "2" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">سوبرماركت</p>}
            {categoryType1 == "3" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">صيدليه</p>}
            <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">
              {cityMap[restaurant.addressMain] || restaurant.addressMain}
            </p>

            <h2 className="text-xl font-bold mb-2 mt-4">أيام العمل</h2>
            <div className="bg-white p-3 shadow border border-black">
              {workingDays.length === 0 ? (
                <p className="text-gray-500">لا توجد مواعيد عمل</p>
              ) : workingDays.map((d, i) => (
                <div key={i} className="flex mb-2">
                  <span className="ml-auto">{translateDay(d.day)}</span>
                  <span className="bg-gray-200 px-2 py-1 ml-1">{d.openTime}</span> الى
                  <span className="mr-1 bg-gray-200 px-2 py-1">{d.closeTime}</span>
                </div>
              ))}
            </div>

            <button className="bg-green-700 text-white mt-2 py-1 w-full">حفظ</button>
            <button className="bg-white border border-red-700 text-red-700 mt-2 py-1 w-full">حذف الحساب</button>
          </div>

        </div>

        {/* ************** MODALS ************** */}
        {showAddProductModal && selectedSection && (
          <AddProductModal storeSectionId={selectedSection.id} onClose={() => setShowAddProductModal(false)} onAdded={fetchProducts} />
        )}
        {editingProduct && (
          <EditProductModal productId={editingProduct.id} onClose={() => setEditingProduct(null)} onUpdated={fetchProducts} />
        )}
        {confirmDelete.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded shadow w-80 text-center animate-slideDown">
              <h2 className="text-lg font-bold mb-4">هل أنت متأكد من حذف هذا المنتج؟</h2>
              <div className="flex justify-center gap-4">
                <button className="bg-red-600 text-white px-4 py-1 rounded" onClick={confirmDeleteProduct}>حذف</button>
                <button className="bg-gray-100 border-2 border-gray-600 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setConfirmDelete({ show: false, productId: null })}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow w-96 text-center">
              <h2 className="text-xl font-bold mb-3">إضافة قسم جديد</h2>
              <input className="border p-2 mb-3 w-full bg-gray-200" placeholder="الاسم بالعربي" value={newSectionAr} onChange={(e) => setNewSectionAr(e.target.value)} />
              <input className="border p-2 mb-3 w-full bg-gray-200" placeholder="الاسم بالفرنسي" value={newSectionFr} onChange={(e) => setNewSectionFr(e.target.value)} />
              <div className="flex mt-4 justify-center">
                <button className="bg-green-700 text-white px-12 py-1 ml-2" onClick={async () => {
                  if (!newSectionAr || !newSectionFr) { alert("رجاءً املأ الاسم بالعربي والفرنسي"); return; }
                  const form = new FormData();
                  form.append("NameAr", newSectionAr);
                  form.append("NameFr", newSectionFr);
                  form.append("StoreId", restaurant.id.toString());
                  const res = await fetch(`${BASE}/api/Post/store-section`, { method: "POST", body: form });
                  if (res.ok) { setShowAddSectionModal(false); setNewSectionAr(""); setNewSectionFr(""); fetchSections(); }
                }}>حفظ</button>
<button
  className="bg-white border border-red-700 text-red-700 mt-2 py-1 w-full"
  onClick={() => setShowDeleteStoreConfirm(true)}
>
  حذف الحساب
</button>
              </div>
            </div>
          </div>
        )}

      </div>
      {showDeleteStoreConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow w-80 text-center">
      <h2 className="text-lg font-bold mb-4">
        هل أنتِ متأكدة من حذف الحساب؟
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        سيتم حذف المطعم وكل البيانات المرتبطة به نهائيًا
      </p>

      <div className="flex justify-center gap-4">
        <button
          className="bg-red-700 text-white px-6 py-1 rounded"
          onClick={deleteStore}
        >
          حذف
        </button>
        <button
          className="bg-gray-100 border border-gray-600 text-gray-700 px-6 py-1 rounded"
          onClick={() => setShowDeleteStoreConfirm(false)}
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
)}

      
    </div>
  );
}
