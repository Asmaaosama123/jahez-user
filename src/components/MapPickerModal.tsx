import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: [number, number] | null;
  onConfirm: (coords: [number, number]) => void;
}

function MapEventsHelper({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  return null;
}

export default function MapPickerModal({ isOpen, onClose, initialCoords, onConfirm }: MapPickerModalProps) {
  const [coords, setCoords] = useState<[number, number] | null>(initialCoords || [18.0735, -15.9582]);

  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleLocateCurrent = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          alert("تعذر تحديد موقعك الحالي: " + err.message);
        }
      );
    } else {
      alert("تحديد الموقع الجغرافي غير مدعوم في متصفحك.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-60 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            📍 تحديد موقع المطعم على الخريطة
          </h3>
          <button type="button" onClick={onClose} className="text-white text-2xl hover:text-gray-300">
            &times;
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={coords || [18.0735, -15.9582]}
            zoom={12}
            maxBounds={[[17.9, -16.2], [18.2, -15.7]]}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventsHelper onClick={(latlng) => setCoords([latlng.lat, latlng.lng])} />
            {coords && <Marker position={coords} icon={DefaultIcon} />}
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between gap-3 border-t">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 self-center font-mono">
            {coords ? `الموقع المحدد: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}` : "اضغط على الخريطة لتحديد موقع"}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleLocateCurrent}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
            >
              موقعي الحالي 🛰️
            </button>
            <button
              type="button"
              onClick={() => {
                if (coords) {
                  onConfirm(coords);
                  onClose();
                }
              }}
              disabled={!coords}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-50"
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
