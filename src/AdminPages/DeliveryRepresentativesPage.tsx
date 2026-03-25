import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaTrash, FaPencilAlt, FaCar, FaMotorcycle, FaSearch } from "react-icons/fa";
import { BASE_URL } from "../utils/apiConfig";
import AddRepresentativeModal from "../components/AddRepresentativeModal";
import AddVehicleTypeModal from "../components/AddVehicleTypeModal";

const BASE = BASE_URL;

interface VehicleStat {
  vehicleName: string;
  icon: string;
  total: number;
  activeNow: number;
}

interface Stats {
  activeNowCar: number;
  activeNowBike: number;
  totalCar: number;
  totalBike: number;
  vehicleStats: VehicleStat[];
}

interface Representative {
  id: number;
  name: string;
  identificationNumber: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  plateNumber: string;
  phone: string;
  balance: number;
  status: string;
  imageUrl: string;
  completedOrders: number;
  cancelledOrders: number;
  isActiveNow: boolean;
}

export default function DeliveryRepresentativesPage() {
  const [reps, setReps] = useState<Representative[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editingRep, setEditingRep] = useState<Representative | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const repsRes = await fetch(`${BASE}/api/DeliveryRepresentatives`);
      const repsData = await repsRes.json();
      setReps(repsData);

      const statsRes = await fetch(`${BASE}/api/DeliveryRepresentatives/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المندوب؟")) {
      try {
        const res = await fetch(`${BASE}/api/DeliveryRepresentatives/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const StatCard = ({ count, label, icon: Icon, bottomColor }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center w-36">
      <div className="flex items-center justify-between w-full px-3 py-3 h-16">
        <span className="text-2xl font-bold text-green-800">{count}</span>
        <Icon className="text-3xl text-gray-800" />
      </div>
      <div className={`w-full text-center py-1 text-[10px] text-white font-bold ${bottomColor}`}>
        {label}
      </div>
    </div>
  );

  const filteredReps = reps.filter(r => 
    r.phone.includes(searchTerm) || 
    r.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-[#f4f4f4] min-h-screen" dir="rtl">
      <Sidebar />
      <div className="flex-1 mt-[77px]">
        <Header />
        <div className="p-8">
          
          <div className="flex justify-between items-center mb-6">
            {/* Stats Cards - Now on the LEFT side of the main content (RIGHT in LTR, but we are in RTL) */}
            {/* User said: اعكس الاربع مربعات مع مربع اضافة جديد */}
            {/* The cards should be on the far right (next to sidebar in RTL) */}
            {/* And the button on the left. */}
            
            <div className="flex gap-4">
              {/* Card Order: Black (Total) then Green (Active) */}
              <StatCard count={stats?.totalCar || 0} label="سيارة" icon={FaCar} bottomColor="bg-black" />
              <StatCard count={stats?.totalBike || 0} label="دراجة نارية" icon={FaMotorcycle} bottomColor="bg-black" />
              <StatCard count={stats?.activeNowCar || 0} label="نشط الآن" icon={FaCar} bottomColor="bg-green-700" />
              <StatCard count={stats?.activeNowBike || 0} label="نشط الآن" icon={FaMotorcycle} bottomColor="bg-green-700" />
            </div>

            {/* Add Button - Left */}
            <button
               onClick={() => setShowAddRepModal(true)}
               className="bg-green-800 text-white font-bold px-10 py-2.5 rounded shadow hover:bg-green-900 transition-colors"
             >
               اضافة جديد
             </button>
          </div>

          {/* Search Bar Row - Separated to avoid crowding */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث برقم الهاتف أو رقم اللوحة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-10 py-2.5 focus:ring-2 focus:ring-green-800 outline-none shadow-sm bg-white"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Representatives Table */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#0c0c0c] text-white">
                <tr>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">الصورة</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">الاسم</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">رقم اللوحة</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">الطلبات المكتملة</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">الطلبات الملغية</th>
                  <th className="py-4 px-4 text-sm font-bold border-l border-gray-700">الحالة</th>
                  <th className="py-4 px-4 text-sm font-bold">تعديل / حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-gray-500">لا يوجد نتائج للبحث</td>
                  </tr>
                ) : (
                  filteredReps.map((r) => (
                    <tr key={r.id || (r as any).Id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <img 
                          src={r.imageUrl || (r as any).ImageUrl || "https://via.placeholder.com/48"} 
                          alt={r.name || (r as any).Name} 
                          className="w-12 h-12 rounded object-cover border border-gray-200 mx-auto" 
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800">{r.name || (r as any).Name}</td>
                      <td className="py-4 px-4 font-mono font-medium text-gray-700">{r.plateNumber || (r as any).PlateNumber}</td>
                      <td className="py-4 px-4 font-bold">{r.completedOrders || (r as any).CompletedOrders}</td>
                      <td className="py-4 px-4 font-bold">{r.cancelledOrders || (r as any).CancelledOrders}</td>
                      <td className="py-4 px-4">
                        <span className={`font-bold ${(r.status || (r as any).Status) === "مفعل" ? "text-green-600" : (r.status || (r as any).Status) === "محظور" ? "text-red-600" : "text-orange-500"}`}>
                          {r.status || (r as any).Status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => { setEditingRep(r); setShowAddRepModal(true); }} className="text-gray-700 hover:text-black transition-colors" title="تعديل"><FaPencilAlt /></button>
                          <button onClick={() => handleDelete(r.id || (r as any).Id)} className="text-red-600 hover:text-red-800 transition-colors" title="حذف"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={() => setShowAddVehicleModal(true)}
            className="mt-4 text-gray-400 text-[10px] hover:text-gray-600 transition-colors"
          >
            إعدادات المركبات
          </button>
        </div>
      </div>

      {showAddRepModal && (
        <AddRepresentativeModal
          representative={editingRep}
          onClose={() => { setShowAddRepModal(false); setEditingRep(null); }}
          onAdded={fetchData}
        />
      )}

      {showAddVehicleModal && (
        <AddVehicleTypeModal
          onClose={() => setShowAddVehicleModal(false)}
          onAdded={fetchData}
        />
      )}
    </div>
  );
}
