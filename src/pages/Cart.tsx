import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { IoArrowForward } from "react-icons/io5";
import { useLang } from "../context/LanguageContext";
import { BASE_URL } from "../utils/apiConfig";

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLang();
  const { cart, updateCart, clearCart } = useCart();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [manualRequest, setManualRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Geolocation states
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const manualOrder = location.state?.manualOrder || false;
  const storeInfo = location.state?.storeInfo || null;

  // مسح الكارت لو manualOrder
  useEffect(() => {
    if (manualOrder) clearCart();
  }, [manualOrder, clearCart]);

  // دوال زيادة/نقص الكمية
  const increaseQty = useCallback(
    (storeId, id) => {
      const items = cart[storeId]?.items || [];
      updateCart(
        storeId,
        items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
      );
    },
    [cart, updateCart]
  );

  const decreaseQty = useCallback(
    (storeId, id) => {
      const items = cart[storeId]?.items || [];
      updateCart(
        storeId,
        items
          .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0)
      );
    },
    [cart, updateCart]
  );



  // حساب السعر الكلي
  const totalPrice = Object.values(cart)
    .flatMap((store) => store?.items || [])
    .reduce((acc, item) => acc + item.price * item.qty, 0);

  // فلتر الكارت
  const filteredCart = Object.fromEntries(
    Object.entries(cart).filter(([_, storeData]) => (storeData?.items?.length || 0) > 0)
  );

  // Geolocation and Dynamic Pricing Calculations
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert(
        language === "ar"
          ? "تحديد الموقع الجغرافي غير مدعوم في متصفحك."
          : "Geolocation is not supported by your browser."
      );
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLat(userLat);
        setLng(userLng);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&accept-language=${language}`
          );
          if (response.ok) {
            const data = await response.json();
            const displayName =
              data.display_name ||
              (language === "ar" ? "موقعي الحالي" : "My Current Location");
            setAddress(displayName);
          } else {
            setAddress(
              language === "ar"
                ? "موقعي الحالي (تم تحديده بالخريطة)"
                : "My Current Location (Map Determined)"
            );
          }
        } catch (error) {
          setAddress(
            language === "ar"
              ? "موقعي الحالي (تم تحديده بالخريطة)"
              : "My Current Location (Map Determined)"
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        alert(
          language === "ar"
            ? "تعذر جلب موقعك. يرجى كتابة العنوان يدوياً."
            : "Could not retrieve location. Please enter address manually."
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const calculateDeliveryFee = () => {
    if (manualOrder) {
      const storeLatitude = storeInfo?.latitude;
      const storeLongitude = storeInfo?.longitude;
      const defaultFee = storeInfo?.deliveryFee ?? 100;

      if (
        lat !== null &&
        lng !== null &&
        storeLatitude !== undefined &&
        storeLongitude !== undefined &&
        storeLatitude !== null &&
        storeLongitude !== null
      ) {
        const dist = getDistance(lat, lng, storeLatitude, storeLongitude);
        return dist > 4 ? 100 + Math.round((dist - 4) * 10) : 100;
      }
      return defaultFee;
    } else {
      const [_, storeData] = Object.entries(filteredCart)[0] || [null, null];
      if (!storeData) return 0;
      const storeLatitude = storeData.storeLatitude;
      const storeLongitude = storeData.storeLongitude;
      const defaultFee = storeData.deliveryFee ?? 100;

      if (
        lat !== null &&
        lng !== null &&
        storeLatitude !== undefined &&
        storeLongitude !== undefined &&
        storeLatitude !== null &&
        storeLongitude !== null
      ) {
        const dist = getDistance(lat, lng, storeLatitude, storeLongitude);
        return dist > 4 ? 100 + Math.round((dist - 4) * 10) : 100;
      }
      return defaultFee;
    }
  };

  const deliveryFee = calculateDeliveryFee();
  const serviceFee = Math.min(totalPrice * 0.03, 20);
  const grandTotal = totalPrice + deliveryFee + serviceFee;

  const getProductName = (item) =>
    language === "ar" ? item.nameAr || item.name || "" : item.nameFr || item.name || "";

  // إرسال الطلب
  const handleSendOrder = async () => {
    setLoading(true);
    try {
      let orderPayload = {
        customerPhone: phone,
        customerAddress: address,
        customerLat: lat,
        customerLong: lng,
        storeId: 0,
        orderContent: "",
        items: [],
      };

      if (manualOrder) {
        orderPayload.storeId = storeInfo?.id;
        orderPayload.orderContent = manualRequest;
      } else {
        const [storeId, storeData] = Object.entries(filteredCart)[0];
        orderPayload.storeId = storeId;
        orderPayload.items = storeData.items.map((item) => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
        }));
      }

      const res = await fetch(`${BASE_URL}/api/Orders/CreateOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error("فشل إنشاء الطلب");

      const data = await res.json();
      navigate("/order-success");
    } catch (err) {
      setErrorMessage(language === "ar" ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // تعديل Bottom Bar عند ظهور الكيبورد
  // تعديل Bottom Bar عند ظهور الكيبورد
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const isOpen = window.innerHeight - window.visualViewport.height > 150;
      setKeyboardOpen(isOpen);
    };

    window.visualViewport.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }, []);



  return (
    <div className="overflow-y-auto pb-[200px] bg-gray-100 min-h-screen font-sans" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow relative">
        <button
          className={`absolute top-4 ${language === "ar" ? "right-2" : "left-2"} bg-black/40 p-2 rounded-full`}
          onClick={() => navigate(-1)}
        >
          <IoArrowForward className={`text-white text-xl ${language === "fr" ? "rotate-180" : ""}`} />
        </button>
        <h1 className="text-xl font-bold text-black m-auto">
          <span className="text-black font-bold text-2xl">{t.Orderdetails}</span>
        </h1>
      </div>

      {/* Cart / Manual Order */}
      {manualOrder ? (
        <div className="bg-white p-3 mb-3 mt-5 mx-3 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <img src={storeInfo?.profileImageUrl} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h2 className="text-xl font-bold">{storeInfo?.name}</h2>
              {storeInfo?.StoreaddressSecondary && (
                <p className="text-sm text-green-700">{storeInfo.StoreaddressSecondary}</p>
              )}
            </div>
          </div>
          <textarea
            className="w-full p-3 border rounded-lg mb-4 text-base"
            rows={6}
            placeholder={t.Pleaseenteryourdetailshere}
            value={manualRequest}
            onChange={(e) => setManualRequest(e.target.value)}
          />
        </div>
      ) : (
        Object.entries(filteredCart).map(([storeId, storeData]) => (
          <div key={storeId} className="bg-white p-3 mb-3 mt-5 mx-3 rounded-xl">
            <div className="flex items-center mb-3 gap-2">
              <img src={storeData.storeImage} alt={storeData.storeName} className="w-16 h-16 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{storeData.storeName}</h2>
                {storeData.StoreaddressSecondary && (
                  <p className="text-sm text-green-700 truncate">{storeData.StoreaddressSecondary}</p>
                )}
              </div>
              <div className="shrink-0 ml-2 mr-2">
                <span className="text-white text-sm sm:text-base bg-green-700 px-4 py-2 rounded font-bold whitespace-nowrap">
                  {totalPrice} MRU
                </span>
              </div>
            </div>
            <hr className="border-t border-black my-4" />
            {(storeData.items || []).map((item) => (
              <div key={item.id} className="flex items-center border rounded-xl p-2 mb-2">
                <img src={item.imageUrl || ""} className="w-12 h-12 rounded-xl border-2 border-green-500 shrink-0" alt={getProductName(item)} />
                <div className={`${language === "fr" ? "ml-2" : "mr-2"} shadow-sm bg-white min-w-0`}>
                  <p className="font-bold text-sm truncate">{getProductName(item)}</p>
                  <p className="text-green-700 text-xs">{item.price} MRU</p>
                </div>
                <div className={`flex items-center gap-1 ${language === "fr" ? "ml-auto" : "mr-auto"} text-green-700 font-bold`}>
                  <button onClick={() => increaseQty(storeId, item.id)} className="border px-2 py-1 rounded border-green-600">+</button>
                  <div className="border px-2 py-1 rounded text-sm min-w-[32px] text-center">{item.qty}</div>
                  <button onClick={() => decreaseQty(storeId, item.id)} className="border px-2 py-1 rounded border-green-600">-</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Bottom Bar */}

      <div
        id="bottomBar"
        className={`
    fixed left-0 right-0
    bg-white p-3 border-t shadow-lg z-50
    transition-all duration-300 ease-in-out
    ${keyboardOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}
  `}
      >

        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setShowFormModal(true);
              setLoading(false);
            }, 300);
          }}
          className="w-full bg-green-700 text-white py-3 text-base font-bold rounded-lg flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
              <svg className="animate-spin h-5 w-5 ml-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </>
          ) : language === "ar" ? "تأكيد الطلب" : "Confirm Order"}
        </button>
      </div>


      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-5 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{language === "ar" ? "معلومات التوصيل" : "Delivery Information"}</h2>
            
            <div className="relative mb-3">
              <input
                className={`w-full border p-3 rounded-lg text-base ${language === "ar" ? "pl-12 pr-4 text-right" : "pr-12 pl-4 text-left"}`}
                placeholder={t.addressPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                type="button"
                onClick={handleLocateUser}
                disabled={isLocating}
                className={`absolute ${language === "ar" ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 p-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 transition`}
                title={language === "ar" ? "تحديد موقعي تلقائياً" : "Locate current position"}
              >
                {isLocating ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <span>📍</span>
                )}
              </button>
            </div>

            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`w-full border p-3 mb-3 rounded-lg text-base ${language === "ar" ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}`}
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            />

            {/* تفاصيل السعر والفاتورة */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 my-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{language === "ar" ? "مجموع المنتجات:" : "Products Subtotal:"}</span>
                <span className="font-semibold">{totalPrice} MRU</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{language === "ar" ? "سعر التوصيل:" : "Delivery Fee:"}</span>
                <span className="font-semibold">{deliveryFee} MRU</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{language === "ar" ? "رسوم الخدمة:" : "Service Fee:"}</span>
                <span className="font-semibold">{serviceFee.toFixed(1)} MRU</span>
              </div>
              <hr className="my-2 border-gray-300" />
              <div className="flex justify-between text-base font-bold text-green-800">
                <span>{language === "ar" ? "المجموع الكلي:" : "Grand Total:"}</span>
                <span>{grandTotal.toFixed(1)} MRU</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!address || !phone) {
                  setErrorMessage(language === "ar" ? "يرجى إدخال رقم الهاتف والعنوان" : "Please enter phone and address");
                  return;
                }
                setErrorMessage("");
                setShowFormModal(false);
                setShowConfirm(true);
              }}
              className="w-full bg-green-700 text-white py-3 text-base font-bold rounded-lg"
            >
              {language === "ar" ? "تأكيد الطلب" : "Confirm Order"}
            </button>
            {errorMessage && <div className="text-red-600 text-sm mt-2 text-center font-bold">{errorMessage}</div>}
            <button
              onClick={() => setShowFormModal(false)}
              className="w-full mt-3 border border-gray-300 py-3 rounded-lg text-base font-bold"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-70">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <h2 className="text-xl font-bold mb-4">
              {language === "ar" ? "هل أنت متأكد من إرسال الطلب؟" : "Êtes-vous sûr d’envoyer la commande ?"}
            </h2>
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-400 py-2 rounded" onClick={() => setShowConfirm(false)}>
                {language === "ar" ? "إلغاء" : "Annuler"}
              </button>
              <button
                className="flex-1 bg-green-700 text-white py-2 rounded"
                onClick={async () => {
                  setLoading(true);
                  setShowConfirm(false);
                  try {
                    await handleSendOrder();
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? (language === "ar" ? "جارٍ الإرسال..." : "Sending...") : language === "ar" ? "نعم" : "Oui"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
