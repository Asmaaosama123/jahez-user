import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaTrash, FaPencilAlt, FaUsers, FaSearch } from "react-icons/fa";
import { BASE_URL } from "../utils/apiConfig";
import EditUserModal from "../components/EditUserModal";

const BASE = BASE_URL;

interface User {
  id: number;
  name: string;
  phoneNumber: string;
  balance: number;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const StatusValue = (u: any) => u.status || u.Status || "مفعل";

  const fetchData = async () => {
    try {
      const usersRes = await fetch(`${BASE}/api/Users`);
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        const res = await fetch(`${BASE}/api/Users/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.phoneNumber.includes(searchTerm) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex bg-[#f4f4f4] min-h-screen" dir="rtl">
      <Sidebar />
      <div className="flex-1 mt-[70px]">
        <Header />
        <div className="p-10">
          {/* كروت الإحصائيات */}
          <div className="flex justify-start mb-4">
            <div className="w-60 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <span className="text-4xl font-black text-gray-800">{users.length}</span>
                <FaUsers size={32} className="text-black" />
              </div>
              <div className="bg-black py-2 text-center">
                <p className="text-white font-bold text-sm">المستخدمين</p>
              </div>
            </div>
          </div>

          {/* محرك البحث */}
          <div className="flex justify-start mb-6">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="بحث برقم الهاتف أو الاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-right font-bold bg-white"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* جدول المستخدمين */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#0c0c0c] text-white">
                <tr>
                  <th className=" py-6 px-6 text-sm font-bold border-l border-gray-800">الاسم</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-800">رقم الهاتف</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-800">الحالة</th>
                  <th className="py-4 px-4 text-sm font-bold">تعديل / حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-gray-500 text-lg">لا يوجد مستخدمين مسجلين</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id || (u as any).Id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-10 h-10 bg-gray-200 rounded-sm flex items-center justify-center text-gray-500 shrink-0 border border-gray-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="mr-22 font-bold text-gray-800">{u.name || (u as any).Name || "---"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700">{u.phoneNumber || (u as any).PhoneNumber}</td>
                      <td className="py-4 px-4">
                        <span className={`font-bold ${(StatusValue(u) === "مفعل") ? "text-green-600" : (StatusValue(u) === "محظور") ? "text-red-600" : "text-orange-500"}`}>
                          {StatusValue(u)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => { setEditingUser(u); setShowEditModal(true); }} className="p-2 bg-gray-100 rounded hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200" title="تعديل"><FaPencilAlt size={14} /></button>
                          <button onClick={() => handleDelete(u.id || (u as any).Id)} className="p-2 bg-gray-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition-all shadow-sm border border-gray-200" title="حذف"><FaTrash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => { setShowEditModal(false); setEditingUser(null); }}
          onAdded={fetchData}
        />
      )}
    </div>
  );
}
