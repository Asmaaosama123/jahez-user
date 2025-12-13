import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

const BASE = "http://deliver-web-app2.runasp.net";

export default function Home() {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLang();

  // Zoom
  useEffect(() => {
    document.body.style.zoom = "80%";
  }, []);

  // ---------------------------
  // Categories ثابتة مع type
  // ---------------------------
  const categoriesData = [
    { key: "restaurants", image: "./src/assets/Layer 1.png", type: 1 },
    { key: "supermarkets", image: "./src/assets/store (1).png", type: 2 },
    { key: "bakeries", image: "./src/assets/croissant.png", type: 3 },
  ];

  const categories = categoriesData.map(c => ({
    name: t[c.key as keyof typeof t],
    image: c.image,
    type: c.type
  }));

  // ---------------------------
  // State
  // ---------------------------
  const [category, setCategory] = useState(categories[0].type);
  const [filters, setFilters] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [languageModal, setLanguageModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCity") || "Nouakchott"
  );
  
  // ---------------------------
  // Fetch subcategories عند تغيير الفئة أو المدينة أو اللغة
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      const selectedCategory = categoriesData.find(c => c.type === category);
      if (!selectedCategory) return;

      try {
        const res = await fetch(`${BASE}/api/Subcategories/by-category-type/${selectedCategory.type}?lang=${language}`);
        const data = await res.json();
        setFilters(data || []);

        if (data && data.length > 0) {
          setFilter(data[0].name);
          await fetchStores(data[0].id);
        } else {
          setFilter("");
          setStores([]);
        }
      } catch (err) {
        console.log("Error fetching filters:", err);
      }
    };

    fetchData();
  }, [category, selectedCity, language]);

  // ---------------------------
  // Fetch stores حسب subcategory
  // ---------------------------
  const fetchStores = async (subId: number) => {
    try {
      const res = await fetch(`${BASE}/api/Subcategories/by-subcategory/${subId}?lang=${language}`);
      const data = await res.json();
      const filtered = data.filter((store: any) =>
        store.addressMain?.includes(selectedCity)
      );
      setStores(filtered);
    } catch (err) {
      console.log("Error fetching stores:", err);
      setStores([]);
    }
  };

  // ---------------------------
  // Navigate to restaurant
  // ---------------------------
  const goToRestaurant = (store: any) => {
    navigate(`/restaurant/${store.id}`, {
      state: {
        id: store.id,
        name: store.name,
        profileImageUrl: store.profileImageUrl,
        coverImageUrl: store.coverImageUrl,
        isOpen: store.isOpen,
        addressMain: store.addressMain,
        StoreaddressSecondary: store.addressSecondary
      }
    });
  };

  // ---------------------------
  // Helper للصورة
  // ---------------------------
  const imageUrl = (url: string | null) => {
    if (!url) return "./src/assets/Layer 1.png";
    if (url.startsWith("http")) return url;
    return `${BASE}/${url.replace(/^\/?images\/?/, "images/")}`;
  };

  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <div className="bg-white min-h-screen font-sans" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3">
      
        <button className="text-2xl" onClick={() => navigate("/cart")}>
          {/* <img src="src/assets/shopping-basket.png" className="w-7 h-7" /> */}
        </button>
        <h1 className="text-7xl font-bold text-green-800">
          <img src="src/assets/jahez.png" className="w-35 h-6 object-cover" />
        </h1>

        <button
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shadow-md overflow-hidden"
          onClick={() => setLanguageModal(true)}
        >
          <img src="src/assets/language.png" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3 mt-3">
          <input
            className="flex-1 bg-transparent outline-none text-right text-gray-600"
            placeholder={t.search}
          />
        </div>
      </div>

      {/* Category Buttons */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-5 pb-6">
        {categories.map((c) => (
          <button
            key={c.type}
            onClick={() => setCategory(c.type)}
            className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-2 transition-all ${
              category === c.type ? "bg-green-800 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="p-2 rounded-full bg-gray-100 w-9 h-9 flex items-center justify-center">
              <img src={c.image} className="w-7 h-7 object-contain" />
            </div>
            {c.name}
          </button>
        ))}
      </div>

      {/* Filters & Stores */}
      <div className="bg-gray-100 min-h-screen">
        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto px-4 py-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.name);
                fetchStores(f.id);
              }}
              className={`px-6 py-2 rounded-md text-sm whitespace-nowrap transition-all ${
                filter === f.name
                  ? "bg-green-800 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Stores list */}
        <div className="px-4 pb-10">
          {stores.map((r, i) => (
            <div
              key={i}
              onClick={() => goToRestaurant(r)}
              className="bg-white rounded-xl p-4 flex items-center mb-4 hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                <img
                  src={imageUrl(r.profileImageUrl)}
                  className="w-full h-full object-cover"
                  alt={r.name}
                />
              </div>

              <div className="flex flex-col mr-4 flex-1">
                <h2 className="font-bold text-lg">{r.name}</h2>
                <span className="text-[10px] text-green-600">
                  {r.isOpen ? t.open : t.closed}
                </span>
              </div>

              <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs shadow">
                {t.delivery}: {r.deliveryFee ?? "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Language Modal */}
      {languageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="border rounded-lg mb-4">
              <select
                id="citySelect"
                className="w-full h-14 bg-white text-right text-lg border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
                defaultValue={selectedCity}
              >
                <option value="Nouakchott">أنواكشوط</option>
                <option value="Nouadhibou">أنواذيبو</option>
              </select>
            </div>

            <div className="border rounded-lg mb-6">
              <select
                id="langSelect"
                className="w-full p-3 bg-white text-right text-lg"
                defaultValue={language}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <button
              onClick={() => {
                const city = (document.getElementById("citySelect") as HTMLSelectElement).value;
                const lang = (document.getElementById("langSelect") as HTMLSelectElement).value;
                setSelectedCity(city);
                localStorage.setItem("selectedCity", city);
                changeLanguage(lang);
                setLanguageModal(false);
              }}
              className="w-full bg-green-800 text-white py-3 rounded-lg text-lg font-bold"
            >
              تأكيد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
