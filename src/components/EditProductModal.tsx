import React, { useEffect, useState } from "react";

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

interface Props {
    productId: number;
    onClose: () => void;
    onUpdated: () => void;
  }
  

const BASE = "http://deliver-web-app2.runasp.net";

const EditProductModal: React.FC<Props> = ({ productId, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);

  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [price, setPrice] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE}/api/CustomerGet/product/${productId}`);
        if (!res.ok) throw new Error("المنتج غير موجود");
        const prod: Product = await res.json();
  
        setProduct(prod);
        setNameAr(prod.nameAr);
        setNameFr(prod.nameFr || "");
        setDescriptionAr(prod.descriptionAr || "");
        setDescriptionFr(prod.descriptionFr || "");
        setPrice(prod.price);
        setIsAvailable(prod.isAvailable);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProduct();
  }, [productId]);
  
  const handleSubmit = async () => {
    if (!product) return;
    const form = new FormData();
    form.append("Id", product.id.toString());
    form.append("NameAr", nameAr);
    form.append("NameFr", nameFr);
    form.append("DescriptionAr", descriptionAr);
    form.append("DescriptionFr", descriptionFr);
    form.append("Price", price.toString());
    form.append("StoreSectionId", product.storeSectionId.toString());
    form.append("IsAvailable", isAvailable.toString());
    if (imageFile) form.append("Image", imageFile);

    try {
      const res = await fetch(`${BASE}/api/CustomerGet/product`, {
        method: "PUT",
        body: form,
      });
      if (res.ok) {
        onUpdated();
        onClose();
      } else {
        const err = await res.text();
        alert("حدث خطأ أثناء التحديث: " + err);
      }
    } catch (error: any) {
      alert("حدث خطأ أثناء التحديث: " + error.message);
    }
  };

  if (loading) return <div className="p-4 text-center">جارٍ تحميل بيانات المنتج...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white p-6 rounded shadow w-96 text-center animate-slideDown">
        <h2 className="text-xl font-bold mb-3">تعديل المنتج</h2>

        <img
          src={product.imageUrl}
          alt="الصورة الحالية"
          className="w-32 h-32 object-cover mx-auto mb-3 rounded"
        />

        <input
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="الاسم بالعربي"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
        />
        <input
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="الاسم بالفرنسي"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
        />
        <textarea
          className="border border-black p-10 mb-2 w-full bg-gray-100"
          placeholder="الوصف بالعربي"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
        />
        <textarea
          className="border border-black p-10 mb-2 w-full bg-gray-100"
          placeholder="الوصف بالفرنسي"
          value={descriptionFr}
          onChange={(e) => setDescriptionFr(e.target.value)}
        />
        <input
          type="number"
          className="border border-black p-2 mb-2 w-full bg-gray-100"
          placeholder="السعر"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <input
          type="file"
          className="mb-2 p-1 w-full"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {/* <div className="flex items-center justify-center mb-3">
          <label className="mr-2">متاح؟</label>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />
        </div> */}
        <div className="flex justify-center gap-2">
          <button             className="bg-green-700 text-white px-12 py-1 ml-2"
 onClick={handleSubmit}>
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
};

export default EditProductModal;
