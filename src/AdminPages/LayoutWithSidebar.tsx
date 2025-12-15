import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function LayoutWithSidebar() {
  return (
    <div dir="rtl">
   
        <Outlet />
    </div>
  );
}
