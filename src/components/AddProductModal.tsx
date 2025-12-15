import React, { useState } from "react";

const BASE = "https://deliver-web-app2.runasp.net";

export default function AddProductModal({ storeSectionId, onClose, onAdded }) {
  const [newProductAr, setNewProductAr] = useState("");
  const [newProductFr, setNewProductFr] = useState("");
  const [newDescAr, setNewDescAr] = useState("");
  const [newDescFr, setNewDescFr] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState(null);

  const addProduct = async () => {
    if (!newProductAr || !newProductFr || !newDescAr || !newDescFr || !newPrice || !newImage) {
      alert("رجاءً املأ كل الحقول واختر صورة");
      return;
    }

    const form = new FormData();
    form.append("NameAr", newProductAr);
    form.append("NameFr", newProductFr);
    form.append("DescriptionAr", newDescAr);
    form.append("DescriptionFr", newDescFr);
    form.append("Price", newPrice);
    form.append("Image", newImage);
    form.append("StoreSectionId", storeSectionId);

    const res = await fetch(`${BASE}/api/Post/product`, {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      alert("تمت إضافة المنتج بنجاح");
      onAdded(); // تنبيه الصفحة الرئيسية لتحديث المنتجات
      onClose(); // غلق المودال
    } else {
      alert("حدث خطأ أثناء إضافة المنتج");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-96 text-center">
        <h2 className="text-xl font-bold mb-3">إضافة منتج جديد</h2>
        <input
          type="file"
          className="border border-black p-20 mb-2 w-full bg-gray-100"
          onChange={(e) => setNewImage(e.target.files[0])}
        />
        <input
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="الاسم بالعربي"
          value={newProductAr}
          onChange={(e) => setNewProductAr(e.target.value)}
        />
        <input
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="الاسم بالفرنسي"
          value={newProductFr}
          onChange={(e) => setNewProductFr(e.target.value)}
        />
         <input
          type="number"
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="السعر"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <input
          className="border border-black p-10 mb-2 w-full bg-gray-100"
          placeholder="الوصف بالعربي"
          value={newDescAr}
          onChange={(e) => setNewDescAr(e.target.value)}
        />
        <input
          className="border border-black p-10 mb-2 w-full bg-gray-100"
          placeholder="الوصف بالفرنسي"
          value={newDescFr}
          onChange={(e) => setNewDescFr(e.target.value)}
        />
       
       

        <div className="flex mt-4">
          <button
            className="bg-green-700 text-white px-12 py-1 ml-2"
            onClick={addProduct}
          >
            حفظ
          </button>
          <button
            className="bg-gray-100 border-2 border-red-700 text-red-700 px-12 py-1"
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
