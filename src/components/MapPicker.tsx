import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, Map } from 'lucide-react'; // Menggunakan lucide-react agar serasi dengan Navbar sebelumnya

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

function LocationMarker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null
  );

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const defaultCenter = initialLocation || { lat: -6.200000, lng: 106.816666 };
  const [center, setCenter] = useState<{lat: number, lng: number}>(defaultCenter);
  const [mapKey, setMapKey] = useState(0); 
  
  // State baru untuk mengatur tipe peta: 'streets' atau 'satellite'
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          onLocationSelect(latitude, longitude);
          setMapKey(prev => prev + 1);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Tidak dapat mengambil lokasi saat ini. Pastikan izin lokasi diberikan.");
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser ini.");
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGetLocation}
        className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-md transition-colors flex items-center gap-2 border border-slate-300 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        Gunakan Lokasi Saat Ini
      </button>

      <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 z-0 relative shadow-inner">
        
        {/* Tombol Switcher Mode Peta Futuristik di Atas Peta */}
        <div className="absolute top-3 right-3 z-[1000] flex bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-lg">
          <button
            type="button"
            onClick={() => setMapMode('streets')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === 'streets'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Map size={14} />
            Peta Jalan
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === 'satellite'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Layers size={14} />
            Satelit
          </button>
        </div>

        {/* Kontainer Peta */}
        <MapContainer key={mapKey} center={[center.lat, center.lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full z-0">
          
          {/* Kondisi untuk memuat layer berdasarkan mode yang aktif */}
          {mapMode === 'streets' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          <LocationMarker onLocationSelect={onLocationSelect} initialLocation={center} />
        </MapContainer>
      </div>
    </div>
  );
}
