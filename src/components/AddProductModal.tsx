import React, { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../utils/apiConfig";

const BASE = BASE_URL;

export default function AddProductModal({ storeSectionId, onClose, onAdded }) {
  const [newProductAr, setNewProductAr] = useState("");
  const [newProductFr, setNewProductFr] = useState("");
  const [newDescAr, setNewDescAr] = useState("");
  const [newDescFr, setNewDescFr] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs لضبط مؤشر الكتابة في textarea
  const descArRef = useRef(null);
  const descFrRef = useRef(null);

  // عند تغيير الصورة، نعرض معاينة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const addProduct = async () => {
    if (!newProductAr || !newProductFr || !newDescAr || !newDescFr || !newPrice || !newImage) {
      alert("رجاءً املأ كل الحقول واختر صورة");
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();
    form.append("NameAr", newProductAr);
    form.append("NameFr", newProductFr);
    form.append("DescriptionAr", newDescAr);
    form.append("DescriptionFr", newDescFr);
    form.append("Price", newPrice);
    form.append("Image", newImage);
    form.append("StoreSectionId", storeSectionId);
    form.append("IsAvailable", isAvailable);

    try {
      const res = await fetch(`${BASE}/api/Post/product`, {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        // عرض رسالة النجاح مع أنيميشن
        setShowSuccess(true);

        // تأخير بسيط لمشاهدة الأنيميشن
        setTimeout(() => {
          onAdded();
          onClose();
        }, 1500);
      } else {
        alert("حدث خطأ أثناء إضافة المنتج");
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      {/* أنيميشن النجاح */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-bounce-success bg-green-600 text-white p-6 md:p-8 rounded-full shadow-2xl">
            <div className="text-3xl md:text-4xl">✓</div>
            <div className="mt-2 text-lg md:text-xl font-bold">تمت الإضافة بنجاح!</div>
          </div>
        </div>
      )}

      <div className="bg-white  shadow-2xl w-full max-w-md md:max-w-lg mx-4 flex flex-col max-h-[100vh] overflow-hidden">
        {/* الهيدر ثابت */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">إضافة منتج جديد</h2>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* مربع رفع الصورة مع المعاينة */}
          <div
            className="relative border-2 border-dashed border-gray-300  p-4 mb-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="w-full h-40 md:h-48 object-cover "
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center  opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold text-sm md:text-base">تغيير الصورة</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 md:py-8">
                <div className="text-3xl md:text-4xl mb-2">📷</div>
                <p className="text-gray-600 text-sm md:text-base">انقر لرفع صورة المنتج</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">يفضل صورة بحجم 800x600</p>
              </div>
            )}
          </div>

          {/* حقل الإدخال للنصوص */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-right text-sm md:text-base"
                placeholder="أدخل الاسم بالعربية"
                value={newProductAr}
                onChange={(e) => setNewProductAr(e.target.value)}
              />
            </div>

            <div>
              <input
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-right text-sm md:text-base"
                placeholder="أدخل الاسم بالفرنسية"
                value={newProductFr}
                onChange={(e) => setNewProductFr(e.target.value)}
              />
            </div>

            <div>
              <input
                type="number"
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-right text-sm md:text-base"
                placeholder="أدخل السعر"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>

            <div>
              <textarea
                ref={descArRef}
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none text-right text-sm md:text-base"
                placeholder="أدخل الوصف بالعربية"
                value={newDescAr}
                onChange={(e) => setNewDescAr(e.target.value)}
                rows="3"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>

            <div>
              <textarea
                ref={descFrRef}
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none text-right text-sm md:text-base"
                placeholder="أدخل الوصف بالفرنسية"
                value={newDescFr}
                onChange={(e) => setNewDescFr(e.target.value)}
                rows="3"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>
            <div>
              <select
                className="w-full p-2 md:p-3 border border-gray-300 bg-gray-50
                        focus:bg-white focus:border-green-500 focus:ring-2
                        focus:ring-green-200 transition-all text-right text-sm md:text-base"
                value={isAvailable}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
                style={{ textAlign: "right", direction: "rtl" }}
              >
                <option value="true">متاح</option>
                <option value="false">غير متاح</option>
              </select>
            </div>

          </div>
        </div>

        {/* أزرار التحكم ثابتة في الأسفل */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-2 md:gap-3">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 md:py-3 px-2 md:px-4  transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              onClick={addProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                  <span className="text-xs md:text-sm">جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span className="text-xs md:text-base">حفظ المنتج</span>
                </>
              )}
            </button>

            <button
              className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-2 md:py-3 px-2 md:px-4  transition-all text-sm md:text-base"
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
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
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
}