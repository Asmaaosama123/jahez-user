import React, { useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { BASE_URL, HUB_URL } from "../utils/apiConfig";
import { Map as MapIcon, X, MapPin, Settings, Edit, Trash2, Check, XCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

// Import Google Font for Map Markers
const NotoKufiFontUrl = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap";
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = NotoKufiFontUrl;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

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

const NOTIFICATION_SOUND_URL = "/notification.mp3";
const notificationAudio = new Audio(NOTIFICATION_SOUND_URL);

interface SavedLocation {
  id: number;
  nameAr: string;
  nameFr: string;
  latitude: number;
  longitude: number;
}

interface Order {
  orderId: string;
  customerPhone: string;
  customerAddress: string;
  storeName: string | null;
  deliveryPhone: string | null;
  orderLink: string | null;
  createdAt: string;
}

interface MapClickHandlerProps {
  startPos: [number, number] | null;
  setStartPos: (pos: [number, number]) => void;
  endPos: [number, number] | null;
  setEndPos: (pos: [number, number]) => void;
}

function MapClickHandler({ startPos, setStartPos, endPos, setEndPos, pendingSavedLocation, handleMapClickForSavedLocation }: MapClickHandlerProps & { pendingSavedLocation: boolean, handleMapClickForSavedLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (pendingSavedLocation) {
        handleMapClickForSavedLocation(e.latlng.lat, e.latlng.lng);
        return;
      }
      if (!startPos) {
        setStartPos([e.latlng.lat, e.latlng.lng]);
      } else if (!endPos) {
        setEndPos([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function LocationMarker({ position, label }: { position: [number, number] | null, label: string }) {
  if (!position) return null;

  const customHtmlIcon = L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative flex flex-col items-center pointer-events-auto">
        <div className="text-white text-[12px] font-bold mb-0.5 tracking-wide text-center leading-tight whitespace-nowrap" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif", textShadow: '0px 0px 4px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,0.9)' }}>
          {label}
        </div>
        <div className="w-5 h-5 rounded-full bg-[#202124] border-[1.5px] border-blue-500 shadow-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    ),
    className: "custom-div-icon bg-transparent border-none",
    iconSize: [120, 50],
    iconAnchor: [60, 40],
  });

  return (
    <Marker position={position} icon={customHtmlIcon} />
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // GPS State
  const [isGpsOpen, setIsGpsOpen] = useState(false);
  const [startPos, setStartPos] = useState<[number, number] | null>(null);
  const [endPos, setEndPos] = useState<[number, number] | null>(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [startingRate, setStartingRate] = useState<number>(100);
  const [pricePerKm, setPricePerKm] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  // Saved Locations State
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isAddingSavedLocation, setIsAddingSavedLocation] = useState(false);
  const [newLocationNameAr, setNewLocationNameAr] = useState("");
  const [newLocationNameFr, setNewLocationNameFr] = useState("");
  const [newLocationCoords, setNewLocationCoords] = useState<[number, number] | null>(null);

  const fetchSavedLocations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/SavedLocations`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedLocations(data);
      }
    } catch (err) {
      console.error("Error fetching saved locations:", err);
    }
  }, []);

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

  useEffect(() => {
    if (isGpsOpen) {
      fetchSavedLocations();
    }
  }, [isGpsOpen, fetchSavedLocations]);

  const totalPrice = distance > 4 ? startingRate + ((distance - 4) * pricePerKm) : (distance > 0 ? 100 : 0);

  const fetchSuggestions = async (query: string, setSuggestions: (s: any[]) => void) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    // Filter only from saved locations
    const filtered = savedLocations.filter(loc =>
      loc.nameAr.toLowerCase().includes(query.toLowerCase()) ||
      loc.nameFr.toLowerCase().includes(query.toLowerCase())
    ).map(loc => ({
      display_name: loc.nameAr,
      lat: loc.latitude,
      lon: loc.longitude
    }));

    setSuggestions(filtered);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameFr, setEditNameFr] = useState("");
  const [deletingLocationId, setDeletingLocationId] = useState<number | null>(null);

  // Settings Modal Add Location State
  const [isAddingInSettings, setIsAddingInSettings] = useState(false);
  const [settingsLocationAr, setSettingsLocationAr] = useState("");
  const [settingsLocationFr, setSettingsLocationFr] = useState("");
  const [settingsLat, setSettingsLat] = useState("");
  const [settingsLng, setSettingsLng] = useState("");

  const handleManualCoord = (val: string, setPos: (p: [number, number]) => void) => {
    const coords = val.split(",").map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setPos([coords[0], coords[1]]);
    }
  };

  const playNotificationSound = useCallback(() => {
    notificationAudio.currentTime = 0;
    notificationAudio.play()
      .then(() => {
        // Stop after 2 seconds as requested by the user
        setTimeout(() => {
          notificationAudio.pause();
          notificationAudio.currentTime = 0;
        }, 2000);
      })
      .catch(err => {
        console.warn("Audio playback failed. This might be due to browser autoplay policies.", err);
      });
  }, []);

  const notifyNewOrder = useCallback((order: Order) => {
    toast.success((t) => (
      <span onClick={() => toast.dismiss(t.id)} className="cursor-pointer">
        <b>📦 طلب جديد من {order.customerPhone}</b>
        <br />
        {order.customerAddress}
      </span>
    ), { duration: 6000, icon: '🔥' });
    playNotificationSound();
  }, [playNotificationSound]);

  const testSystem = () => {
    playNotificationSound();
    toast.success("نظام التنبيهات والصوت يعمل بنجاح!");
  };

  const handleSaveLocation = async () => {
    if (!newLocationNameAr.trim() || !newLocationNameFr.trim() || !newLocationCoords) {
      toast.error("يرجى ملء جميع الحقول وتحديد الموقع على الخريطة أولاً");
      return;
    }
    const locationData = {
      nameAr: newLocationNameAr,
      nameFr: newLocationNameFr,
      latitude: newLocationCoords[0],
      longitude: newLocationCoords[1]
    };

    try {
      const res = await fetch(`${BASE_URL}/api/SavedLocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      if (res.ok) {
        toast.success("تم حفظ الموقع بنجاح");
        fetchSavedLocations();
        setIsAddingSavedLocation(false);
        setNewLocationNameAr("");
        setNewLocationNameFr("");
        setNewLocationCoords(null);
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (err) {
      console.error(err);
      toast.error("مشكلة في الاتصال بالخادم");
    }
  };

  const handleSaveSettingsLocation = async () => {
    if (!settingsLocationAr.trim() || !settingsLocationFr.trim() || !settingsLat || !settingsLng) {
      toast.error("يرجى ملء جميع الحقول", { id: 'save-settings-loc' });
      return;
    }
    const lat = parseFloat(settingsLat);
    const lng = parseFloat(settingsLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("الإحداثيات غير صحيحة", { id: 'save-settings-loc' });
      return;
    }

    const locationData = {
      nameAr: settingsLocationAr,
      nameFr: settingsLocationFr,
      latitude: lat,
      longitude: lng
    };

    try {
      const res = await fetch(`${BASE_URL}/api/SavedLocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      if (res.ok) {
        toast.success("تم الحفظ بنجاح");
        fetchSavedLocations();
        setIsAddingInSettings(false);
        setSettingsLocationAr("");
        setSettingsLocationFr("");
        setSettingsLat("");
        setSettingsLng("");
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (err) {
      console.error(err);
      toast.error("مشكلة في الاتصال بالخادم");
    }
  };

  const handleDeleteSavedLocation = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/SavedLocations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم الحذف بنجاح");
        fetchSavedLocations();
        setDeletingLocationId(null);
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ في الاتصال");
    }
  };

  const handleUpdateSavedLocation = async (loc: SavedLocation) => {
    if (!editNameAr.trim() || !editNameFr.trim()) {
      toast.error("يرجى ملء الأسماء بالعربي والفرنسي");
      return;
    }
    const updatedLoc = { ...loc, nameAr: editNameAr, nameFr: editNameFr };
    try {
      const res = await fetch(`${BASE_URL}/api/SavedLocations/${loc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLoc)
      });
      if (res.ok) {
        toast.success("تم التعديل بنجاح");
        setEditingLocationId(null);
        fetchSavedLocations();
      } else {
        toast.error("فشل في التعديل");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleSavedLocationClick = (loc: SavedLocation) => {
    if (!startPos) {
      setStartPos([loc.latitude, loc.longitude]);
      setStartInput(loc.nameAr);
    } else if (!endPos) {
      setEndPos([loc.latitude, loc.longitude]);
      setEndInput(loc.nameAr);
    } else {
      toast.error("لقد قمت باختيار نقطتي البداية والنهاية بالفعل.");
    }
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
      .withUrl(HUB_URL, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .configureLogging(signalR.LogLevel.Information)
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

    let isStopped = false;
    const startConnection = async () => {
      try {
        await connection.start();
        if (isStopped) {
          await connection.stop();
          return;
        }
        console.log("Connected to SignalR Hub");
        toast.success("متصل بنظام التنبيهات اللحظية", { id: 'signalr-conn' });
      } catch (err) {
        if (!isStopped) {
          console.error("SignalR Connection Error: ", err);
          toast.error("فشل الاتصال بسيرفر التنبيهات", { id: 'signalr-conn' });
        }
      }
    };

    startConnection();

    return () => {
      isStopped = true;
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
      <style>{`
        .dark-map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(100%) contrast(90%);
        }
      `}</style>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 mt-[77px]">
        <Header />

        <div className="p-6 relative">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold">جميع الطلبات</h1>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-[#1b1b1b] text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition flex items-center gap-1 shadow-sm border border-gray-700"
              >
                <Settings size={16} />
                المواقع المحفوظة
              </button>
              <button
                onClick={() => setIsGpsOpen(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center gap-1 shadow-sm"
              >
                <MapIcon size={16} />
                فتح الخريطة (GPS)
              </button>
              <button
                onClick={testSystem}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition shadow-sm"
              >
                تجربة الصوت والتنبيه
              </button>
            </div>
          </div>

          {/* Settings Modal */}
          {isSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Settings size={20} />
                    إعدادات المواقع المحفوظة
                  </h2>
                  <div className="flex gap-4 items-center">
                    <button onClick={() => setIsAddingInSettings(!isAddingInSettings)} className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition shadow-sm font-bold">
                      {isAddingInSettings ? "إلغاء الإضافة" : "+ إضافة موقع بإحداثيات"}
                    </button>
                    <button onClick={() => setIsSettingsOpen(false)} className="hover:text-gray-300">
                      <X size={24} />
                    </button>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                  {isAddingInSettings && (
                    <div className="p-4 bg-gray-50 border rounded-lg shadow-inner">
                      <h3 className="text-sm font-bold mb-3 text-gray-800">إضافة موقع يدوياً (بالإحداثيات)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-3">
                        <input type="text" placeholder="الاسم بالعربي" value={settingsLocationAr} onChange={e => setSettingsLocationAr(e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="الاسم بالفرنسي" value={settingsLocationFr} onChange={e => setSettingsLocationFr(e.target.value)} className="p-2 border rounded" />
                        <input type="number" placeholder="Latitude (خط العرض)" value={settingsLat} onChange={e => setSettingsLat(e.target.value)} className="p-2 border rounded text-left dir-ltr font-mono" />
                        <input type="number" placeholder="Longitude (خط الطول)" value={settingsLng} onChange={e => setSettingsLng(e.target.value)} className="p-2 border rounded text-left dir-ltr font-mono" />
                      </div>
                      <button onClick={handleSaveSettingsLocation} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 font-bold transition">حفظ الموقع</button>
                    </div>
                  )}
                  <div className="border rounded-lg overflow-hidden flex-1">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3 rounded-tr">الاسم بالعربي</th>
                          <th className="p-3">الاسم بالفرنسي</th>
                          <th className="p-3">الإحداثيات</th>
                          <th className="p-3 rounded-tl text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {savedLocations.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-500">لا توجد مواقع محفوظة</td>
                          </tr>
                        ) : (
                          savedLocations.map(loc => (
                            <tr key={loc.id} className="hover:bg-gray-50">
                              <td className="p-3 font-semibold">
                                {editingLocationId === loc.id ? (
                                  <input type="text" value={editNameAr} onChange={(e) => setEditNameAr(e.target.value)} className="border p-1 rounded w-full text-xs" />
                                ) : loc.nameAr}
                              </td>
                              <td className="p-3">
                                {editingLocationId === loc.id ? (
                                  <input type="text" value={editNameFr} onChange={(e) => setEditNameFr(e.target.value)} className="border p-1 rounded w-full text-xs" />
                                ) : loc.nameFr}
                              </td>
                              <td className="p-3 text-xs text-blue-600 dir-ltr text-right">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</td>
                              <td className="p-3 flex justify-center gap-2 items-center">
                                {/* Action Buttons */}
                                {editingLocationId === loc.id ? (
                                  <>
                                    <button onClick={() => handleUpdateSavedLocation(loc)} className="text-green-600 hover:text-green-800 p-1" title="حفظ">
                                      <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingLocationId(null)} className="text-gray-500 hover:text-gray-700 p-1" title="إلغاء">
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                ) : deletingLocationId === loc.id ? (
                                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                                    <span className="text-xs text-red-600 mr-1">تأكيد؟</span>
                                    <button onClick={() => handleDeleteSavedLocation(loc.id)} className="text-red-600 font-bold hover:text-red-800 text-xs px-1">نعم</button>
                                    <button onClick={() => setDeletingLocationId(null)} className="text-gray-500 hover:text-gray-800 text-xs px-1">لا</button>
                                  </div>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingLocationId(loc.id); setEditNameAr(loc.nameAr); setEditNameFr(loc.nameFr); }} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded" title="تعديل">
                                      <Edit size={16} />
                                    </button>
                                    <button onClick={() => setDeletingLocationId(loc.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded" title="حذف">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GPS Modal */}
          {isGpsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapIcon size={20} />
                    حساب المسافة والسعر (GPS)
                  </h2>
                  <button onClick={() => setIsGpsOpen(false)} className="hover:text-gray-300">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                  {/* GPS Sidebar - Left Side inside Modal */}
                  <div className="w-full md:w-80 bg-[#f8faf9] p-4 border-l flex flex-col gap-3 overflow-y-auto order-1 md:order-1">
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-[11px] text-gray-500 mb-1 mr-1">نقطة البداية</label>
                        <input
                          type="text"
                          className="w-full p-1.5 border rounded-md text-xs bg-white pr-8"
                          placeholder="ابحث عن مكان أو أدخل إحداثيات..."
                          value={startInput || (startPos ? `${startPos[0].toFixed(5)}, ${startPos[1].toFixed(5)}` : "")}
                          onChange={(e) => {
                            setStartInput(e.target.value);
                            fetchSuggestions(e.target.value, setStartSuggestions);
                            handleManualCoord(e.target.value, setStartPos);
                          }}
                        />
                        <MapPin size={14} className="absolute right-2 top-8 text-red-500" />
                        {startSuggestions.length > 0 && (
                          <div className="absolute z-50 bg-white border rounded shadow-md mt-1 w-full text-xs">
                            {startSuggestions.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                                onClick={() => {
                                  setStartPos([parseFloat(s.lat), parseFloat(s.lon)]);
                                  setStartInput(s.display_name);
                                  setStartSuggestions([]);
                                }}
                              >
                                {s.display_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-[11px] text-gray-500 mb-1 mr-1">نقطة النهاية</label>
                        <input
                          type="text"
                          className="w-full p-1.5 border rounded-md text-xs bg-white pr-8"
                          placeholder="ابحث عن مكان أو أدخل إحداثيات..."
                          value={endInput || (endPos ? `${endPos[0].toFixed(5)}, ${endPos[1].toFixed(5)}` : "")}
                          onChange={(e) => {
                            setEndInput(e.target.value);
                            fetchSuggestions(e.target.value, setEndSuggestions);
                            handleManualCoord(e.target.value, setEndPos);
                          }}
                        />
                        <MapPin size={14} className="absolute right-2 top-8 text-blue-500" />
                        {endSuggestions.length > 0 && (
                          <div className="absolute z-50 bg-white border rounded shadow-md mt-1 w-full text-xs">
                            {endSuggestions.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                                onClick={() => {
                                  setEndPos([parseFloat(s.lat), parseFloat(s.lon)]);
                                  setEndInput(s.display_name);
                                  setEndSuggestions([]);
                                }}
                              >
                                {s.display_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setStartPos(null); setEndPos(null); setStartInput(""); setEndInput(""); }}
                        className="text-xs text-blue-600 hover:text-red-500 transition-colors"
                      >
                        إعادة تعيين النقاط
                      </button>
                    </div>

                    <div className="mt-2 py-3 border-y border-gray-100 flex gap-2">
                      <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex-1">
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">المسافة</div>
                        <div className="text-sm font-bold text-gray-800">{distance} km</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex-1">
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">الإجمالي</div>
                        <div className="text-sm font-bold text-green-700">{totalPrice.toFixed(0)} MRU</div>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 mb-1 mr-1">بداية</label>
                        <input
                          type="number"
                          value={startingRate}
                          onChange={(e) => setStartingRate(Number(e.target.value))}
                          className="w-full p-1 text-xs border border-blue-50 bg-blue-50/20 rounded text-center font-bold text-gray-800"
                          disabled={distance > 0 && distance <= 4}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 mb-1 mr-1">ك/متر</label>
                        <input
                          type="number"
                          value={pricePerKm}
                          onChange={(e) => setPricePerKm(Number(e.target.value))}
                          className="w-full p-1 text-xs border border-blue-50 bg-blue-50/20 rounded text-center font-bold text-gray-800"
                          disabled={distance > 0 && distance <= 4}
                        />
                      </div>
                    </div>

                    {/* المحفوظات */}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex-1 overflow-y-auto min-h-[100px]">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[12px] font-bold text-gray-800">إضافة موقع محفوظ جديد</label>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200 mb-3 space-y-2 text-xs">
                        <input
                          type="text"
                          placeholder="الاسم بالعربي"
                          value={newLocationNameAr}
                          onChange={(e) => setNewLocationNameAr(e.target.value)}
                          className="w-full p-1.5 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="الاسم بالفرنسي"
                          value={newLocationNameFr}
                          onChange={(e) => setNewLocationNameFr(e.target.value)}
                          className="w-full p-1.5 border rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            className={`p-1.5 text-center rounded border ${isAddingSavedLocation || newLocationCoords ? 'border-green-500' : 'border-blue-500'} ${newLocationCoords ? "bg-green-100 text-green-700" : isAddingSavedLocation ? "bg-yellow-100 text-yellow-700 border-yellow-500" : "text-blue-600 hover:bg-blue-50"}`}
                            onClick={() => {
                              setIsAddingSavedLocation(true);
                              setNewLocationCoords(null);
                              toast("اضغط على الخريطة لتحديد الموقع الجديد", { icon: "🗺️" });
                            }}
                          >
                            {newLocationCoords ? `تم التحديد ✅` : (isAddingSavedLocation ? "اضغط على الخريطة الآن..." : "حدد الموقع من الخريطة")}
                          </button>
                        </div>
                        <button
                          onClick={handleSaveLocation}
                          className="w-full p-1.5 bg-green-700 text-white rounded font-bold hover:bg-green-800 disabled:opacity-50"
                          disabled={!newLocationCoords}
                        >
                          حفظ الموقع
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Map Area - Right Side inside Modal */}
                  <div className="flex-1 relative text-left order-2 md:order-2">
                    <MapContainer
                      center={[18.0735, -15.9582]}
                      zoom={12}
                      maxBounds={[[17.9, -16.2], [18.2, -15.7]]}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="dark-map-tiles"
                      />
                      <MapClickHandler
                        startPos={startPos}
                        setStartPos={setStartPos}
                        endPos={endPos}
                        setEndPos={setEndPos}
                        pendingSavedLocation={isAddingSavedLocation}
                        handleMapClickForSavedLocation={(lat, lng) => {
                          setNewLocationCoords([lat, lng]);
                          setIsAddingSavedLocation(false);
                        }}
                      />
                      <LocationMarker position={startPos} label="نقطة البداية" />
                      <LocationMarker position={endPos} label="نقطة النهاية" />
                      {newLocationCoords && <LocationMarker position={newLocationCoords} label="موقع جديد" />}
                      {savedLocations.map(loc => {
                        const markerHtmlIcon = L.divIcon({
                          html: renderToStaticMarkup(
                            <div className="relative flex flex-col items-center cursor-pointer pointer-events-auto group mt-2">
                              <div className="text-[#e8eaed] text-[12.5px] font-bold mb-0.5 tracking-wide text-center leading-tight whitespace-nowrap transition-transform opacity-90 group-hover:opacity-100" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif", textShadow: '0px 0px 4px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,0.9)' }}>
                                {loc.nameAr}
                              </div>
                              <div className="w-5 h-5 rounded-full bg-[#1b1b1e] border-[1.5px] border-[#ea4335] shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 opacity-90 group-hover:opacity-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] flex items-center justify-center">
                                  <div className="w-1 h-1 rounded-full bg-white"></div>
                                </div>
                              </div>
                            </div>
                          ),
                          className: "custom-div-icon bg-transparent border-none",
                          iconSize: [140, 60],
                          iconAnchor: [70, 50], // adjust anchor points accordingly
                        });
                        return (
                          <Marker
                            key={loc.id}
                            position={[loc.latitude, loc.longitude]}
                            icon={markerHtmlIcon}
                            eventHandlers={{
                              click: () => handleSavedLocationClick(loc)
                            }}
                          />
                        );
                      })}
                      {startPos && endPos && (
                        <Polyline positions={[startPos, endPos]} color="#2563eb" weight={5} opacity={0.6} />
                      )}
                    </MapContainer>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded shadow text-[10px] font-bold z-[1000] pointer-events-none">
                      اضغط على الخريطة لتحديد النقاط
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Orders Table - FULLY ORIGINAL DESIGN */}
          <table className="w-full bg-white shadow rounded overflow-hidden">
            <thead className="bg-[#1b1b1b] text-white text-sm">
              <tr>
                <th className="p-3">هاتف العميل</th>
                <th className="p-3">عنوان المستلم</th>
                <th className="p-3">عنوان الالتقاط</th>
                <th className="p-3">مندوب التوصيل</th>
                <th className="p-3">رابط الطلب</th>
                <th className="p-3">التاريخ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    جارٍ التحميل...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr
                    key={order.orderId}
                    className="text-center hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-semibold text-blue-900">{order.customerPhone}</td>
                    <td className="p-3">{order.customerAddress}</td>
                    <td className="p-3">{order.storeName || "-"}</td>
                    <td className="p-3">
                      {order.deliveryPhone ? (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm font-medium">
                          {order.deliveryPhone}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddDelivery(order.orderId)}
                          className="bg-green-700 text-white px-4 py-1 rounded text-sm hover:bg-green-800"
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
                            className="text-gray-400 hover:text-gray-800"
                            title="انسخ الرابط"
                          >
                            📋
                          </button>
                        )}
                      </span>
                      <span className="text-gray-500">
                        {order.orderLink
                          ? order.orderLink.length > 10
                            ? order.orderLink.slice(0, 40) + "..."
                            : order.orderLink
                          : "-"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-US")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
