import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { BASE_URL, HUB_URL } from "../utils/apiConfig";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

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

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.play().catch(err => {
      console.warn("Audio playback failed. This might be due to browser autoplay policies.", err);
    });
  };

  const notifyNewOrder = (order: Order) => {
    toast.success((t) => (
      <span onClick={() => toast.dismiss(t.id)} className="cursor-pointer">
        <b>📦 طلب جديد من {order.customerPhone}</b>
        <br />
        {order.customerAddress}
      </span>
    ), { duration: 6000, icon: '🔥' });
    playNotificationSound();
  };

  const testSystem = () => {
    playNotificationSound();
    toast.success("نظام التنبيهات والصوت يعمل بنجاح!");
  };

  useEffect(() => {
    // Initial fetch
    fetch(`${BASE_URL}/api/Orders/AllOrders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => {
        console.error("Error fetching orders:", err);
        toast.error("فشل في تحميل الطلبات");
      })
      .finally(() => setLoading(false));

    // SignalR Connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNewOrder", (newOrder: Order) => {
      console.log("New order received:", newOrder);
      setOrders(prev => {
        if (prev.some(o => o.orderId === newOrder.orderId)) return prev;
        return [newOrder, ...prev];
      });
      notifyNewOrder(newOrder);
    });

    connection.start()
      .then(() => {
        console.log("Connected to SignalR Hub");
        toast.success("متصل بنظام التنبيهات اللحظية", { id: 'signalr-conn' });
      })
      .catch(err => {
        console.error("SignalR Connection Error: ", err);
        toast.error("فشل الاتصال بسيرفر التنبيهات", { id: 'signalr-conn' });
      });

    return () => {
      connection.stop();
    };
  }, []);

  const handleAddDelivery = async (orderId: string) => {
    const phone = prompt("ادخل رقم الدليفري");
    if (!phone) return;

    const res = await fetch(
      `${BASE_URL}/api/Orders/UpdateDeliveryPhone/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(phone),
      }
    );

    if (res.ok) {
      toast.success("تم إضافة رقم الدليفري");
      setOrders(prev =>
        prev.map(o =>
          o.orderId === orderId
            ? { ...o, deliveryPhone: phone }
            : o
        )
      );
    } else {
      toast.error("حصل خطأ أثناء إضافة الرقم");
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
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold">جميع الطلبات</h1>
            <div className="flex gap-2 items-center">
              <button
                onClick={testSystem}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
              >
                تجربة الصوت والتنبيه
              </button>
            </div>
          </div>

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
                      <td className="p-3 font-semibold">{order.customerPhone}</td>
                      <td className="p-3">{order.customerAddress}</td>
                      <td className="p-3">{order.storeName || "-"}</td>
                      <td className="p-3">
                        {order.deliveryPhone ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                            {order.deliveryPhone}
                          </span>
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
                                navigator.clipboard.writeText(order.orderLink as string);
                                toast.success("تم نسخ الرابط!");
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
