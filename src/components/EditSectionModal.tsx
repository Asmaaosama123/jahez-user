import React, { useState, useEffect } from "react";

const EditSectionModal = ({ section, onClose, onUpdate }) => {
  const [nameAr, setNameAr] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // جلب بيانات الـ section مباشرة من API عند فتح المودال
  useEffect(() => {
    if (!section || !section.id) return;

    const fetchSection = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`https://jahezdelivery.com/api/Subcategories/GetSectionByid/${section.id}`, {
          headers: { accept: "*/*" },
        });
        if (res.ok) {
          const data = await res.json();
          setNameAr(data.nameAr || "");
          setNameFr(data.nameFr || "");
        } else {
          alert("فشل في جلب بيانات القسم الفرعي");
        }
      } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء جلب البيانات");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSection();
  }, [section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch(
        `https://jahezdelivery.com/api/Subcategories/UpdateSectionByid/${section.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({ nameAr, nameFr }),
        }
      );
  
      if (response.ok) {
        // بدل الاعتماد على response
        onUpdate({ id: section.id, nameAr, nameFr });
        onClose();
      } else {
        alert("فشل في التعديل");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التعديل");
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 text-center">
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">تعديل القسم الفرعي</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الاسم بالعربي</label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-50"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الاسم بالفرنسية</label>
            <input
              type="text"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-50"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSectionModal;
