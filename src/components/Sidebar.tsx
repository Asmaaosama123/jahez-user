import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { FaMotorcycle } from "react-icons/fa";
import LogoutButton from "./LogoutButton";

import restaurantIcon from "../assets/Layer 1.png";
import marketIcon from "../assets/store (1).png";
import medicineIcon from "../assets/croissant.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const match = location.pathname.match(/\/admin\/category\/(\d+)/);
    if (match) setActiveCategory(Number(match[1]));
    else setActiveCategory(null);
  }, [location]);

  const handleClick = (id) => {
    navigate(`/admin/category/${id}`);
  };

  const CategoryButton = ({ id, icon, label }) => (
    <button
      onClick={() => handleClick(id)}
      className={`flex items-center gap-2 px-6 py-3 transition-colors
        ${activeCategory === id ? "bg-white text-black font-bold" : "hover:bg-green-700"}
      `}
    >
      <img src={icon} className="w-5 h-5" alt={label} />
      {label}
    </button>
  );

  return (
    <div className="w-48 bg-green-800 min-h-screen text-white flex flex-col pt-20">
      <div className="flex mr-6 mb-2 items-center gap-2">
        <AiFillHome className="text-xl text-black ml-1" />
        <button onClick={() => navigate("/admin/orders")}
                className="text-white">
          الصفحة الرئيسية
        </button>
      </div>
      <CategoryButton id={1} icon={restaurantIcon} label="مطاعم" />
      <CategoryButton id={2} icon={marketIcon} label="سوبر ماركت" />
      <CategoryButton id={3} icon={medicineIcon} label="صيدليات" />
      
      <button
        onClick={() => navigate("/admin/delivery-representatives")}
        className={`flex items-center gap-2 px-6 py-3 transition-colors hover:bg-green-700
          ${location.pathname === "/admin/delivery-representatives" ? "bg-white text-black font-bold" : ""}
        `}
      >
        <FaMotorcycle className="w-5 h-5 text-black" />
        مندوبي التوصيل
      </button>

      <button
        onClick={() => navigate("/admin/users")}
        className={`flex items-center gap-2 px-6 py-3 transition-colors hover:bg-green-700
          ${location.pathname === "/admin/users" ? "bg-white text-black font-bold" : ""}
        `}
      >
        <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>
        المستخدمين
      </button>

      <LogoutButton />
    </div>
  );
}
