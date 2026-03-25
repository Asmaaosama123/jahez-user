import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/apiConfig";

const BASE = BASE_URL;

interface VehicleType {
  id: number;
  name: string;
}

interface AddRepresentativeModalProps {
  onClose: () => void;
  onAdded: () => void;
  representative?: any;
}

const AddRepresentativeModal: React.FC<AddRepresentativeModalProps> = ({ onClose, onAdded, representative }) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Normalize representative properties for safer access
  const rep = representative ? {
    id: representative.id || representative.Id,
    name: representative.name || representative.Name,
    identificationNumber: representative.identificationNumber || representative.IdentificationNumber,
    vehicleTypeId: representative.vehicleTypeId || representative.VehicleTypeId,
    plateNumber: representative.plateNumber || representative.PlateNumber,
    phone: representative.phone || representative.Phone,
    balance: representative.balance || representative.Balance || 0,
    status: representative.status || representative.Status,
    imageUrl: representative.imageUrl || representative.ImageUrl
  } : null;

  const [form, setForm] = useState({
    Id: rep?.id || 0,
    Name: rep?.name || "",
    IdentificationNumber: rep?.identificationNumber || "",
    VehicleTypeId: rep?.vehicleTypeId || "",
    PlateNumber: rep?.plateNumber || "",
    Phone: rep?.phone || "",
    Balance: rep?.balance || 0,
    Status: rep?.status || "مفعل",
    Image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(rep?.imageUrl || null);

  useEffect(() => {
    fetch(`${BASE}/api/VehicleTypes`)
      .then(res => res.json())
      .then(data => {
        setVehicleTypes(data);
        if (data.length > 0 && !form.VehicleTypeId) {
          setForm(prev => ({ ...prev, VehicleTypeId: data[0].id || data[0].Id }));
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setForm(prev => ({ ...prev, Image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const data = new FormData();
    // Ensure all required fields are present in FormData
    data.append("Id", form.Id.toString());
    data.append("Name", form.Name);
    data.append("IdentificationNumber", form.IdentificationNumber);
    data.append("VehicleTypeId", form.VehicleTypeId.toString());
    data.append("PlateNumber", form.PlateNumber);
    data.append("Phone", form.Phone);
    data.append("Balance", form.Balance.toString());
    data.append("Status", form.Status);
    
    if (form.Image) {
      data.append("Image", form.Image);
    }

    try {
      const isEdit = !!rep && rep.id > 0;
      const url = isEdit ? `${BASE}/api/DeliveryRepresentatives/${rep.id}` : `${BASE}/api/DeliveryRepresentatives`;
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, { method, body: data });

      if (res.ok) {
        setStatusMsg({ type: "success", text: isEdit ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح" });
        setTimeout(() => {
          onAdded();
          onClose();
        }, 1200);
      } else {
        const errText = await res.text();
        console.error("Save Error:", errText);
        setStatusMsg({ type: "error", text: "حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى." });
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: "error", text: "تعذر الاتصال بالخادم." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          <div className="flex justify-center mb-6">
            <label className="relative w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-400 hover:border-green-600 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center text-gray-400">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg text-center text-sm font-bold animate-in fade-in ${statusMsg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="space-y-3">
            <input 
              type="text" name="Name" value={form.Name} onChange={handleChange} 
              placeholder="الاسم الكامل" required 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right focus:outline-none focus:border-green-800" 
            />
            
            <input 
              type="text" name="IdentificationNumber" value={form.IdentificationNumber} onChange={handleChange} 
              placeholder="بطاقة التعريف" required 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right focus:outline-none focus:border-green-800" 
            />

            <div className="pt-2 text-right">
              <p className="text-xs font-bold text-gray-800 mb-1">تفاصيل المركبة</p>
              <select 
                name="VehicleTypeId" value={form.VehicleTypeId} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right appearance-none cursor-pointer focus:outline-none"
              >
                {vehicleTypes.map(vt => <option key={vt.id || (vt as any).Id} value={vt.id || (vt as any).Id}>{vt.name || (vt as any).Name}</option>)}
              </select>
            </div>

            <input 
              type="text" name="PlateNumber" value={form.PlateNumber} onChange={handleChange} 
              placeholder="رقم اللوحة" required 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right focus:outline-none focus:border-green-800" 
            />

            <div className="pt-2 text-right">
              <p className="text-xs font-bold text-gray-800 mb-1">تفاصيل الحساب</p>
              <input 
                type="tel" name="Phone" value={form.Phone} onChange={handleChange} 
                placeholder="الهاتف" required 
                className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right focus:outline-none focus:border-green-800" 
              />
            </div>

            <input 
              type="number" name="Balance" value={form.Balance} onChange={handleChange} 
              placeholder="الرصيد" 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right focus:outline-none focus:border-green-800" 
            />

            <select 
              name="Status" value={form.Status} onChange={handleChange} 
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-2.5 text-right appearance-none cursor-pointer focus:outline-none"
            >
              <option value="مفعل">مفعل</option>
              <option value="متوقف">متوقف</option>
              <option value="محظور">محظور</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
             <button 
              type="submit" disabled={loading} 
              className="flex-1 py-2.5 bg-green-800 text-white rounded font-bold hover:bg-green-900 transition-all disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button 
              type="button" onClick={onClose} 
              className="flex-1 py-2.5 border border-red-600 text-red-600 bg-white rounded font-bold hover:bg-red-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepresentativeModal;
