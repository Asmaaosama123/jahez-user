import React from "react";
import logo from "../assets/jahez.png"; // استورد الصورة

export default function Header() {
  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center py-4 bg-white shadow-md z-25 pr-6">
      <img
        src={logo}
        className="h-10 object-contain"
        alt="Logo"
      />
    </div>
  );
}

