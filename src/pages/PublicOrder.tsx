import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/solid";

const BASE = "http://deliver-web-app2.runasp.net";

export default function PublicOrder() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/Orders/PublicOrder/${orderId}`)
      .then(res => res.json())
      .then(setData);
  }, [orderId]);

  if (!data) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4" dir="rtl">

      {/* ===== الإجمالي ===== */}
      {data.type === "items" && (
        <div className="text-center mb-4">
          <p className="text-gray-500 text-sm">إجمالي الطلب</p>
          <p className="text-3xl font-bold text-green-700">
            {data.GrandTotal} MRU
          </p>
        </div>
      )}

      {/* ===== كارت المتجر + العميل ===== */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">

        {/* المتجر */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-bold">{data.StoreName}</p>
            <p className="text-sm text-green-700">
              📍 {data.StoreAddress}
            </p>
          </div>

          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            🏪
          </div>
        </div>

        <hr className="my-3" />

        {/* العميل */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">ID{data.OrderId.slice(0, 6)}</p>
            <p className="text-sm text-green-700">
              📍 {data.CustomerAddress}
            </p>
          </div>

          <a
            href={`tel:${data.CustomerPhone}`}
            className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white"
          >
            <PhoneIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* ===== محتوى الطلب (لو نص) ===== */}
      {data.type === "content" && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-2">محتوى الطلب</h3>
          <p>{data.OrderContent}</p>
        </div>
      )}

      {/* ===== المنتجات ===== */}
      {data.type === "items" && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-3">{data.StoreName}</h3>

          {data.Items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border rounded-full flex items-center justify-center text-green-700 font-bold">
                  {item.Qty}
                </div>

                <div>
                  <p className="font-medium">{item.ProductName}</p>
                  <p className="text-sm text-green-700">
                    {item.Price} MRU
                  </p>
                </div>
              </div>

              <img
                src={item.ImageUrl}
                alt={item.ProductName}
                className="w-14 h-14 rounded-lg object-cover border"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
