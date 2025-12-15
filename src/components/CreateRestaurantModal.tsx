import CreateRestaurant from "../AdminPages/CreateRestaurant";

export default function CreateRestaurantModal({
  subcategoryId,
  subcategoryName,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow w-[95%] max-w-[1400px] h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            إضافة مطعم جديد – {subcategoryName}
          </h2>
          <button
            onClick={onClose}
            className="text-red-600 font-bold text-xl"
          >
            ✖
          </button>
        </div>

        {/* Scroll */}
        <div className="flex-1 overflow-y-auto">
          <CreateRestaurant
            isModal={true}
            subcategoryId={subcategoryId}
          />
        </div>
      </div>
    </div>
  );
}
