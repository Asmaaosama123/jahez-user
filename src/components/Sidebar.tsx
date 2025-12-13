import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";

import restaurantIcon from "../assets/Layer 1.png";
import marketIcon from "../assets/store (1).png";
import medicineIcon from "../assets/croissant.png" ;

export default function Sidebar() {
  const navigate = useNavigate();
  const { categoryType } = useParams();
  const [activeCategory, setActiveCategory] = useState(Number(categoryType) || null);

  useEffect(() => {
    if (categoryType) setActiveCategory(Number(categoryType));
  }, [categoryType]);

  const handleClick = (id) => {
    setActiveCategory(id);
    navigate(`/category/${id}`);
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
<div className="w-48 bg-green-800 min-h-screen text-white flex flex-col pt-50 pt-20">
   <div className="flex mr-6">
    <AiFillHome className="text-xl text-black ml-1" />
   {/* الصفحة الرئيسية */}
 <button   onClick={() => navigate("/orders")}>
الصفحه الرئيسيه</button>
</div>
      <CategoryButton id={1} icon={restaurantIcon} label="مطاعم" />
      <CategoryButton id={2} icon={marketIcon} label="سوبر ماركت" />
      <CategoryButton id={3} icon={medicineIcon} label="مخابز" />
    </div>
  );
}
