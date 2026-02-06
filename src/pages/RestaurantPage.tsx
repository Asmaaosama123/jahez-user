import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { IoArrowForward } from "react-icons/io5";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import VIPicon from "../assets/Vip icon.png";
import jahezbox from "../assets/Jahez BOX.png";

const BASE = "https://jahezdelivery.com";

export default function RestaurantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { t, language } = useLang();
  const { addToCart, clearCart } = useCart();


  const [storeInfo, setStoreInfo] = useState<any | null>(location.state || null);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<{ [key: number]: any[] }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [supermarketOrder, setSupermarketOrder] = useState("");
  const [categoryType, setCategoryType] = useState<number | null>(null);


  // --------------------------------
  // رابط الصورة
  // --------------------------------
  const fixImageUrl = (url: string | null) => url || "./src/assets/Layer 1.png";

  // --------------------------------
  // جلب بيانات المطعم لو storeInfo فاضي
  // --------------------------------
  useEffect(() => {
    if (!storeInfo && params.id) {
      fetch(`${BASE}/api/Stores/${params.id}`)
        .then(res => res.json())
        .then(data => setStoreInfo(data))
        .catch(() => setStoreInfo(null));
    }
  }, [storeInfo, params.id]);

  // --------------------------------
  // Zoom
  // --------------------------------
  useEffect(() => {
    document.body.style.zoom = "80%";
  }, []);

  // --------------------------------
  // Fetch sections و products
  // --------------------------------
  const fetchSections = async (storeId: number) => {
    try {
      const res = await fetch(`${BASE}/api/CustomerGet/${storeId}/sections?lang=${language}`);
      const data = res.ok ? await res.json() : [];
      setSections(data);

      const productsMap: { [key: number]: any[] } = {};
      for (const section of data) {
        const resProducts = await fetch(`${BASE}/api/Subcategories/section/${section.id}/products?lang=${language}`);
        productsMap[section.id] = resProducts.ok ? await resProducts.json() : [];
      }
      setProducts(productsMap);

      if (data.length > 0) {
        // لو فيه قسم "جاهز بوكس"، نخليه أول قسم محدد، وإلا أول قسم عادي
        const jahezTab = data.find(s => ["جاهز بوكس", "Jahez Box"].includes(s.name));
        setSelectedTab(jahezTab ? jahezTab.name : data[0].name);
      }
      
      const initialQuantities: { [key: string]: number } = {};
      Object.values(productsMap).flat().forEach((p: any) => { initialQuantities[p.id] = 0; });
      setQuantities(initialQuantities);

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeInfo?.id) fetchSections(storeInfo.id);
    else setLoading(false);
  }, [storeInfo, language]);

  // --------------------------------
  // كمية المنتج
  // --------------------------------
  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  // --------------------------------
  // أضف للسلة
  // --------------------------------
 // في دالة handleOrderNow في RestaurantPage.tsx:
// ...imports زي ما عندك
const handleOrderNow = () => {
  if (!storeInfo) return;
  clearCart();

  const itemsToAdd = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([prodId, qty]) => {
      const product = Object.values(products).flat().find(p => p.id.toString() === prodId);
      if (!product) return null;

      return {
        ...product,
        name: product.name,
        qty,
        price: parseFloat(product.price),
        imageFile: product.rawFile || null
      };
    })
    .filter(Boolean) as any[];

  if (itemsToAdd.length === 0) { alert("لم تختَر أي منتجات"); return; }

  addToCart(
    storeInfo.id.toString(),
    storeInfo.name,
    fixImageUrl(storeInfo.profileImageUrl),
    storeInfo.StoreaddressSecondary,   // تمرير العنوان الثانوي
    itemsToAdd                        // تمرير المنتجات
  );
  
  

  setQuantities({});
  setAdded(true);
  setTimeout(() => setAdded(false), 1500);

  // نمرر العنوان الثانوي مع الطلب
  navigate("/cart", { state: { storeSecondaryAddress: storeInfo.addressSecondary } });
};
useEffect(() => {
  if (storeInfo?.id) {
    fetch(`${BASE}/api/Subcategories/GetStoreCategory/${storeInfo.id}`)
      .then(res => res.json())
      .then(data => {
        setCategoryType(data.category); // هي 2 لو سوبرماركت
      })
      .catch(() => setCategoryType(null));
  }
}, [storeInfo]);

const getStoreName = (store: any) => language === "ar" ? store.nameAr || store.name : store.name;

const isSupermarket = categoryType === 2;

  if (loading) return <div className="p-5 text-center">{t.loading}</div>;
  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="relative bg-gray-100 min-h-screen font-sans" dir={language === "ar" ? "rtl" : "ltr"}>

      {/* HERO */}
      <div className="relative">
        <img
          src={fixImageUrl(storeInfo?.coverImageUrl)}
          className="w-full h-60 object-cover"
          alt="cover"
          loading="lazy"
        />

<button
  className={`absolute top-5 ${language === "ar" ? "right-4" : "left-4"} bg-black/40 p-2 rounded-full`}
  onClick={() => navigate(-1)}
>
  <IoArrowForward className={`text-white text-xl ${language === "fr" ? "rotate-180" : ""}`} />
</button>


<div
  className={`absolute bottom-3 ${
    language === "ar" ? "right-3" : "left-3"
  } text-white flex items-center gap-3`}
>
  {/* الصورة دائمًا أول عنصر */}
  <div className="flex flex-col">
  <div className="relative w-20 h-20">
    <img
      src={fixImageUrl(storeInfo?.profileImageUrl)}
      className="w-full h-full rounded-xl shadow-xl object-cover bg-white"
      alt="store"
      loading="lazy"
    />

    {storeInfo.isVerified && (
      <div className="absolute bottom-0 left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
        <span className="text-white text-[10px] font-bold">✓</span>
      </div>
    )}
  </div>

</div>

  {/* النصوص */}
  <div
  className={`flex flex-col ${
    language === "ar" ? "text-right items-start" : "text-left items-start"
  }`}
>
<div className="flex items-center gap-2 rtl:space-x-reverse">
  <h1 className="text-xl font-bold">{getStoreName(storeInfo)}</h1>

  {storeInfo.jahezBoxActive && (
    <img src={VIPicon} className="w-5 h-5 object-contain" alt="VIP" />
  )}
</div>

  <span
    className={`text-[10px] mt-1 ${
      storeInfo?.isOpen ? "text-green-400" : "text-red-700"
    }`}
  >
    {storeInfo?.isOpen ? t.open : t.closed}
  </span>
</div>


</div>


      </div>

      {/* TABS */}
  {/* TABS */}
<div className="flex gap-2 overflow-x-auto px-4 py-5 bg-gray-100 shadow">
  {/* زر جاهز بوكس */}
  {storeInfo.jahezBoxActive &&
  sections.some(tab => ["جاهز بوكس", "Jahez Box"].includes(tab.name)) && (
    <button
      key="jahezbox"
      className={`flex-shrink-0 rounded-md transition p-1 m-0 min-w-[80px] h-10 ${
        selectedTab === "جاهز بوكس" || selectedTab === "Jahez Box" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
      }`}
      onClick={() => {
        // لما تدوس على الزر، نختار الاسم الصحيح حسب اللغة
        const tabName = language === "ar" ? "جاهز بوكس" : "Jahez Box";
        setSelectedTab(tabName);
      }}
    >
      <img
        src={jahezbox}
        alt="Jahez Box"
        className="w-20 h-full object-contain m-0 py-1 px-2 border-0"
      />
    </button>
)}


  {/* باقي الأقسام العادية */}
  {sections
    .filter(tab => tab.name !== "جاهز بوكس" && tab.name !== "Jahez Box")
    .map((tab) => (
      <button
        key={tab.id}
        className={`px-8 py-2 rounded-md text-sm whitespace-nowrap ${
          selectedTab === tab.name ? "bg-green-700 text-white" : "bg-white text-gray-600"
        }`}
        onClick={() => setSelectedTab(tab.name)}
      >
        {tab.name}
      </button>
    ))}
</div>
      {/* MENU */}
      <div className="px-3 pb-36">

      {sections
  .filter(section => {
    if (selectedTab === "جاهز بوكس") {
      // أي قسم جاهز بوكس سواء بالعربي أو الإنجليزي
      return ["جاهز بوكس", "Jahez Box"].includes(section.name);
    }
    return section.name === selectedTab;
  })
  .flatMap(section => products[section.id] || [])
  .map((product, i) => (
    <div
      key={i}
      onClick={() => setSelectedProduct(product)}
      className="bg-white rounded-xl p-2 mt-2 flex items-center mb-5 shadow-sm cursor-pointer"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden border flex items-center justify-center bg-gray-100">
        <img
          src={fixImageUrl(product.imageUrl)}
          className="w-full h-full object-cover"
          alt={product.name}
          loading="lazy"
        />
      </div>
      <div className={`flex flex-col flex-1 ${language === "ar" ? "mr-4 text-right" : "ml-4 text-left"}`}>
        <h2 className="font-bold text-lg">{product.name}</h2>
        <span className="text-sm text-green-600">{product.price} MRU</span>
      </div>

      <div
        className={`flex border rounded-lg overflow-hidden 
        ${quantities[product.id] > 0 ? "bg-green-100 border-green-600" : "bg-gray-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="px-2 py-0.5 border-l text-lg" onClick={() => handleQuantityChange(product.id.toString(), 1)}>+</button>
        <span className="px-3 py-0.5">{quantities[product.id] || 0}</span>
        <button className="px-2 py-0.5 border-r text-lg" onClick={() => handleQuantityChange(product.id.toString(), -1)}>-</button>
      </div>
    </div>
  ))}

      </div>

      {/* BOTTOM BUTTON */}
      {/* BOTTOM BUTTON */}
      <div className="fixed bottom-0 w-full">
  {isSupermarket ? (
    <>
      {totalSelected === 0 ? (
        // لو مفيش منتجات مختارة → اكتب طلبك
        <button
          onClick={() => navigate("/cart", { state: { manualOrder: true, storeInfo } })}
          className="w-full bg-green-700 text-white py-4 text-lg font-bold shadow-xl"
        >
          {t.rightyourorder}
        </button>
      ) : (
        // لو في منتجات → اطلب الآن
        <button
          onClick={handleOrderNow}
          className="w-full bg-green-700 text-white py-4 text-lg font-bold shadow-xl"
        >
          {t.orderNow} ({totalSelected})
        </button>
      )}
    </>
  ) : (
    // باقي الحالات للمطاعم + المخابز
    <>
      {added && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg animate-bounce z-50">
          ✔ تمت الإضافة للسلة
        </div>
      )}

      {totalSelected === 0 ? (
        <button
          onClick={() => navigate("/cart", { state: { manualOrder: true, storeInfo } })}
          className="w-full bg-green-700 text-white py-4 text-lg font-bold shadow-xl"
        >
          {t.rightyourorder}
        </button>
      ) : (
        <button
          onClick={handleOrderNow}
          className="w-full bg-green-700 text-white py-4 text-lg font-bold shadow-xl"
        >
          {t.orderNow} ({totalSelected})
        </button>
      )}
    </>
  )}
</div>




      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 backdrop-blur-md z-50 p-3">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden pb-3">
            <div className="relative">
              <img src={fixImageUrl(selectedProduct.imageUrl)} className="w-full h-72 object-cover bg-white" />
              <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 bg-gray-100 px-2 py-1 rounded-md">✕</button>
            </div>
            <div className="px-4 mt-3 flex items-center justify-between flex-row-reverse">
            <div
  className={`flex items-center border rounded-lg overflow-hidden 
    ${quantities[selectedProduct.id] > 0 ? "bg-green-100 border-green-600" : "bg-gray-100"}`}
>
                <button className="px-3 py-1 border-l text-xl" onClick={() => handleQuantityChange(selectedProduct.id.toString(), 1)}>+</button>
                <span className="px-4 py-1">{quantities[selectedProduct.id] || 0}</span>
                <button className="px-3 py-1 border-r text-xl" onClick={() => handleQuantityChange(selectedProduct.id.toString(), -1)}>−</button>
              </div>
              <div
  className={`flex flex-col ${
    language === "ar" ? "text-right items-start" : "text-left items-start"
  }`}
>
  <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
  <p
    className={`text-green-700 font-bold text-[15px] mt-1`}
  >
    {selectedProduct.price} MRU
  </p>
</div>

            </div>
            <div className="w-full mt-4 px-4">
              <div className="bg-gray-100 w-full p-4 rounded-xl text-[15px] text-black leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
