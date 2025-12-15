import { useState } from "react";

const WhatsAppOrderButton = ({ cart, phone, address, storeNames, productNames }) => {
  const [loading, setLoading] = useState(false);

  const sendWhatsApp = async () => {
    if (!phone || !address) {
      alert("يرجى إدخال رقم الهاتف والعنوان");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ حفظ الطلب في قاعدة البيانات
      const resOrder = await fetch("https://deliver-web-app2.runasp.net/api/Orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address, cart })
      });
      const orderData = await resOrder.json();

      if (!resOrder.ok) {
        alert("فشل حفظ الطلب");
        return;
      }

      // 2️⃣ تجهيز رسالة واتساب
      let message = `طلب جديد:\nرقم الهاتف: ${phone}\nالعنوان: ${address}\n\n`;

      Object.keys(cart).forEach(storeId => {
        const storeName = storeNames[storeId] || "اسم المتجر";
        message += `متجر: ${storeName}\n`;
        cart[storeId].items.forEach(item => {
          const prodName = productNames[item.id] || item.name;
          message += `- ${prodName} × ${item.qty} (سعر: ${item.price})\n`;
        });
        message += "\n";
      });

      const waNumber = "201006621660"; // الرقم الثابت
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      window.open(waLink, "_blank");

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendWhatsApp}
      disabled={loading}
      className="w-full bg-green-800 text-white py-3 rounded-xl text-lg flex items-center justify-center gap-2"
    >
      {loading ? "جاري الإرسال..." : "إرسال رسالة واتساب"}
    </button>
  );
};

export default WhatsAppOrderButton;
