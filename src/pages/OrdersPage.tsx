import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const BASE = "https://deliver-web-app2.runasp.net";

interface Order {
  orderId: string;
  customerPhone: string;
  customerAddress: string;
  storeName: string | null;
  deliveryPhone: string | null;
  orderLink: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/Orders/AllOrders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddDelivery = async (orderId: string) => {
    const phone = prompt("ادخل رقم الدليفري");
    if (!phone) return;
  
    const res = await fetch(
      `${BASE}/api/Orders/UpdateDeliveryPhone/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(phone), // ✅ String مش Object
      }
    );
  
    if (res.ok) {
      setOrders(prev =>
        prev.map(o =>
          o.orderId === orderId
            ? { ...o, deliveryPhone: phone }
            : o
        )
      );
    } else {
      alert("حصل خطأ أثناء إضافة الرقم");
    }
  };
  

  return (
    <div className="flex bg-gray-100 min-h-screen" dir="rtl">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 mt-[77px]">
        <Header />

        <div className="p-6">
          <h1 className="text-xl font-bold mb-5">جميع الطلبات</h1>

          {loading ? (
            <div className="text-center text-gray-500">جارٍ التحميل...</div>
          ) : (
            <table className="w-full bg-white shadow rounded overflow-hidden">
              <thead className="bg-black text-white text-sm">
                <tr>
                <th className="p-3">هاتف العميل</th>
                <th className="p-3">عنوان المستلم</th>
                <th className="p-3">عنوان الالتقاط</th>
                <th className="p-3">مندوب التوصيل</th>
                  <th className="p-3">رابط الطلب</th>
                  <th className="p-3">التاريخ</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      لا توجد طلبات
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr
                      key={order.orderId}
                      className="text-center border-b hover:bg-gray-100"
                    >
                                              <td className="p-3">{order.customerPhone}</td>
                                              <td className="p-3">{order.customerAddress}</td>
                                              <td className="p-3">{order.storeName || "-"}</td>
                                              <td className="p-3">
                        {order.deliveryPhone ? (
                          order.deliveryPhone
                        ) : (
                          <button
                            onClick={() =>
                              handleAddDelivery(order.orderId)
                            }
                            className="bg-green-800 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                          >
                            ضيف رقم
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-xs break-all flex items-center justify-center gap-2">
  <span>
  {order.orderLink && (
    <button
      onClick={() => {
        navigator.clipboard.writeText(order.orderLink);
        alert("تم نسخ الرابط!");
      }}
      className="text-gray-500 hover:text-gray-800"
      title="انسخ الرابط"
    >
      📋
    </button>
  )}
    {order.orderLink
      ? order.orderLink.length > 10
        ? order.orderLink.slice(0, 40) + "..."
        : order.orderLink
      : "-"}
  </span>
 
</td>


                      

                      <td className="p-3 text-sm">
                        {new Date(order.createdAt).toLocaleString("ar-EG")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
