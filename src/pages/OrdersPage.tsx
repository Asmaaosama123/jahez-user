import React, { useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { BASE_URL, HUB_URL } from "../utils/apiConfig";
import { Map as MapIcon, X, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Leaflet icon fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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

function LocationMarker({ position, setPosition, label }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void, label: string }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <div className="bg-white p-1 rounded shadow-md border border-gray-300 text-[10px] absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
        {label}
      </div>
    </Marker>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // GPS State
  const [isGpsOpen, setIsGpsOpen] = useState(false);
  const [startPos, setStartPos] = useState<[number, number] | null>(null);
  const [endPos, setEndPos] = useState<[number, number] | null>(null);
  const [startingRate, setStartingRate] = useState<number>(0);
  const [pricePerKm, setPricePerKm] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  const calculateDistance = useCallback(() => {
    if (startPos && endPos) {
      const from = L.latLng(startPos[0], startPos[1]);
      const to = L.latLng(endPos[0], endPos[1]);
      const d = from.distanceTo(to) / 1000; // in km
      setDistance(Number(d.toFixed(2)));
    } else {
      setDistance(0);
    }
  }, [startPos, endPos]);

  useEffect(() => {
    calculateDistance();
  }, [calculateDistance]);

  const totalPrice = startingRate + (distance * pricePerKm);

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
  }, [notifyNewOrder]);

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

        <div className="p-6 relative">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold">جميع الطلبات</h1>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setIsGpsOpen(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center gap-1"
              >
                <MapIcon size={16} />
                فتح الخريطة (GPS)
              </button>
              <button
                onClick={testSystem}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
              >
                تجربة الصوت والتنبيه
              </button>
            </div>
          </div>

          {/* GPS Panel */}
          {isGpsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapIcon size={20} />
                    حساب المسافة والسعر (GPS)
                  </h2>
                  <button onClick={() => setIsGpsOpen(false)} className="hover:text-gray-300">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  {/* Map Side */}
                  <div className="flex-1 h-[40vh] md:h-full relative">
                    <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker position={startPos} setPosition={setStartPos} label="نقطة البداية" />
                      <LocationMarker position={endPos} setPosition={setEndPos} label="نقطة النهاية" />
                      {startPos && endPos && (
                        <Polyline positions={[startPos, endPos]} color="blue" />
                      )}
                    </MapContainer>
                    <div className="absolute top-2 right-2 bg-white p-2 rounded shadow text-xs z-[1000] pointer-events-none">
                      اضغط على الخريطة لتحديد النقاط
                    </div>
                  </div>

                  {/* Controls Side */}
                  <div className="w-full md:w-80 bg-gray-50 p-4 border-r overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">بداية العداد (Starting Rate)</label>
                        <input
                          type="number"
                          value={startingRate}
                          onChange={(e) => setStartingRate(Number(e.target.value))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سعر الكيلو (Price per KM)</label>
                        <input
                          type="number"
                          value={pricePerKm}
                          onChange={(e) => setPricePerKm(Number(e.target.value))}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-1">
                          <span>المسافة (Distance):</span>
                          <span className="font-bold">{distance} كم</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>سعر الكيلو:</span>
                          <span className="font-bold">{pricePerKm}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600 mt-2 pt-2 border-t">
                          <span>السعر الإجمالي:</span>
                          <span>{totalPrice.toFixed(2)} جنيه</span>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <div className="text-xs text-gray-500">
                          <p>نقطة البداية: {startPos ? `${startPos[0].toFixed(4)}, ${startPos[1].toFixed(4)}` : "غير محددة"}</p>
                          <p>نقطة النهاية: {endPos ? `${endPos[0].toFixed(4)}, ${endPos[1].toFixed(4)}` : "غير محددة"}</p>
                        </div>
                        <button
                          onClick={() => { setStartPos(null); setEndPos(null); }}
                          className="w-full bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300"
                        >
                          إعادة تعيين النقاط
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                        </span>
                        <span>
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
