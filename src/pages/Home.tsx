import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import layer1 from "../assets/Layer 1.png";
import store1 from "../assets/store (1).png";
import croissant from "../assets/croissant.png";
import jahezLogo from "../assets/jahez.png";
import languageIcon from "../assets/language.png";
import VIPicon from "../assets/Vip icon.png";

const BASE = "https://jahezdelivery.com";

export default function Home() {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLang();

  useEffect(() => {
    document.body.style.zoom = "80%";
  }, []);

  const categoriesData = useMemo(
    () => [
      { key: "restaurants", image: layer1, type: 1 },
      { key: "supermarkets", image: store1, type: 2 },
      { key: "bakeries", image: croissant, type: 3 },
    ],
    []
  );

  const categories = useMemo(
    () =>
      categoriesData.map((c) => ({
        name: t[c.key as keyof typeof t],
        image: c.image,
        type: c.type,
      })),
    [categoriesData, t]
  );

  const [category, setCategory] = useState(categories[0].type);
  const [filters, setFilters] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [languageModal, setLanguageModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCity") || "Nouakchott"
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false); // <— NEW

  // ---------------------------
  // Fetch subcategories
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      const selectedCategory = categoriesData.find((c) => c.type === category);
      if (!selectedCategory) return;

      try {
        const res = await fetch(
          `${BASE}/api/Subcategories/by-category-type/${selectedCategory.type}?lang=${language}`
        );
        const data = await res.json();
        setFilters(data || []);

        if (data && data.length > 0) {
          setFilter(data[0].name);
          fetchStores(data[0].id);
        } else {
          setFilter("");
        }
      } catch (err) {
        console.log("Error fetching filters:", err);
      }
    };

    fetchData();
  }, [category, language, categoriesData, selectedCity]);

  // ---------------------------
  // Fetch stores by subcategory
  // ---------------------------
  const fetchStores = useCallback(
    async (subId: any) => {
      try {
        setLoading(true);

        const [resFr, resAr] = await Promise.all([
          fetch(`${BASE}/api/Subcategories/by-subcategory/${subId}?lang=fr`),
          fetch(`${BASE}/api/Subcategories/by-subcategory/${subId}?lang=ar`),
        ]);

        const [dataFr, dataAr] = await Promise.all([
          resFr.json(),
          resAr.json(),
        ]);

        const merged = dataFr.map((storeFr: any) => {
          const storeAr = dataAr.find((s: any) => s.id === storeFr.id);
          return {
            ...storeFr,
            name: storeFr.name,
            nameAr: storeAr?.name,
          };
        });

        const filtered = merged.filter((store: any) =>
          store.addressMain?.includes(selectedCity)
        );

        setStores(filtered);
      } catch (err) {
        console.log("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCity]
  );

  // ---------------------------
  // Prefetch all stores (for search)
  // ---------------------------
  useEffect(() => {
    const fetchAllStores = async () => {
      const tempStores: any[] = [];

      for (const c of categoriesData) {
        try {
          const [resSubsFr, resSubsAr] = await Promise.all([
            fetch(
              `${BASE}/api/Subcategories/by-category-type/${c.type}?lang=fr`
            ),
            fetch(
              `${BASE}/api/Subcategories/by-category-type/${c.type}?lang=ar`
            ),
          ]);

          const [subsFr, subsAr] = await Promise.all([
            resSubsFr.json(),
            resSubsAr.json(),
          ]);

          for (let i = 0; i < subsFr.length; i++) {
            const subFr = subsFr[i];
            const subAr = subsAr.find((s: any) => s.id === subFr.id);

            const [resStoresFr, resStoresAr] = await Promise.all([
              fetch(
                `${BASE}/api/Subcategories/by-subcategory/${subFr.id}?lang=fr`
              ),
              fetch(
                `${BASE}/api/Subcategories/by-subcategory/${subFr.id}?lang=ar`
              ),
            ]);

            const [storesFr, storesAr] = await Promise.all([
              resStoresFr.json(),
              resStoresAr.json(),
            ]);

            storesFr.forEach((storeFr: any) => {
              const storeAr = storesAr.find((s: any) => s.id === storeFr.id);
              tempStores.push({
                ...storeFr,
                name: storeFr.name,
                nameAr: storeAr?.name,
                category: c.type,
                subId: subFr.id,
              });
            });
          }
        } catch (err) {
          console.log(err);
        }
      }

      setAllStores(tempStores);
    };

    fetchAllStores();
  }, [categoriesData, language]);

  // ---------------------------
  // Smart search
  // ---------------------------
  const smartSearch = useCallback(
    (value: string) => {
      setSearch(value);

      if (!value.trim()) return;

      const q = value.toLowerCase();

      const filtered = allStores.filter(
        (store: any) =>
          store.addressMain?.includes(selectedCity) &&
          (store.name?.toLowerCase().includes(q) ||
            store.nameAr?.toLowerCase().includes(q))
      );

      if (filtered.length) {
        setCategory(filtered[0].category);
        setStores(filtered);
      }
    },
    [allStores, selectedCity]
  );

  const goToRestaurant = (store: any) => {
    navigate(`/restaurant/${store.id}`, {
      state: {
        id: store.id,
        name: store.name,
        nameAr: store.nameAr,
        profileImageUrl: store.profileImageUrl,
        coverImageUrl: store.coverImageUrl,
        isOpen: store.isOpen,
        addressMain: store.addressMain,
        StoreaddressSecondary: store.addressSecondary,
        jahezBoxActive: store.jahezBoxActive,
        isVerified: store.isVerified,
      },
    });
  };

  const imageUrl = (url: string | null) => {
    if (!url) return "./src/assets/Layer 1.png";
    if (url.startsWith("http")) return url;
    return `${BASE}/${url.replace(/^\/?images\/?/, "images/")}`;
  };

  const filteredStores = stores.filter((store: any) => {
    const q = search.toLowerCase();
    return (
      store.name?.toLowerCase().includes(q) ||
      store.nameAr?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="bg-white min-h-screen font-sans"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3">
        <button className="text-2xl" onClick={() => navigate("/cart")}></button>
        <h1 className="text-7xl font-bold text-green-800">
          <img src={jahezLogo} className="w-35 h-8 object-cover" />
        </h1>
        <button
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shadow-md overflow-hidden"
          onClick={() => setLanguageModal(true)}
        >
          <img src={languageIcon} className="w-full h-full object-cover" loading="lazy" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3 mt-3">
          <input
            className={`flex-1 bg-transparent outline-none text-gray-600 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
            dir={language === "ar" ? "rtl" : "ltr"}
            placeholder={t.search}
            value={search}
            onChange={(e) => smartSearch(e.target.value)}
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
              category === c.type
                ? "bg-green-800 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="p-2 rounded-full bg-gray-100 w-9 h-9 flex items-center justify-center">
              <img
                src={c.image}
                className="w-7 h-7 object-contain"
                loading="lazy"
              />
            </div>
            {c.name}
          </button>
        ))}
      </div>

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

        {/* STORES */}
        <div className="px-4 pb-10">
          {loading ? (
            <p className="text-center py-10">جارِ التحميل…</p>
          ) : (
            filteredStores.map((r: any, i: number) => (
              <div
                key={i}
                onClick={() => goToRestaurant(r)}
                className="bg-white rounded-xl p-4 flex items-center mb-4 hover:shadow-md cursor-pointer"
              >
<div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center flex-shrink-0">
  <img
    src={imageUrl(r.profileImageUrl)}
    className="w-full h-full object-cover"
    alt={r.name}
    loading="lazy"
  />

  {/* علامة التوثيق فوق الصورة */}
  {r.isVerified && (
    <div className="absolute bottom-0 left-0 w-8 h-8 bg-green-600 rounded-full border-2 border-white flex items-center translate-x-1/7 translate-y-1/8 justify-center shadow">
    <svg
        className="w-3 h-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )}
</div>



                <div
                  className={`flex flex-col flex-1 ${
                    language === "ar" ? "mr-4 text-right" : "ml-4 text-left"
                  }`}
                >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
  <h2 className="font-bold text-lg">
    {language === "ar" ? r.nameAr || r.name : r.name}
  </h2>
  {r.jahezBoxActive && (
    <img src={VIPicon} className="w-5 h-5 object-contain" alt="VIP" />
  )}
  </div>


                  <span
                    className={`text-[10px] ${
                      r.isOpen ? "text-green-600" : "text-red-700"
                    }`}
                  >
                    {r.isOpen ? t.open : t.closed}
                  </span>
                </div>

                <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs shadow">
                  {t.delivery}: {r.deliveryFee ?? "-"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Language Modal */}
      {languageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="border rounded-lg mb-4">
              <select
                id="citySelect"
                className="w-full h-14 bg-white text-right text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
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
                const city = (
                  document.getElementById("citySelect") as HTMLSelectElement
                ).value;
                const lang = (
                  document.getElementById("langSelect") as HTMLSelectElement
                ).value;

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
