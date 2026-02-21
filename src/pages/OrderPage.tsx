import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowForward } from "react-icons/io5";
import { BASE_URL } from "../utils/apiConfig";

export default function Cart() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.zoom = "80%";
  }, []);

  const [cart, setCart] = useState<{ [storeId: string]: any }>({});
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const filteredCart: { [storeId: string]: any } = {};
        Object.entries(parsed).forEach(([storeId, storeData]: any) => {
          if (Array.isArray(storeData.items) && storeData.items.length > 0) {
            filteredCart[storeId] = storeData;
          }
        });
        setCart(filteredCart);
      } catch {
        setCart({});
      }
    }
  }, []);

  const updateCart = (storeId: string, newItems: any[]) => {
    setCart((prev) => {
      const updated = { ...prev, [storeId]: { ...prev[storeId], items: newItems } };
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const increaseQty = (storeId: string, id: number) => {
    const items = cart[storeId]?.items || [];
    const updated = items.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    updateCart(storeId, updated);
  };

  const decreaseQty = (storeId: string, id: number) => {
    const items = cart[storeId]?.items || [];
    const updated = items.map((item) =>
      item.id === id && item.qty > 0 ? { ...item, qty: item.qty - 1 } : item
    );
    updateCart(storeId, updated);
  };

  const totalPrice = Object.values(cart)
    .flatMap(store => store.items)
    .reduce((acc, item) => acc + (item?.qty || 0) * (item?.price || 0), 0);

  const handleOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/Orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          address,
          cart,
        }),
      });

      const data = await response.json();

      if (response.ok && data.orderLink) {
        // إرسال رسالة واتساب إلى الرقم الثابت
        const orderDetails = Object.values(cart)
          .flatMap(store => store.items)
          .map(item => `${item.name} - ${item.qty} × ${item.price} MRU`)
          .join('%0A');

        const message = `طلب جديد%0A%0Aالعميل: ${phone}%0Aالعنوان: ${address}%0A%0Aالتفاصيل:%0A${orderDetails}%0A%0Aالمجموع: ${totalPrice} MRU%0A%0Aرابط الطلب: ${data.orderLink}`;

        const whatsappUrl = `https://wa.me/201006621660?text=${message}`;
        window.open(whatsappUrl, '_blank');

        localStorage.removeItem("cart");
        setCart({});

        alert("✅ تم إرسال الطلب بنجاح!");
      } else {
        alert("❌ لم يتم إنشاء الطلب.");
      }
    } catch (error) {
      alert("❌ فشل إرسال الطلب! تأكدي من الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <button
          className="absolute top-5 right-4 bg-black/40 p-2 rounded-full"
          onClick={() => navigate(-1)}
        >
          <IoArrowForward className="text-white text-xl" />
        </button>
        <h1 className="text-3xl font-bold text-black m-auto">
          السلة - <span className="text-green-700">{totalPrice} MRU</span>
        </h1>
      </div>

      <div className="p-4 pb-40">
        {Object.entries(cart).length === 0 && (
          <p className="text-center text-gray-500 mt-20">السلة فارغة</p>
        )}

        {Object.entries(cart).map(([storeId, storeData]) => (
          <div key={storeId} className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center mb-4">
              <img src="/src/assets/store (1).png" className="w-6 ml-2" />
              <h2 className="text-xl font-bold">{storeData.storeName}</h2>
            </div>

            {storeData.items.map((item: any) => (
              <div key={item.id} className="flex items-center border rounded-xl p-3 mb-3">
                <img
                  src={item.imageUrl || "https://i.pinimg.com/736x/65/69/62/656962f1d28e14d82032cf75a1f8ecae.jpg"}
                  className="w-14 h-14 rounded-xl border-2 border-green-500"
                />
                <div className="mr-3">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-green-700 text-sm">{item.price} MRU</p>
                </div>
                <div className={`flex items-center gap-2 mr-auto ${item.qty > 0 ? "text-green-700 font-bold" : ""}`}>
                  <button
                    onClick={() => increaseQty(storeId, item.id)}
                    className={`border px-3 py-1 rounded ${item.qty > 0 ? "border-green-600 text-green-700" : ""}`}
                  >+</button>
                  <div className="border px-4 py-1 rounded">{item.qty}</div>
                  <button
                    onClick={() => decreaseQty(storeId, item.id)}
                    className={`border px-3 py-1 rounded ${item.qty > 0 ? "border-green-600 text-green-700" : ""}`}
                  >-</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t shadow-lg">
        <input
          className="w-full border p-3 rounded-lg mb-3"
          placeholder="عنوان الاستلام"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          className="w-full border p-3 rounded-lg mb-3"
          placeholder="رقم هاتف المستلم"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={handleOrder}
          disabled={loading || Object.entries(cart).length === 0 || !address || !phone}
          className="w-full bg-green-800 text-white py-3 rounded-xl text-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {loading ? "جارٍ الإرسال..." : "تأكيد عبر الواتساب"}
          <img src="/src/assets/whatsapp.png" className="w-6" />
        </button>
      </div>
    </div>
  );
}

// صفحة جديدة لعرض الطلب
export function OrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.zoom = "80%";

    // محاكاة لجلب بيانات الطلب (يجب استبدالها بالاستدعاء الفعلي للAPI)
    const fetchOrder = async () => {
      try {
        // هنا يجب استدعاء API لجلب بيانات الطلب باستخدام orderId
        // const response = await fetch(`https://deliver-web-app2.runasp.net/api/Orders/${orderId}`);
        // const orderData = await response.json();

        // محاكاة للبيانات لحين توصيل الAPI
        setTimeout(() => {
          const mockOrder = {
            phone: "0123456789",
            address: "عنوان العميل",
            cart: JSON.parse(localStorage.getItem("lastOrder") || "{}")
          };
          setOrder(mockOrder);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center" dir="rtl">
        <p className="text-xl">جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center" dir="rtl">
        <p className="text-xl text-red-600">الطلب غير موجود</p>
      </div>
    );
  }

  const { phone, address, cart } = order;

  const totalPrice = Object.values(cart)
    .flatMap(store => store.items)
    .reduce((acc, item) => acc + (item?.qty || 0) * (item?.price || 0), 0);

  return (
    <div className="bg-gray-100 min-h-screen font-sans overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <button
          className="absolute top-5 right-4 bg-black/40 p-2 rounded-full"
          onClick={() => navigate(-1)}
        >
          <IoArrowForward className="text-white text-xl" />
        </button>
        <h1 className="text-3xl font-bold text-black m-auto">
          تفاصيل الطلب - <span className="text-green-700">{totalPrice} MRU</span>
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">معلومات العميل</h2>
          <p><span className="font-bold">رقم الهاتف:</span> {phone}</p>
          <p><span className="font-bold">العنوان:</span> {address}</p>
        </div>

        {Object.entries(cart).map(([storeId, storeData]: any) => (
          <div key={storeId} className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center mb-4">
              <img src="/src/assets/store (1).png" className="w-6 ml-2" />
              <h2 className="text-xl font-bold">{storeData.storeName}</h2>
            </div>

            {storeData.items.map((item: any) => (
              <div key={item.id} className="flex items-center border rounded-xl p-3 mb-3">
                <img
                  src={item.imageUrl || "https://i.pinimg.com/736x/65/69/62/656962f1d28e14d82032cf75a1f8ecae.jpg"}
                  className="w-14 h-14 rounded-xl border-2 border-green-500"
                />
                <div className="mr-3 flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-green-700 text-sm">{item.price} MRU</p>
                </div>
                <div className="text-green-700 font-bold border px-4 py-1 rounded">
                  {item.qty}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}