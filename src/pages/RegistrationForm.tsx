import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Layers, Navigation, Crosshair } from 'lucide-react';
import L from 'leaflet';
import Swal from 'sweetalert2';

// Perbaikan bug ikon marker default pada Leaflet di React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  schoolCoordinate?: string;
  savedLocation?: { lat: number; lng: number } | null;
}

// Komponen internal untuk menangani aksi klik pengguna di peta
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Komponen internal untuk mengontrol pergerakan kamera peta secara dinamis
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, schoolCoordinate, savedLocation }: MapPickerProps) {
  // Koordinat default (bisa diarahkan ke koordinat sekolah jika draf kosong)
  const [defaultLat, defaultLng] = schoolCoordinate 
    ? schoolCoordinate.split(',').map(s => parseFloat(s.trim())) 
    : [-3.316667, 114.583333]; // Fallback kordinat random jika kosong

  const [position, setPosition] = useState<[number, number] | null>(() => {
    return savedLocation ? [savedLocation.lat, savedLocation.lng] : null;
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([defaultLat, defaultLng]);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sinkronisasi jika ada lokasi yang dimuat dari localStorage
  useEffect(() => {
    if (savedLocation) {
      setPosition([savedLocation.lat, savedLocation.lng]);
      setMapCenter([savedLocation.lat, savedLocation.lng]);
    }
  }, [savedLocation]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  // FITUR: Deteksi Lokasi Otomatis via GPS Gawai / Browser
  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Tidak Didukung', 'Browser Anda tidak mendukung fitur deteksi lokasi.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        onLocationSelect(latitude, longitude);
        setIsLocating(false);
        Swal.fire({
          icon: 'success',
          title: 'Lokasi Ditemukan!',
          text: 'Peta telah otomatis diarahkan ke titik GPS rumah Anda.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = 'Gagal mengakses GPS rumah Anda.';
        if (err.code === 1) errorMsg = 'Izin GPS ditolak. Mohon aktifkan izin lokasi di browser Anda.';
        Swal.fire('Gagal Mendeteksi', errorMsg, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // FITUR: Navigasi Cepat Kembali ke Titik Sekolah
  const handleRecenterSchool = () => {
    setMapCenter([defaultLat, defaultLng]);
  };

  return (
    <div className="relative w-full h-full min-h-[350px]">
      {/* Tombol Kontrol Kustom Terapung di Atas Peta */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Tombol GPS Otomatis */}
        <button
          type="button"
          onClick={handleAutoLocation}
          disabled={isLocating}
          className="bg-white hover:bg-slate-100 text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all flex items-center justify-center disabled:opacity-50"
          title="Gunakan Lokasi Saya Saat Ini (GPS)"
        >
          <Crosshair size={18} className={`${isLocating ? 'animate-spin text-blue-600' : 'text-slate-700'}`} />
        </button>

        {/* Tombol Alih Pandangan Satelit / Jalanan */}
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className={`p-2.5 rounded-xl shadow-lg border transition-all flex items-center justify-center ${
            isSatellite 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
          title="Ubah Tampilan Satelit"
        >
          <Layers size={18} />
        </button>

        {/* Tombol Navigasi Lompat Ke Sekolah */}
        <button
          type="button"
          onClick={handleRecenterSchool}
          className="bg-white hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all flex items-center justify-center"
          title="Arahkan Kamera ke Sekolah"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Container Utama Leaflet */}
      <MapContainer 
        center={mapCenter} 
        zoom={15} 
        className="w-full h-full"
        zoomControl={true} // Tombol navigasi standar bawaan Leaflet (+ / -)
      >
        <MapController center={mapCenter} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Switch Layer Tampilan Peta */}
        {isSatellite ? (
          <TileLayer
            attribution='&copy; Imagery &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
            url="https://arcgisonline.com{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Marker Pin Rumah Calon Siswa */}
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}
