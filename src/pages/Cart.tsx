import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { IoArrowForward } from "react-icons/io5";
import { useLang } from "../context/LanguageContext";

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLang();
  const { cart, updateCart, clearCart } = useCart();

  // بيانات من الصفحة اللي قبلها
  const manualOrder = location.state?.manualOrder || false;
  const storeInfo = location.state?.storeInfo || null;

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualRequest, setManualRequest] = useState("");

  // امسح الكارت القديم لو manualOrder
  useEffect(() => {
    if (manualOrder) {
      clearCart();
    }
  }, [manualOrder]);

  // زيادة/نقص كمية المنتجات
  const increaseQty = (storeId: string, id: number) => {
    const items = cart[storeId]?.items || [];
    updateCart(storeId, items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  };

  const decreaseQty = (storeId: string, id: number) => {
    const items = cart[storeId]?.items || [];
    updateCart(storeId, items.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  // سعر الكل
  const totalPrice = Object.values(cart)
    .flatMap(store => store?.items || [])
    .reduce((acc, item) => acc + (item.price * item.qty), 0);

  // فلتر الكارت
  const filteredCart = Object.fromEntries(
    Object.entries(cart).filter(([_, storeData]) => (storeData?.items?.length || 0) > 0)
  );

  const getProductName = (item: any) => language === "ar" ? (item.nameAr || item.name || "") : (item.nameFr || item.name || "");

  // إرسال الطلب عبر WhatsApp أو API
  const handleSendWhatsApp = async () => {
    if (!phone || !address) {
      alert("يرجى إدخال رقم الهاتف والعنوان");
      return;
    }
  
    setLoading(true);
  
    try {
      let orderId = ""; // من response API
      let storeName = "";
  
      // بناء payload وإرسال للـ API هنا...
      const res = await fetch("https://deliver-web-app2.runasp.net/api/Orders/CreateOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
  
      if (!res.ok) throw new Error("فشل إنشاء الطلب");
      const data = await res.json();
      orderId = data.orderId;
      storeName = manualOrder ? storeInfo?.name ?? "غير معروف" : filteredCart[Object.keys(filteredCart)[0]]?.storeName ?? "غير معروف";
  
      const publicOrderLink = `https://jahez-five.vercel.app/public-order/${orderId}`;
  
      let message = `طلب جديد:
  رابط الطلب: ${publicOrderLink}`;
  
      // إضافة المنتجات لو في كارت
      if (!manualOrder) {
        const items = filteredCart[Object.keys(filteredCart)[0]].items || [];
        items.forEach(item => {
          message += `\n- ${item.nameAr} × ${item.qty} (سعر: ${item.price})`;
        });
      } else {
        message += `\nطلب مكتوب: ${manualRequest}`;
      }
  
      const waNumber = "201006621660"; // رقم الواتساب
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      window.open(waLink, "_blank");
  
    } catch (err: any) {
      alert(`حدث خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="overflow-y-auto pb-30 bg-gray-100 min-h-screen font-sans" dir="rtl" >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow relative">
        <button className="absolute top-2 right-2 bg-black/40 p-2 rounded-full" onClick={() => navigate(-1)}>
          <IoArrowForward className="text-white text-lg" />
        </button>
        <h1 className="text-xl font-bold text-black m-auto">
          <span className="text-black font-bold text-3xl">{t.Orderdetails}</span>
        </h1>
      </div>

      {/* Cart / Manual Order */}
      {manualOrder ? (
        <div className="bg-white p-3 mb-3 mt-5 mx-3">
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
            className="w-full p-3 border rounded-lg mb-4"
            rows={6}
            placeholder={t.Pleaseenteryourdetailshere}
            value={manualRequest}
            onChange={e => setManualRequest(e.target.value)}
          />
        </div>
      ) : (
        Object.entries(filteredCart).map(([storeId, storeData]) => (
          <div key={storeId} className="bg-white p-3 mb-3 mt-5 mx-3">
            {/* معلومات المتجر */}
            <div className="flex items-center mb-3 gap-2">
              <img src={storeData.storeImage} alt={storeData.storeName} className="w-16 h-16 rounded-full object-cover"/>
              <div>
                <h2 className="text-xl font-bold">{storeData.storeName}</h2>
                {storeData.StoreaddressSecondary && (
                  <p className="text-sm text-green-700">{storeData.StoreaddressSecondary}</p>
                )}
              </div>
              <div className="mr-auto">
                <span className="text-white text-xl bg-green-700 px-5 py-3 rounded font-bold">
                  {totalPrice} MRU
                </span>
              </div>
            </div>

            <hr className="border-t-1 border-black my-4" />

            {/* منتجات المطعم */}
            {(storeData.items || []).map(item => (
              <div key={item.id} className="flex items-center border rounded-xl p-2 mb-2">
                <img src={item.imageUrl || ""} className="w-12 h-12 rounded-xl border-2 border-green-500" alt={getProductName(item)} />
                <div className="mr-2 shadow-sm bg-white">
                  <p className="font-bold text-sm shadow-sm">{getProductName(item)}</p>
                  <p className="text-green-700 text-xs">{item.price} MRU</p>
                </div>
                <div className="flex items-center gap-1 mr-auto text-green-700 font-bold">
                  <button onClick={() => increaseQty(storeId, item.id)} className="border px-2 py-0.5 rounded border-green-600">+</button>
                  <div className="border px-2 py-0.5 rounded text-sm">{item.qty}</div>
                  <button onClick={() => decreaseQty(storeId, item.id)} className="border px-2 py-0.5 rounded border-green-600">-</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Bottom form */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t shadow-lg">
        <input
          className="w-full border p-2 text-sm mb-2"
          placeholder={t.addressPlaceholder}
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <input
          className="w-full border p-2 mb-2 text-sm"
          placeholder={t.phonePlaceholder}
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button
          onClick={handleSendWhatsApp}
          disabled={loading || (manualOrder ? manualRequest.trim() === "" : Object.keys(filteredCart).length === 0)}
          className="w-full bg-green-700 text-white py-3 text-base font-bold shadow-xl"
        >
          {loading ? (language === "ar" ? "جارٍ الإرسال..." : "sending") : (language === "ar" ? "تأكيد الطلب" : "Confirm Order")}
        </button>
      </div>
    </div>
  );
}
