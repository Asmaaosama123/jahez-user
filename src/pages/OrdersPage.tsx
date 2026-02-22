import React, { useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { BASE_URL, HUB_URL } from "../utils/apiConfig";
import { Link as LinkIcon, Map as MapIcon, X, MapPin } from "lucide-react";
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
    <div className="flex bg-[#f4f7f6] min-h-screen font-sans" dir="rtl">
      {/* Sidebar - Hide if GPS is open to save space as per screenshot */}
      {!isGpsOpen && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        {!isGpsOpen && <Header />}

        <div className={`flex-1 flex overflow-hidden ${!isGpsOpen ? "mt-[77px]" : ""}`}>

          {/* GPS Section - Left side */}
          {isGpsOpen && (
            <div className="flex-[2] flex border-l bg-white overflow-hidden">
              {/* GPS Sidebar */}
              <div className="w-72 bg-[#f8faf9] border-l p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="نقطة البداية"
                      className="w-full p-2 border rounded-md pr-8 text-xs bg-white"
                      value={startPos ? `${startPos[0].toFixed(5)}, ${startPos[1].toFixed(5)}` : ""}
                      readOnly
                    />
                    <MapPin size={14} className="absolute right-2 top-2.5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="نقطة النهاية"
                      className="w-full p-2 border rounded-md pr-8 text-xs bg-white"
                      value={endPos ? `${endPos[0].toFixed(5)}, ${endPos[1].toFixed(5)}` : ""}
                      readOnly
                    />
                    <MapPin size={14} className="absolute right-2 top-2.5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => { setStartPos(null); setEndPos(null); }}
                    className="text-[11px] text-gray-500 hover:text-red-600 transition-colors"
                  >
                    إعادة تعيين النقاط
                  </button>
                </div>

                <div className="mt-4 py-4 border-y border-gray-100 space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">المسافة</div>
                    <div className="text-xl font-bold text-gray-800">{distance} km</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">الإجمالي</div>
                    <div className="text-xl font-bold text-green-600">{totalPrice.toFixed(0)} MRU</div>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1 mr-1">تسعيرة البداية</label>
                    <input
                      type="number"
                      value={startingRate}
                      onChange={(e) => setStartingRate(Number(e.target.value))}
                      className="w-full p-2 border border-blue-100 rounded bg-blue-50/30 text-center font-bold text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1 mr-1">سعر الكيلو</label>
                    <input
                      type="number"
                      value={pricePerKm}
                      onChange={(e) => setPricePerKm(Number(e.target.value))}
                      className="w-full p-2 border border-blue-100 rounded bg-blue-50/30 text-center font-bold text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Map container */}
              <div className="flex-1 relative text-left">
                <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationMarker position={startPos} setPosition={setStartPos} label="نقطة البداية" />
                  <LocationMarker position={endPos} setPosition={setEndPos} label="نقطة النهاية" />
                  {startPos && endPos && (
                    <Polyline positions={[startPos, endPos]} color="#3b82f6" weight={5} opacity={0.7} />
                  )}
                </MapContainer>

                {/* Close Button on Map */}
                <button
                  onClick={() => setIsGpsOpen(false)}
                  className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Orders Table Section - Right side or full width */}
          <div className={`flex-1 flex flex-col min-w-0 bg-white ${isGpsOpen ? "md:max-w-md lg:max-w-lg" : "p-6"}`}>
            <div className={`flex justify-between items-center ${isGpsOpen ? "p-4 border-b" : "mb-6"}`}>
              <h1 className="text-xl font-bold text-gray-800">جميع الطلبات</h1>
              {!isGpsOpen && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsGpsOpen(true)}
                    className="bg-[#2e7d32] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <MapIcon size={18} />
                    فتح الخريطة (GPS)
                  </button>
                  <button
                    onClick={testSystem}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-all shadow-sm"
                  >
                    تجربة التنبيه
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#1b1b1b] text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-medium">المستخدم</th>
                    <th className="p-3 font-medium">الوقت</th>
                    <th className="p-3 font-medium">مندوب التوصيل</th>
                    <th className="p-3 font-medium">الرابط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">جارٍ التحميل...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا توجد طلبات حالياً</td></tr>
                  ) : (
                    orders.map((order, idx) => {
                      const date = new Date(order.createdAt);
                      const timeStr = date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false });
                      const dateStr = date.toLocaleDateString("en-GB");
                      const showDate = idx === 0 || new Date(orders[idx - 1].createdAt).toDateString() !== date.toDateString();

                      return (
                        <React.Fragment key={order.orderId}>
                          {showDate && (
                            <tr className="bg-[#f0f0f0] text-[#555] text-[10px] font-bold uppercase tracking-widest">
                              <td colSpan={4} className="p-1 px-4 text-center">{dateStr}</td>
                            </tr>
                          )}
                          <tr className="hover:bg-green-50/30 transition-colors border-b border-gray-50">
                            <td className="p-3 font-medium text-gray-700">{order.customerPhone}</td>
                            <td className="p-3 text-gray-500 text-xs">{timeStr}</td>
                            <td className="p-3">
                              {order.deliveryPhone ? (
                                <span className="text-green-600 font-medium">{order.deliveryPhone}</span>
                              ) : (
                                <button
                                  onClick={() => handleAddDelivery(order.orderId)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-[10px] hover:bg-green-700 transition-colors"
                                >
                                  ضيف رقم
                                </button>
                              )}
                            </td>
                            <td className="p-3">
                              {order.orderLink && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.orderLink as string);
                                    toast.success("تم نسخ الرابط!");
                                  }}
                                  className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                  title="نسخ الرابط"
                                >
                                  <LinkIcon size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
