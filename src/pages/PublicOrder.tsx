import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PhoneIcon } from "@heroicons/react/24/solid";

const BASE = "https://deliver-web-app2.runasp.net";

interface OrderItem {
  qty: number;
  productName: string;
  price: number;
  imageUrl?: string | null;
}

interface OrderData {
  type: "items" | "content";
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  customerAddress?: string;
  customerPhone?: string;
  orderId?: string;
  orderContent?: string;
  imageUrl?: string | null;
  items?: OrderItem[];
}

export default function PublicOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const [data, setData] = useState<OrderData | null>(null);


  useEffect(() => {
    if (!orderId) return;
    fetch(`https://deliver-web-app2.runasp.net/api/Orders/PublicOrder/${orderId}`)
      .then(res => res.json())
      .then(setData);
  }, [orderId]);

  const fixImageUrl = (url: string | null) => {
    if (!url) return "./src/assets/Layer 1.png";
    
    // فصل البروتوكول عن باقي الرابط
    const parts = url.split("://");
    if (parts.length !== 2) return url; // لو مش صحيح
    const protocol = parts[0];
    const path = parts[1].replace(/\/{2,}/g, "/"); // إصلاح الـ double slash فقط في المسار
    return `${protocol}://${path}`;
  };
  

  const grandTotal =
    data && data.type === "items"
      ? data.items?.reduce((sum, item) => sum + item.qty * item.price, 0)
      : 0;


      const saveOrderLink = async (orderId: string) => {
  const publicLink = `${window.location.origin}/public-order/${orderId}`;

  const res = await fetch(
    `${BASE}/api/Orders/SetOrderLink/${orderId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publicLink),
    }
  );

  return await res.json();
};
const USER_IMAGE =
  "https://i.pinimg.com/736x/33/f8/26/33f8266681c946cd80de486c499fe992.jpg";

  if (!data) return <div className="p-6">جاري التحميل...</div>;


  return (
    <div className="bg-gray-100 min-h-screen p-4" dir="rtl">
      {/* ===== الإجمالي ===== */}
      {data?.type === "items" && (
        <div className="text-center mb-4">
          <p className="text-gray-500 text-sm">إجمالي الطلب</p>
          <p className="text-3xl font-bold text-green-700">{grandTotal} MRU</p>
        </div>
      )}

      {/* ===== كارت المتجر + العميل ===== */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        {/* المتجر */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-1">
            {data.imageUrl && (
              <img
                src={fixImageUrl(data.imageUrl)}
                alt={data.storeName ?? ""}
                className="w-14 h-14 rounded-full object-cover border"
              />
            )}
            <div>
            <p className="font-bold uppercase">{data.storeName ?? "-"}</p>
            <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        data.storeAddress ?? ""
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-green-700"
    >{data.storeAddress ?? "-"}    </a>

            </div>
          </div>

          
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white">
        <a href={`tel:${ data.storePhone?? ""}`}>
            <PhoneIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        <hr className="my-3" />

        {/* العميل */}
        <div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
    {/* صورة اليوزر */}
    <img
      src={USER_IMAGE}
      alt="User"
      className="w-14 h-14 rounded-full object-cover border"
    />

    <div>
      <p className="text-sm font-medium">
        ID{data.orderId ? data.orderId.slice(0, 6) : "-"}
      </p>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          data.customerAddress ?? ""
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-green-700"
      >
        {data.customerAddress ?? "-"}
      </a>
    </div>
  </div>

  <a
    href={`tel:${data.customerPhone ?? ""}`}
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
          <p>{data.orderContent ?? "-"}</p>
        </div>
      )}

      {/* ===== المنتجات ===== */}
      {data.type === "items" && data.items?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-3">{data.storeName ?? "-"}</h3>

          {data.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-3"
            >
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <img
                    src={fixImageUrl(item.imageUrl)}
                    alt={item.productName}
                    className="w-14 h-14 rounded-lg object-cover border"
                  />
                )}
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-green-700">{item.price ?? "-"} MRU</p>
                </div>
              </div>

              <div className="w-10 h-10 border rounded-full flex items-center justify-center text-green-700 font-bold">
                {item.qty}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
