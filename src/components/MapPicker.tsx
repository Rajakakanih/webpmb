import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css'; // Import CSS pencarian
import L from 'leaflet';
import { Layers, Map } from 'lucide-react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

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

// Komponen Pengendali Klik Manual pada Peta
function LocationMarker({ onLocationSelect, initialLocation, setCenter }: MapPickerProps & { setCenter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>> }) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null
  );

  // Sinkronisasi posisi marker jika initialLocation (center) berubah dari luar (misal dari GPS/Pencarian)
  useEffect(() => {
    if (initialLocation) {
      setPosition(new L.LatLng(initialLocation.lat, initialLocation.lng));
    }
  }, [initialLocation]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Komponen untuk Kotak Pencarian Alamat
function SearchField({ onLocationSelect, setCenter }: { onLocationSelect: (lat: number, lng: number) => void; setCenter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>> }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'id', // Mengutamakan hasil pencarian dalam Bahasa Indonesia
        countrycodes: 'id',     // Batasi pencarian hanya di Indonesia (opsional, hapus jika ingin global)
      },
    });

    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar', // Menggunakan gaya 'bar' agar terlihat rapi di pojok kiri atas
      showMarker: false, // Dimatikan karena kita menggunakan custom LocationMarker di atas
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: 'Cari alamat atau tempat...',
    });

    map.addControl(searchControl);

    // Event ketika user memilih lokasi dari hasil pencarian
    map.on('geosearch/showlocation', (result: any) => {
      const { x: lng, y: lat } = result.location;
      setCenter({ lat, lng });
      onLocationSelect(lat, lng);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect, setCenter]);

  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const defaultCenter = initialLocation || { lat: -6.200000, lng: 106.816666 };
  const [center, setCenter] = useState<{lat: number, lng: number}>(defaultCenter);
  const [mapKey, setMapKey] = useState(0); 
  
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

      <div className="h-[350px] w-full rounded-lg overflow-hidden border border-slate-300 z-0 relative shadow-inner">
        
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

          {/* Menambahkan Fitur Pencarian */}
          <SearchField onLocationSelect={onLocationSelect} setCenter={setCenter} />

          {/* Marker Lokasi Aktif */}
          <LocationMarker onLocationSelect={onLocationSelect} initialLocation={center} setCenter={setCenter} />
        </MapContainer>
      </div>
    </div>
  );
}
