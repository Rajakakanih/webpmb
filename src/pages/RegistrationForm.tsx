import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, AlertCircle, FileText, Loader2, MapPin, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { submitRegistration, RegistrationData } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import jsPDF from 'jspdf';
import MapPicker from '../components/MapPicker';
import { calculateDistance } from '../utils/distance';

// Kunci unik untuk penyimpanan lokal (Hanya untuk data teks & lokasi)
const LOCAL_STORAGE_KEY = 'pmb_registration_form_data';
const LOCATION_STORAGE_KEY = 'pmb_registration_location_data';

export default function RegistrationForm() {
  const { settings } = useSettings();
  const isClosed = settings?.statusPendaftaran === 'Tutup';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  // State data formulir teks
  const [formData, setFormData] = useState<RegistrationData>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // State khusus untuk menampung file object asli (Tidak disimpan ke localStorage)
  const [fileFields, setFileFields] = useState<Record<string, File>>({});

  // State untuk menyimpan URL pratinjau gambar sementara (Object URL)
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(() => {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [distance, setDistance] = useState<number | null>(null);

  // Efek samping untuk memantau perubahan data teks formulir
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (mapLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(mapLocation));
      
      if (settings?.koordinatSekolah) {
        const [schoolLat, schoolLng] = settings.koordinatSekolah.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(schoolLat) && !isNaN(schoolLng)) {
          const dist = calculateDistance(mapLocation.lat, mapLocation.lng, schoolLat, schoolLng);
          setDistance(dist);
        }
      }
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      setDistance(null);
    }
  }, [mapLocation, settings?.koordinatSekolah]);

  // Membersihkan Object URL pratinjau dari memori jika komponen unmount
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleClearDraft = () => {
    Swal.fire({
      title: 'Hapus Draf Formulir?',
      text: 'Semua data yang telah Anda ketik dan unggah akan dibersihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Bersihkan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCATION_STORAGE_KEY);
        
        // Revoke previews URLs sebelum dihapus
        Object.values(previews).forEach(url => URL.revokeObjectURL(url));
        
        setFormData({});
        setFileFields({});
        setPreviews({});
        setMapLocation(null);
        setDistance(null);
        setIsAgreed(false);
        Swal.fire('Dibersihkan!', 'Formulir kembali kosong.', 'success');
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran maksimal berkas unggahan adalah 5MB',
        confirmButtonColor: '#3b82f6'
      });
      e.target.value = '';
      return;
    }

    // Simpan file asli ke state terpisah
    setFileFields(prev => ({ ...prev, [fieldId]: file }));

    // Hapus preview lama jika ada untuk menghemat memori RAM
    if (previews[fieldId] && previews[fieldId].startsWith('blob:')) {
      URL.revokeObjectURL(previews[fieldId]);
    }

    // Buat DOM String blob URL untuk pratinjau (sangat cepat & hemat penyimpanan)
    const objectUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [fieldId]: objectUrl }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapLocation({ lat, lng });
    setFormData(prev => ({ ...prev, 'Koordinat Lokasi': `${lat}, ${lng}` }));
    
    if (settings?.koordinatSekolah) {
      const [schoolLat, schoolLng] = settings.koordinatSekolah.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(schoolLat) && !isNaN(schoolLng)) {
        const dist = calculateDistance(lat, lng, schoolLat, schoolLng);
        setDistance(dist);
        setFormData(prev => ({ ...prev, 'Jarak ke Sekolah (km)': dist.toFixed(2) }));
      }
    }
  };

  // Fungsi pembantu untuk mengubah berkas menjadi base64 secara asinkron saat submit
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const printProof = (noPendaftaran: string) => {
    const doc = new jsPDF();
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PENDAFTARAN PMB", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(settings?.namaSekolah || "MTs Manbaul Ulum Astambul", 105, 30, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let startY = 60;
    const lineHeight = 8;
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    doc.setFont("helvetica", "bold");
    doc.text("No. Pendaftaran", 20, startY);
    doc.text(":", 70, startY);
    doc.text(noPendaftaran, 75, startY);
    startY += lineHeight + 4;

    doc.setFont("helvetica", "normal");
    
    settings?.formFields?.forEach((field: any) => {
      if (field.type !== 'file') {
        if (startY > 250) {
          doc.addPage();
          startY = 20;
        }

        doc.text(field.label, 20, startY);
        doc.text(":", 70, startY);
        let value = (formData[field.label] as string) || '-';
        if (field.type === 'date') {
          value = formatDate(value);
        }
        
        const splitText = doc.splitTextToSize(value, 115);
        doc.text(splitText, 75, startY);
        startY += lineHeight * splitText.length + 2;
      }
    });

    if (formData['Koordinat Lokasi']) {
      doc.text("Koordinat Rumah", 20, startY);
      doc.text(":", 70, startY);
      doc.text(formData['Koordinat Lokasi'] as string, 75, startY);
      startY += lineHeight;
      
      if (formData['Jarak ke Sekolah (km)']) {
        doc.text("Jarak ke Sekolah", 20, startY);
        doc.text(":", 70, startY);
        doc.text(`${formData['Jarak ke Sekolah (km)']} KM`, 75, startY);
      }
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Simpan bukti pendaftaran ini untuk mengecek status kelulusan.", 105, 280, { align: "center" });
    
    doc.save(`Bukti_Pendaftaran_${noPendaftaran}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAgreed) {
      Swal.fire({
        icon: 'warning',
        title: 'Pernyataan Belum Disetujui',
        text: 'Anda harus menyetujui pernyataan kebenaran data sebelum mengirim formulir.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Validasi keberadaan file berkas yang diwajibkan
    const missingFiles = settings?.formFields?.filter((f: any) => f.type === 'file' && f.required && !fileFields[f.label]);
    if (missingFiles && missingFiles.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Berkas Belum Lengkap',
        text: `Mohon unggah dokumen: ${missingFiles.map((f: any) => f.label).join(', ')}`,
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!mapLocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi Belum Ditandai',
        text: 'Mohon tandai lokasi rumah Anda di peta.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Satukan data teks dengan data file yang baru dikonversi ke Base64 saat hendak dikirim ke API
      const finalPayload = { ...formData };
      
      for (const key in fileFields) {
        if (fileFields[key]) {
          finalPayload[key] = await fileToBase64(fileFields[key]);
        }
      }

      const response = await submitRegistration(finalPayload);
      
      if (response.status === 'success') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(LOCATION_STORAGE_KEY);

        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berhasil!',
          html: `Nomor Pendaftaran Anda:<br><b style="font-size: 1.5rem; color: #2563eb;">${response.noPendaftaran}</b><br><br>Simpan nomor ini untuk mengecek status kelulusan.`,
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Unduh Bukti Pendaftaran',
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            printProof(response.noPendaftaran);
          }
          window.location.href = '/';
        });
      } else {
        throw new Error(response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center p-8">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pendaftaran Ditutup</h2>
          <p className="text-slate-600 mb-8">
            Mohon maaf, pendaftaran murid baru saat ini sedang ditutup. Silakan kembali lagi nanti atau hubungi pihak sekolah untuk informasi lebih lanjut.
          </p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const renderField = (field: any) => {
    const commonClasses = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.label}
            required={field.required}
            onChange={handleChange}
            value={(formData[field.label] as string) || ''}
            className={`${commonClasses} h-24 resize-none`}
            placeholder={`Masukkan ${field.label}...`}
          />
        );
      case 'select':
        return (
          <select
            name={field.label}
            required={field.required}
            onChange={handleChange}
            value={(formData[field.label] as string) || ''}
            className={commonClasses}
          >
            <option value="">-- Pilih {field.label} --</option>
            {field.options?.map((opt: string, i: number) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'file':
        const hasFile = fileFields[field.label] || previews[field.label];
        const isImage = fileFields[field.label]?.type.startsWith('image/') || previews[field.label]?.startsWith('blob:');

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {hasFile ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <FileText size={24} />
                      <span className="text-sm font-medium">
                        {fileFields[field.label]?.name || "Berkas Terunggah"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-500"><span className="font-semibold">Klik untuk unggah</span> atau seret berkas</p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG (Max. 5MB)</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => handleFileChange(e, field.label)} 
                  required={field.required && !fileFields[field.label]}
                />
              </label>
            </div>
            {previews[field.label] && isImage && (
              <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                <img src={previews[field.label]} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            name={field.label}
            required={field.required}
            onChange={handleChange}
            value={(formData[field.label] as string) || ''}
            className={commonClasses}
            placeholder={`Masukkan ${field.label}...`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Formulir Pendaftaran Siswa Baru</h1>
            <p className="text-blue-100 mt-2">{settings?.namaSekolah || "MTs Manbaul Ulum Astambul"}</p>
          </div>
          {(Object.keys(formData).length > 0 || Object.keys(fileFields).length > 0) && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
            >
              <Trash2 size={14} />
              <span>Bersihkan Draf</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings?.formFields?.map((field: any, index: number) => (
              <div key={index} className={`space-y-1 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                <label className="text-sm font-semibold text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center space-x-2 text-slate-800">
              <MapPin className="text-blue-600" />
              <h2 className="text-lg font-bold">Zonasi & Lokasi Rumah</h2>
            </div>
            <p className="text-sm text-slate-500">Silakan tandai lokasi tempat tinggal Anda pada peta di bawah ini untuk kalkulasi jarak zonasi sekolah.</p>
            
            <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-300">
              <MapPicker 
                onLocationSelect={handleLocationSelect} 
                schoolCoordinate={settings?.koordinatSekolah}
              />
            </div>

            {distance !== null && (
              <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                Estimasi jarak dari rumah Anda ke sekolah: <span className="font-bold text-base">{distance.toFixed(2)} km</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm text-slate-600">
                Saya menyatakan dengan sebenar-benarnya bahwa seluruh data dan dokumen yang saya unggah adalah sah, benar, dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Kirim Pendaftaran</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
