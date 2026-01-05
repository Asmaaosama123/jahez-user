import React, { useEffect, useState } from "react";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import EditRestaurantModal from "../components/EditRestaurantModal";
import EditSectionModal from "../components/EditSectionModal";
import DeleteSectionModal from "../components/DeleteSectionModal";
import JahezBox from "../assets/Jahez BOX.png";

import { useParams } from "react-router-dom";

const BASE = "https://jahezdelivery.com";

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
  const { id } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryType, setCategoryType] = useState<string | null>(null);
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSucForEdit, setSelectedSucForEdit] = useState<Section | null>(null);
  const [selectedSubForDelete, setSelectedSubForDelete] = useState<Section | null>(null);
  const [jahezBoxActive, setJahezBoxActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedSectionForEdit, setSelectedSectionForEdit] = useState(null);
const [selectedSectionForDelete, setSelectedSectionForDelete] = useState(null);
const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);


  const cityMap: { [key: string]: string } = {
    "Nouakchott": "أنواكشوط",
    "Nouadhibou": "أنواذيبو",
  };

  // دالة لبناء URL الصور الكاملة
  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE}/images/${url.replace(/^\/+/, "")}`;
  };
  
  // جلب نوع الفئة
  useEffect(() => {
    const fetchCategoryType = async () => {
      try {
        const res = await fetch(`${BASE}/api/Subcategories/GetStoreCategory/${restaurantData.id}`);
        const data = await res.json();
        setCategoryType(data.category?.toString() || "1");
      } catch (err) {
        console.error(err);
        setCategoryType("1");
      }
    };
    if (restaurantData?.id) fetchCategoryType();
  }, [restaurantData]);

  // ---------- FETCH DATA ----------
  const fetchSections = async () => {
    try {
      const res = await fetch(`${BASE}/api/Subcategories/${restaurantData.id}/sections?lang=ar`);
      const data = await res.json();
      setSections(data);
      if (data.length > 0) {
        setSelectedSection(data[0]);
        // جلب منتجات القسم الأول تلقائياً
        setTimeout(() => {
          fetchProductsForSection(data[0].id);
        }, 100);
      }
    } catch {
      setSections([]);
    }
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`${BASE}/api/CustomerGet/store/${id}`);
        const data = await res.json();
        setRestaurantData(data);

      } catch (err) {
        console.error("Error fetching restaurant", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) fetchRestaurant();
  }, [id]);

  useEffect(() => {
    if (restaurantData) {
      setJahezBoxActive(Boolean(restaurantData.jahezBoxActive));
    }
  }, [restaurantData]);
  

  const fetchProductsForSection = async (sectionId: number) => {
    try {
      const res = await fetch(`${BASE}/api/CustomerGet/section/${sectionId}/products?lang=ar`);
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts([]);
    }
  };

  const fetchProducts = async () => {
    if (!selectedSection) return;
    fetchProductsForSection(selectedSection.id);
  };

  const fetchWorkingDays = async () => {
    try {
      const res = await fetch(`${BASE}/api/CustomerGet/store-working-days/${restaurantData.id}`);
      const data = await res.json();
      setWorkingDays(data);
    } catch {
      setWorkingDays([]);
    }
  };

  useEffect(() => {
    if (restaurantData) {
      fetchSections();
      fetchWorkingDays();
    }
  }, [restaurantData]);

  useEffect(() => {
    if (selectedSection) {
      fetchProducts();
    }
  }, [selectedSection]);

  const translateDay = (day: string) => {
    const days: Record<string, string> = {
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
        `${BASE}/api/CustomerGet/store/${restaurantData.id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (res.ok) {
        alert("تم حذف الحساب بنجاح");
        window.location.href = "/admin/orders";
      } else {
        alert("حدث خطأ أثناء حذف الحساب");
      }
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بالسيرفر");
    }
  };

  const handleEditSection = (section: Section) => {
    setSelectedSucForEdit(section);
    setShowEditSectionModal(true);
  };
  
  
  const handleDeleteSection = (section: Section) => {
    setSelectedSubForDelete(section);
    setShowDeleteModal(true);
  };

  // Fetch Restaurant + Sections + Products + WorkingDays ...
  // (احتفظي بالكود الأصلي بدون أي تعديل)

  // ---------- Update Section ----------
// ---------- Update Section ----------
// ---------- Update Section ----------
const handleUpdateSection = ({ id, nameAr, nameFr }) => {
  // تحديث قائمة الأقسام
  setSections(prev => prev.map(sec =>
    sec.id === id ? { ...sec, nameAr, nameFr } : sec
  ));

  // تحديث القسم المحدد لو هو نفسه المحدث
  if (selectedSection?.id === id) {
    setSelectedSection(prev => ({ ...prev, nameAr, nameFr }));
  }

  // تحديث القسم في المودال نفسه لو مفتوح
  if (selectedSucForEdit?.id === id) {
    setSelectedSucForEdit(prev => ({ ...prev, nameAr, nameFr }));
  }

  // إخفاء المودال بعد التحديث
  setShowEditSectionModal(false);
};
  // ---------- Delete Section ----------
  const handleDeleteSectionSuccess = (deletedId: number) => {
    setSections(prev => {
      const updated = prev.filter(s => s.id !== deletedId);
  
      // إذا كان القسم المحدد هو اللي اتحذف
      if (selectedSection?.id === deletedId) {
        const newSelected = updated[0] || null;
        setSelectedSection(newSelected);
  
        // جلب منتجات القسم الجديد لو موجود
        if (newSelected) fetchProductsForSection(newSelected.id);
        else setProducts([]);
      }
  
      return updated;
    });
  
    setShowDeleteModal(false);
    setSelectedSubForDelete(null);
  };
  
  // تحديث البيانات فوراً بعد التعديل
  const handleRestaurantUpdated = async () => {
    try {
      // جلب بيانات المطعم المحدثة
      const res = await fetch(`${BASE}/api/CustomerGet/store/${restaurantData.id}`);
      const updatedStore = await res.json();
      
      // تحديث الصور مع إضافة timestamp لمنع الكاش
      const timestamp = new Date().getTime();
      updatedStore.coverImageUrl = `${getFullImageUrl(updatedStore.coverImageUrl)}?t=${timestamp}`;
      updatedStore.profileImageUrl = `${getFullImageUrl(updatedStore.profileImageUrl)}?t=${timestamp}`;
      
      setRestaurantData(updatedStore);
      
      // تحديث كل البيانات
      fetchSections();
      fetchWorkingDays();
      
      if (selectedSection) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating restaurant data:", error);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen" dir="rtl">
      <Sidebar />
      <div className="flex-1">
        <Header />

        {/* ************** COVER + PROFILE + ACCOUNT ************** */}
        <div className="mt-[75px] flex gap-6">

          {/* العمود الأول */}
          <div className="flex flex-col">
            {/* الغلاف + الصورة الشخصية */}
            <div className="flex flex-col w-[850px] mr-5">
              <img 
                src={getFullImageUrl(restaurantData?.coverImageUrl || '')} 
                className="w-full h-64 object-cover shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/850x256?text=صورة+الغلاف";
                }}
              />
              <div className="flex items-end gap-2 -mt-12 mr-6">
                <img 
                  src={getFullImageUrl(restaurantData?.profileImageUrl || '')} 
                  className="w-24 h-24 rounded-full shadow-lg border-4 border-white"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/100x100?text=البروفايل";
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold">{restaurantData?.nameAr}</h1>
                  <p className={`font-bold ${restaurantData?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {restaurantData?.isOpen ? 'مفتوح' : 'مغلق'}
                  </p>
                </div>
                
               {/* زر إضافة المنتج */}
{(categoryType !== "2" || (categoryType === "2" && selectedSection?.name === "جاهز بوكس")) && (
  <div className="relative group">
    <button
      className="bg-green-700 text-white px-8 py-2 shadow mr-[480px]"
      onClick={() => setShowAddProductModal(true)}
    >
      إضافة منتج
    </button>
    <div className="absolute top-full left-0 mb-2 hidden group-hover:block bg-black text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
      سيتم إضافة المنتج إلى قسم: {selectedSection?.name}
    </div>
  </div>
)}

              </div>
            </div>

            {/* الأقسام */}
            <>
  <div className="mt-20 mr-5 w-full max-w-[850px] flex flex-wrap">
    {sections
      .filter(sec => {
        // لو سوبرماركت، نعرض فقط قسم "جاهز بوكس"
        if (categoryType === "2") return sec.name === "جاهز بوكس";
        // باقي الحالات نعرض كل الأقسام
        return true;
      })
      .map(sec => (
        <div key={sec.id} className="flex items-center">

          {/* الزر الرئيسي */}
          <button
            onClick={() => setSelectedSection(sec)}
            className={`
              transition 
              ${
                sec.name === "جاهز بوكس"
                  ? "py-3 px-6 bg-blue-500 border-0 w-21 h-10 hover:bg-blue-700"
                  : selectedSection?.id === sec.id
                    ? "px-6 py-2 bg-green-800 text-white font-bold border-1"
                    : "px-6 py-2 bg-gray-200 text-gray-700"
              }
            `}
          >
            {sec.name === "جاهز بوكس" ? (
              <img
                src={JahezBox}
                alt="Jahez Box"
                className="w-full h-full object-contain"
              />
            ) : (
              sec.name
            )}
          </button>

          {/* أزرار الاكشن */}
          {sec.name !== "جاهز بوكس" && categoryType !== "2" && (
            <>
              <button
                onClick={() => handleEditSection(sec)}
                className="p-1 rounded hover:bg-gray-100"
                title="تعديل"
              >
                <PencilIcon className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={() => handleDeleteSection(sec)}
                className="p-1 rounded hover:bg-gray-100"
                title="حذف"
              >
                <TrashIcon className="w-5 h-5 text-red-700" />
              </button>
            </>
          )}
        </div>
      ))}

    {/* زر إضافة سكشن يظهر فقط لو مش سوبرماركت */}
    {categoryType !== "2" && (
      <button 
        className="bg-gray-100 text-green-500 text-xl px-10 shadow rounded"
        onClick={() => setShowAddSectionModal(true)}
      >
        +
      </button>
    )}
  </div>

  {/* جدول المنتجات + زر إضافة منتج */}
  {selectedSection && (
    <>
      {categoryType !== "2" || (categoryType === "2" && selectedSection.name === "جاهز بوكس") ? (
        <>
        

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
                  <tr>
                    <td colSpan={5} className="p-5 text-gray-500">لا توجد منتجات</td>
                  </tr>
                ) : products.map(prod => (
                  <tr key={prod.id} className="border-b">
                    <td className="p-2">
                      <img 
                        src={getFullImageUrl(prod.imageUrl)} 
                        className="w-14 h-14 object-cover rounded mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/56x56?text=صورة";
                        }}
                      />
                    </td>
                    <td>{prod.name}</td>
                    <td>{prod.description || '-'}</td>
                    <td>{prod.price} ر.م</td>
                    <td className="flex justify-center gap-2 py-2">
                      <button 
                        className="bg-black rounded w-6 h-6" 
                        onClick={() => editProduct(prod)}
                      >
                        <PencilIcon className="w-5 h-5 text-white" />
                      </button>
                      <button 
                        className="bg-red-700 rounded w-6 h-6" 
                        onClick={() => requestDeleteProduct(prod.id)}
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  )}
</>

          </div>

          {/* العمود الثاني: الحساب */}
          <div className="p-5 mt-5 shadow border border-black w-[350px] h-fit">
          <div className="flex items-center justify-between mb-2">
  <h1 className="text-2xl font-sans mb-2">الحساب</h1>
  <button
  className={`w-20 h-12 flex items-center px-3 py-6 justify-center mt-2 transition-all duration-300
    ${jahezBoxActive ? 'bg-blue-500 border-blue-700 shadow-lg' : 'bg-gray-300 border-gray-500'} p-1 rounded-sm`}
  onClick={async () => {
    try {
      const newValue = !jahezBoxActive;
      setJahezBoxActive(newValue);

      const res = await fetch(`${BASE}/api/CustomerGet/jahezbox/${restaurantData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newValue }),
      });

      if (!res.ok) throw new Error('تعذر تحديث الحالة');

      // ✨ ناخد الرد من الـ API
      const data = await res.json();

      // (اختياري) نستخدم القيمة اللي رجعت من السيرفر
      setJahezBoxActive(data.jahezBoxActive);

      // ✨ لو رجّع SectionId
      if (data.jahezSectionId) {
        // نحدّث الأقسام
        await fetchSections();

        // نخلي السكشن ده متحدد
        setSelectedSection({
          id: data.jahezSectionId
        });
      }

      setToast(`تم تحديث جاهز بوكس بنجاح!`);
      setTimeout(() => setToast(null), 2500);

    } catch (err) {
      console.error(err);
      setJahezBoxActive(prev => !prev);
      setToast('حدث خطأ أثناء التحديث');
      setTimeout(() => setToast(null), 2500);
    }
  }}
>
  <img 
    src={JahezBox} 
    loading="lazy" 
    className={`w-15 h-10 transition-transform duration-300 ${jahezBoxActive ? 'scale-110' : 'scale-100 opacity-70'}`}
  />
</button>


  {/* Toast Notification */}
  {toast && (
    <div className="fixed top-20 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fadeIn">
      {toast}
    </div>
  )}
</div>
            <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">{restaurantData?.nameAr}</p>
            <p className="text-xl bg-gray-100 pr-4 text-left pl-1 py-1 mb-2">{restaurantData?.nameFr}</p>
            {categoryType === "1" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">مطعم</p>}
            {categoryType === "2" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">سوبرماركت</p>}
            {categoryType === "3" && <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">صيدلية</p>}
            <p className="text-xl bg-gray-100 pl-4 py-1 mb-2">
              {cityMap[restaurantData?.addressMain] || restaurantData?.addressMain}
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

            <button 
              className="bg-green-700 text-white mt-4 py-2 w-full"
              onClick={() => setShowEditModal(true)}
            >
              تعديل الحساب
            </button>
            <button
              className="bg-white border border-red-700 text-red-700 mt-2 py-2 w-full"
              onClick={() => setShowDeleteStoreConfirm(true)}
            >
              حذف الحساب
            </button>
           

          </div>
        </div>

        {/* ************** MODALS ************** */}
        {showAddProductModal && selectedSection && (
          <AddProductModal 
            storeSectionId={selectedSection.id} 
            onClose={() => setShowAddProductModal(false)} 
            onAdded={fetchProducts} 
          />
        )}
        
        {editingProduct && (
  <EditProductModal 
    productId={editingProduct.id} 
    currentImage={editingProduct.imageUrl} // أضف هذا السطر
    onClose={() => setEditingProduct(null)} 
    onUpdated={fetchProducts} 
  />
)}

        
        {confirmDelete.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded shadow w-80 text-center animate-slideDown">
              <h2 className="text-lg font-bold mb-4">هل أنت متأكد من حذف هذا المنتج؟</h2>
              <div className="flex justify-center gap-4">
                <button className="bg-red-600 text-white px-4 py-1 rounded" onClick={confirmDeleteProduct}>حذف</button>
                <button 
                  className="bg-gray-100 border-2 border-gray-600 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setConfirmDelete({ show: false, productId: null })}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow w-96 text-center">
              <h2 className="text-xl font-bold mb-3">إضافة قسم جديد</h2>
              <input 
                className="border p-2 mb-3 w-full bg-gray-200" 
                placeholder="الاسم بالعربي" 
                value={newSectionAr} 
                onChange={(e) => setNewSectionAr(e.target.value)} 
              />
              <input 
                className="border p-2 mb-3 w-full bg-gray-200" 
                placeholder="الاسم بالفرنسي" 
                value={newSectionFr} 
                onChange={(e) => setNewSectionFr(e.target.value)} 
              />
              <div className="flex mt-4 justify-center">
                <button 
                  className="bg-green-700 text-white px-12 py-1 ml-2" 
                  onClick={async () => {
                    if (!newSectionAr || !newSectionFr) { 
                      alert("رجاءً املأ الاسم بالعربي والفرنسي"); 
                      return; 
                    }
                    const form = new FormData();
                    form.append("NameAr", newSectionAr);
                    form.append("NameFr", newSectionFr);
                    form.append("StoreId", restaurantData.id.toString());
                    const res = await fetch(`${BASE}/api/Post/store-section`, { method: "POST", body: form });
                    if (res.ok) { 
                      setShowAddSectionModal(false); 
                      setNewSectionAr(""); 
                      setNewSectionFr(""); 
                      fetchSections(); 
                    }
                  }}
                >
                  حفظ
                </button>
                <button
                  className="bg-gray-100 border-2 border-red-700 text-red-700 px-12 py-1"
                  onClick={() => setShowAddSectionModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
        
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
       {showEditModal && (
  <EditRestaurantModal
    restaurantId={restaurantData.id}
    currentCover={getFullImageUrl(restaurantData.coverImageUrl)} 
    currentProfile={getFullImageUrl(restaurantData.profileImageUrl)} 
    onClose={() => setShowEditModal(false)}
    onUpdated={handleRestaurantUpdated}
  />
)}

{showEditSectionModal && selectedSucForEdit && (
  <EditSectionModal
    section={selectedSucForEdit}
    onClose={() => setShowEditSectionModal(false)}
    onUpdate={handleUpdateSection} // هنا المودال بينادي الصفحة مباشرة
  />
)}


{showDeleteModal && selectedSubForDelete && (
  <DeleteSectionModal
    section={selectedSubForDelete}
    onClose={() => {
      setShowDeleteModal(false);
      setSelectedSubForDelete(null);
    }}
    onDelete={(deletedId) => handleDeleteSectionSuccess(deletedId)}
  />
)}
      </div>
    </div>
  );
}