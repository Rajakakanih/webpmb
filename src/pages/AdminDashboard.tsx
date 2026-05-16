import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Download, Printer, CheckCircle,
XCircle, Clock, FileText, Moon, Sun, Loader2, LogOut, Eye, X, Settings,
LayoutDashboard, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getRegistrations, updateStatus, AdminData,
updateSettings } from '../services/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
 
const compressImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
 
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
 
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};
 
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
 
const calculateAge = (dateString: string, cutoffDateString?: string) => {
  if (!dateString) return '-';
  const birthDate = new Date(dateString);
  if (isNaN(birthDate.getTime())) return '-';
  
  let today = new Date();
  if (cutoffDateString) {
    const cutoff = new Date(cutoffDateString);
    if (!isNaN(cutoff.getTime())) {
      today = cutoff;
    }
  }
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
 
  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return `${years} Tahun ${months} Bulan ${days} Hari`;
};
 
export default function AdminDashboard() {
  const { settings, refreshSettings } = useSettings();
  const [data, setData] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [settingsTab, setSettingsTab] = useState<'school' | 'form' | 'surat' | 'daftar-ulang' | 'kepala-sekolah' | 'panduan'>('school');
  const itemsPerPage = 10;
  const navigate = useNavigate();
 
  // Settings State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
 
  const getFieldValue = (item: any, fieldId: string) => {
    const field = settings?.formFields?.find(f => f.id === fieldId);
    if (field && item[field.label] !== undefined) {
      return item[field.label];
    }
    return item[fieldId];
  };
 
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
 
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);
 
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getRegistrations();
      setData(result);
    } catch (error) {
      Swal.fire('Error', 'Gagal mengambil data dari server', 'error');
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar?',
      text: "Anda akan keluar dari sesi admin.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('isAdmin');
        navigate('/admin/login');
      }
    });
  };
 
  const handleUpdateStatus = async (noPendaftaran: string, newStatus: string) => {
    try {
      let alasan = undefined;
      
      if (newStatus === 'Tidak Lulus') {
        const { value: text, isConfirmed } = await Swal.fire({
          title: 'Alasan Tidak Lulus',
          input: 'textarea',
          inputLabel: 'Berikan alasan mengapa pendaftar tidak lulus',
          inputPlaceholder: 'Contoh: Usia belum mencukupi...',
          showCancelButton: true,
          confirmButtonText: 'Simpan',
          cancelButtonText: 'Batal',
          inputValidator: (value) => {
            if (!value) {
              return 'Alasan harus diisi!';
            }
          }
        });
        
        if (!isConfirmed) return;
        alasan = text;
      }
 
      Swal.fire({
        title: 'Memproses...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
 
      await updateStatus(noPendaftaran, newStatus, alasan);
      
      setData(prev => prev.map(item => 
        item['No Pendaftaran'] === noPendaftaran ? { ...item, Status: newStatus as any, 'Alasan Penolakan': alasan } : item
      ));
 
      if (selectedStudent && selectedStudent['No Pendaftaran'] === noPendaftaran) {
        setSelectedStudent(prev => prev ? { ...prev, Status: newStatus as any, 'Alasan Penolakan': alasan } : null);
      }
 
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Status berhasil diubah menjadi ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', 'Gagal mengupdate status', 'error');
    }
  };
 
  const handleSaveSettings = async () => {
    if (!localSettings) return;
    setIsSavingSettings(true);
    try {
      await updateSettings(localSettings);
      await refreshSettings();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Pengaturan berhasil disimpan',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };
 
  const exportToExcel = () => {
    const exportData = data.map(item => {
      const formattedItem: any = { ...item };
      
      const tglLahir = getFieldValue(item, 'Tanggal Lahir');
      if (tglLahir) {
        formattedItem['Tanggal Lahir'] = formatDate(tglLahir);
        formattedItem['Usia'] = calculateAge(tglLahir, settings?.tanggalCutoffUsia);
      }
      
      if (item['Koordinat Lokasi']) {
        formattedItem['Link Maps'] = `https://www.google.com/maps/search/?api=1&query=${item['Koordinat Lokasi']}`;
      }
      
      Object.keys(formattedItem).forEach(key => {
        if (typeof formattedItem[key] === 'string' && formattedItem[key].startsWith('data:')) {
          formattedItem[key] = 'File Terlampir (Lihat di Dashboard)';
        }
      });
      
      return formattedItem;
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftar");
    XLSX.writeFile(wb, `Data_PPDB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
 
  const printCard = (student: AdminData) => {
    const doc = new jsPDF();
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("KARTU PENDAFTARAN PPDB", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(settings?.namaSekolah || "Sekolah Dasar", 105, 30, { align: "center" });
 
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const startY = 60;
    const lineHeight = 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("No. Pendaftaran:", 20, startY);
    doc.setFont("helvetica", "normal");
    doc.text(student['No Pendaftaran'], 70, startY);
 
    doc.setFont("helvetica", "bold");
    doc.text("Nama Lengkap:", 20, startY + lineHeight);
    doc.setFont("helvetica", "normal");
    doc.text(getFieldValue(student, 'Nama Lengkap') || '-', 70, startY + lineHeight);
 
    doc.setFont("helvetica", "bold");
    doc.text("NIK:", 20, startY + lineHeight * 2);
    doc.setFont("helvetica", "normal");
    doc.text(getFieldValue(student, 'NIK') || '-', 70, startY + lineHeight * 2);
 
    doc.setFont("helvetica", "bold");
    doc.text("TTL:", 20, startY + lineHeight * 3);
    doc.setFont("helvetica", "normal");
    doc.text(`${getFieldValue(student, 'Tempat Lahir') || '-'}, ${formatDate(getFieldValue(student, 'Tanggal Lahir'))}`, 70, startY + lineHeight * 3);
 
    doc.setFont("helvetica", "bold");
    doc.text("Usia:", 20, startY + lineHeight * 4);
    doc.setFont("helvetica", "normal");
    doc.text(calculateAge(getFieldValue(student, 'Tanggal Lahir'), settings?.tanggalCutoffUsia), 70, startY + lineHeight * 4);
 
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 20, startY + lineHeight * 5);
    doc.setFont("helvetica", "normal");
    doc.text(student.Status, 70, startY + lineHeight * 5);
 
    doc.setDrawColor(200, 200, 200);
    doc.line(20, startY + lineHeight * 7, 190, startY + lineHeight * 7);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Kartu ini adalah bukti sah pendaftaran PPDB ${settings?.namaSekolah || 'Sekolah'}.`, 105, startY + lineHeight * 8, { align: "center" });
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 105, startY + lineHeight * 8.5, { align: "center" });
 
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 150);
 
    doc.save(`Kartu_PPDB_${student['No Pendaftaran']}.pdf`);
  };
 
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const nama = getFieldValue(item, 'Nama Lengkap') || '';
      const nik = getFieldValue(item, 'NIK') || '';
      const no = item['No Pendaftaran'] || '';
      
      const matchesSearch = nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           nik.includes(searchTerm) ||
                           no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'Semua' || item.Status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, statusFilter]);
 
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lulus':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 shadow-sm"><CheckCircle size={12} /> Lulus</span>;
      case 'Tidak Lulus':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/50 shadow-sm"><XCircle size={12} /> Tidak Lulus</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50 shadow-sm"><Clock size={12} /> Proses</span>;
    }
  };
 
  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
              Dashboard Admin
            </h1>
            <p className={cn("mt-2 text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              Kelola data pendaftaran PPDB <span className="text-blue-600 dark:text-blue-400 font-semibold">{settings?.namaSekolah || 'Sekolah'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn("p-2.5 rounded-xl transition-all duration-200 shadow-md border active:scale-95", 
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800 shadow-black/40" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={19} className="drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" /> : <Moon size={19} />}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-red-500/20 active:scale-95"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="flex border-b mb-8 border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all relative",
              activeTab === 'dashboard' 
                ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            <LayoutDashboard size={18} /> Data Pendaftar
            {activeTab === 'dashboard' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all relative",
              activeTab === 'settings' 
                ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            <Settings size={18} /> Pengaturan
            {activeTab === 'settings' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />}
          </button>
        </div>
 
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
              {[
                { label: 'Total Pendaftar', value: data.length, color: 'from-blue-600 to-blue-500 shadow-blue-500/20 text-white' },
                { label: 'Lulus', value: data.filter(item => item.Status === 'Lulus').length, color: 'from-emerald-600 to-emerald-500 shadow-emerald-500/20 text-white' },
                { label: 'Tidak Lulus', value: data.filter(item => item.Status === 'Tidak Lulus').length, color: 'from-rose-600 to-rose-500 shadow-rose-500/20 text-white' },
                { label: 'Laki-laki', value: data.filter(item => { const jk = getFieldValue(item, 'Jenis Kelamin'); return jk && jk.toLowerCase().includes('laki'); }).length, color: 'from-indigo-600 to-indigo-500 shadow-indigo-500/20 text-white' },
                { label: 'Perempuan', value: data.filter(item => { const jk = getFieldValue(item, 'Jenis Kelamin'); return jk && jk.toLowerCase().includes('perempuan'); }).length, color: 'from-pink-600 to-pink-500 shadow-pink-500/20 text-white' },
              ].map((stat, idx) => (
                <div key={idx} className={cn("p-5 rounded-2xl bg-gradient-to-br border border-white/10 flex flex-col items-center justify-center text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl")}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-85 mb-2">{stat.label}</span>
                  <span className="text-4xl font-extrabold tracking-tight drop-shadow-md">{stat.value}</span>
                </div>
              ))}
            </div>
 
            {/* Filters & Search */}
            <div className={cn("rounded-2xl shadow-xl border p-5 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center transition-all duration-300", 
              isDarkMode ? "bg-slate-900 border-slate-800/80 shadow-black/20" : "bg-white border-slate-200/80"
            )}>
              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nama, NIK, atau No. Pendaftaran..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className={cn("block w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-inner", 
                    isDarkMode ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter size={18} className="text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className={cn("block w-full py-2.5 pl-3 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all shadow-sm cursor-pointer",
                      isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-700"
                    )}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Proses">Proses</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Tidak Lulus">Tidak Lulus</option>
                  </select>
                </div>
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60 active:scale-95"
                >
                  <RefreshCw size={16} className={cn(isLoading && "animate-spin")} /> Segarkan
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-emerald-500/10 active:scale-95"
                >
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
 
            {/* Table */}
            <div className={cn("rounded-2xl shadow-xl border overflow-hidden transition-all duration-300", 
              isDarkMode ? "bg-slate-900 border-slate-800/80 shadow-black/30" : "bg-white border-slate-200/80"
            )}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className={isDarkMode ? "bg-slate-800/50 text-slate-300" : "bg-slate-100 text-slate-800"}>
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">No. Pendaftaran</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nama Lengkap</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Usia</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Jarak</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">NIK</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDarkMode ? "divide-slate-800" : "divide-slate-200")}>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Loader2 className="animate-spin h-9 w-9 mx-auto text-blue-500 mb-4" />
                          <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Memuat data pendaftar...</p>
                        </td>
                      </tr>
                    ) : currentData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="mx-auto h-14 w-14 text-slate-400 dark:text-slate-600 mb-4"><FileText size={56} className="mx-auto" /></div>
                          <p className={cn("text-sm font-semibold", isDarkMode ? "text-slate-500" : "text-slate-400")}>Tidak ada data yang cocok dengan kriteria pendaftaran</p>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          key={item['No Pendaftaran']} 
                          className={cn("transition-colors duration-150", isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80")}
                        >
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400 drop-shadow-sm">
                            {item['No Pendaftaran']}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{getFieldValue(item, 'Nama Lengkap') || '-'}</div>
                            <div className={cn("text-xs font-medium mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                              {getFieldValue(item, 'Tempat Lahir') || '-'}, {formatDate(getFieldValue(item, 'Tanggal Lahir'))}
                            </div>
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                            {calculateAge(getFieldValue(item, 'Tanggal Lahir'), settings?.tanggalCutoffUsia)}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {item['Jarak ke Sekolah (km)'] ? `${item['Jarak ke Sekolah (km)']} km` : '-'}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-950/40 rounded px-1.5 py-0.5 inline-block mt-3">
                            {getFieldValue(item, 'NIK') || '-'}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            {getStatusBadge(item.Status)}
                          </td>
                          <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setSelectedStudent(item)}
                                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm active:scale-95" 
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              {item.Status !== 'Lulus' && (
                                <button onClick={() => handleUpdateStatus(item['No Pendaftaran'], 'Lulus')}
                                  className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-600 rounded-xl transition-all shadow-sm active:scale-95" 
                                  title="Ubah ke Lulus"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {item.Status !== 'Tidak Lulus' && (
                                <button onClick={() => handleUpdateStatus(item['No Pendaftaran'], 'Tidak Lulus')}
                                  className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-600 rounded-xl transition-all shadow-sm active:scale-95" 
                                  title="Ubah ke Tidak Lulus"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              <button onClick={() => printCard(item)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-600 rounded-xl transition-all shadow-sm active:scale-95" 
                                title="Cetak Kartu"
                              >
                                <Printer size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
 
              {/* Pagination */}
              {!isLoading && filteredData.length > 0 && (
                <div className={cn("px-6 py-4.5 border-t flex flex-col sm:flex-row items-center justify-between gap-4", 
                  isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"
                )}>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-slate-800 dark:text-slate-200">{filteredData.length}</span> data
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 border rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 bg-transparent transition-all shadow-sm active:scale-95"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-1.5 border rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 bg-transparent transition-all shadow-sm active:scale-95"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {activeTab === 'settings' && localSettings && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <div className={cn("rounded-2xl shadow-xl border p-6 transition-all duration-300", 
              isDarkMode ? "bg-slate-900 border-slate-800/80 shadow-black/20" : "bg-white border-slate-200/80"
            )}>
              
              <div className="flex items-center gap-2 mb-6 border-b dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar">
                {[
                  { id: 'school', label: 'Pengaturan Sekolah' },
                  { id: 'form', label: 'Pengaturan Formulir' },
                  { id: 'surat', label: 'Pengaturan Surat' },
                  { id: 'daftar-ulang', label: 'Pengaturan Daftar Ulang' },
                  { id: 'kepala-sekolah', label: 'Kepala Sekolah' },
                  { id: 'panduan', label: 'Panduan Pendaftaran' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id as any)}
                    className={cn("px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap border active:scale-95",
                      settingsTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40 shadow-sm"
                        : "text-slate-500 border-transparent hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
 
              <div className="space-y-6">
                {settingsTab === 'school' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className={cn("block text-sm font-bold mb-2 transition-colors group-focus-within:text-blue-500", isDarkMode ? "text-slate-300" : "text-slate-700")}>Nama Sekolah</label>
                      <input
                        type="text"
                        value={localSettings.namaSekolah}
                        onChange={e => setLocalSettings({...localSettings, namaSekolah: e.target.value})}
                        className={cn("w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all shadow-inner", isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
