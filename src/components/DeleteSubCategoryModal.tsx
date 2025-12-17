// components/DeleteSubCategoryModal.jsx
import React, { useState } from "react";

const DeleteSubCategoryModal = ({ subcategory, onClose, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف "${subcategory.name}"؟`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://deliver-web-app2.runasp.net/api/Subcategories/DeleleSubCategoryByid/${subcategory.id}`,
        {
          method: "DELETE",
          headers: {
            "accept": "*/*",
          },
        }
      );

      if (response.ok) {
        onDelete();
        alert("تم الحذف بنجاح");
        onClose();
      } else {
        const errorText = await response.text();
        alert(`فشل في الحذف: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center text-red-600">تأكيد الحذف</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 text-center">
            هل أنت متأكد من حذف القسم الفرعي:
          </p>
          <p className="text-center font-bold text-lg my-2">{subcategory.name}</p>
          <p className="text-red-500 text-sm text-center">
            ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
          </p>
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubCategoryModal;