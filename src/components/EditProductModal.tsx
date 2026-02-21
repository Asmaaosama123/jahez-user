import React, { useEffect, useState, useRef } from "react";
import { CameraIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { BASE_URL } from "../utils/apiConfig";

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
  currentImage?: string; // ← أضف هذا السطر
}


interface Props {
  productId: number;
  onClose: () => void;
  onUpdated: () => void;
}

const BASE = BASE_URL;

const EditProductModal: React.FC<Props> = ({ productId, onClose, onUpdated, currentImage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);

  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [price, setPrice] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const descArRef = useRef<HTMLTextAreaElement>(null);
  const descFrRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // لو الصورة موجودة كـ prop استخدمها مباشرة
        if (currentImage) {
          let imageUrl = currentImage.startsWith('http') ? currentImage : `${BASE}/${currentImage.replace(/^\/+/, '')}`;
          setImagePreview(imageUrl);
        }

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

        // لو لم يتم تمرير currentImage، اعمل إعداد الصورة من الـ API
        if (!currentImage) {
          let imageUrl = prod.imageUrl || "";
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${BASE}/${imageUrl.replace(/^\/+/, '')}`;
          }
          setImagePreview(imageUrl);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, currentImage]);

  // جعل الكتابة تبدأ من الأعلى في textarea
  useEffect(() => {
    if (descArRef.current) {
      descArRef.current.style.textAlign = "right";
      descArRef.current.style.direction = "rtl";
    }
    if (descFrRef.current) {
      descFrRef.current.style.textAlign = "right";
      descFrRef.current.style.direction = "rtl";
    }
  }, []);

  // دالة لفتح نافذة اختيار الملف
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // دالة لتغيير الصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لمعالجة خطأ في تحميل الصورة
  const handleImageError = () => {
    // إذا فشل تحميل الصورة، استخدم صورة بديلة
    setImagePreview("https://via.placeholder.com/300x200?text=No+Image");
  };

  const handleSubmit = async () => {
    if (!product) return;

    setIsSubmitting(true);

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
        // عرض رسالة النجاح مع أنيميشن
        setShowSuccess(true);

        // تأخير بسيط لمشاهدة الأنيميشن ثم التحديث والإغلاق
        setTimeout(() => {
          onUpdated();
          onClose();
        }, 1500);
      } else {
        const err = await res.text();
        alert("حدث خطأ أثناء التحديث: " + err);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      alert("حدث خطأ أثناء التحديث: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-700">جارٍ تحميل بيانات المنتج...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4">
        <div className="text-red-600 text-center mb-4">⚠️</div>
        <p className="text-red-600 text-center">{error}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      {/* أنيميشن النجاح */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-bounce-success bg-green-600 text-white p-6 md:p-8 rounded-full shadow-2xl flex flex-col items-center">
            <CheckCircleIcon className="w-16 h-16 text-white mb-2" />
            <div className="text-lg md:text-xl font-bold">تم التعديل بنجاح!</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* الهيدر ثابت */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">تعديل المنتج</h2>
          <p className="text-gray-500 text-center text-sm mt-1">ID: {product.id}</p>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* عرض الصورة مع زر الكاميرا */}
          <div className="mb-6">
            <label className="block text-right text-gray-700 mb-2 text-sm md:text-base">
              صورة المنتج
            </label>
            <div className="relative">
              {/* الحاوية الرئيسية للصورة */}
              <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden border-2 border-gray-300 bg-gray-100">
                {/* عرض الصورة أو صورة بديلة */}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="صورة المنتج"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                    <CameraIcon className="w-16 h-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">لا توجد صورة</p>
                  </div>
                )}

                {/* زر الكاميرا - هذا الزر يعمل الآن */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="absolute bottom-3 right-3 bg-black bg-opacity-70 p-3 rounded-full transition-all duration-300 hover:bg-opacity-90 hover:scale-110 active:scale-95 cursor-pointer z-10"
                >
                  <CameraIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </div>

              {/* input مخفي - سيتم تشغيله من زر الكاميرا */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />

              <p className="text-xs text-gray-500 mt-2 text-center">
                انقر على أيقونة الكاميرا لتغيير الصورة
              </p>
            </div>
          </div>

          {/* حقل الإدخال للنصوص */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">الاسم بالعربي</label>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-right text-sm md:text-base"
                placeholder="أدخل الاسم بالعربية"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">الاسم بالفرنسي</label>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-right text-sm md:text-base"
                placeholder="أدخل الاسم بالفرنسية"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">السعر</label>
              <input
                type="number"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-left text-sm md:text-base"
                placeholder="أدخل السعر"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">الوصف بالعربي</label>
              <textarea
                ref={descArRef}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none text-right text-sm md:text-base"
                placeholder="أدخل الوصف بالعربية"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows="3"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">الوصف بالفرنسي</label>
              <textarea
                ref={descFrRef}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none text-right text-sm md:text-base"
                placeholder="أدخل الوصف بالفرنسية"
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                rows="3"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>
            <div>
              <label className="block text-right text-gray-700 mb-1 text-sm md:text-base">
                حالة المنتج
              </label>

              <select
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg bg-gray-50
               focus:bg-white focus:border-green-500 focus:ring-2
               focus:ring-green-200 transition-all text-right text-sm md:text-base"
                value={isAvailable ? "true" : "false"}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
                style={{ direction: "rtl" }}
              >
                <option value="true">🟢 متاح</option>
                <option value="false">🔴 غير متاح</option>
              </select>
            </div>



          </div>
        </div>

        {/* أزرار التحكم ثابتة في الأسفل */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-2 md:gap-3">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 md:py-3 px-2 md:px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                  <span className="text-xs md:text-sm">جاري التعديل...</span>
                </>
              ) : (
                <>
                  <span className="text-xs md:text-base">حفظ التعديلات</span>
                </>
              )}
            </button>

            <button
              className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-2 md:py-3 px-2 md:px-4 rounded-lg transition-all text-sm md:text-base"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      {/* إضافة أنماط CSS للأنيميشن */}
      <style jsx>{`
        @keyframes bounceSuccess {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-success {
          animation: bounceSuccess 1s ease-in-out;
        }
        
        /* تخصيص شريط التمرير */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default EditProductModal;