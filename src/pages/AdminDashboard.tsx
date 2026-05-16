import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Dipastikan penulisan package framer-motion tepat
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

// ... (Fungsi penunjang compressImage, formatDate, calculateAge tetap sama) ...

export default function AdminDashboard() {
  const { settings, refreshSettings } = useSettings();
  const [data, setData] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default diaktifkan dark mode untuk nuansa siber futuristik
  const [selectedStudent, setSelectedStudent] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [settingsTab, setSettingsTab] = useState<'school' | 'form' | 'surat' | 'daftar-ulang' | 'kepala-sekolah' | 'panduan'>('school');
  const itemsPerPage = 10;
  const navigate = useNavigate();
 
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
    if (settings) { setLocalSettings(settings); }
  }, [settings]);
 
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) { navigate('/admin/login'); return; }
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

  // ... (Fungsi handleLogout, handleUpdateStatus, handleSaveSettings, exportToExcel, printCard tetap sama) ...

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
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><CheckCircle size={12} /> Lulus</span>;
      case 'Tidak Lulus':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]"><XCircle size={12} /> Tidak Lulus</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"><Clock size={12} /> Proses</span>;
    }
  };
 
  return (
    <div className={cn("min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden", 
      isDarkMode ? "bg-[#080b11] text-slate-100 bg-radial-at-t from-slate-900 via-[#080b11] to-[#04060a]" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor Space Silhouette Effect */}
      {isDarkMode && <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-cyan-500/10 dark:border-slate-800/60 pb-5">
          <div className="flex items-center gap-3">
            {/* Logo/Icon Area */}
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="text-xl font-bold text-indigo-400">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.3)] uppercase">
                MTs Manbaul Ulum Astambul
              </h1>
              <p className={cn("mt-1 text-xs font-medium tracking-wide", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                Sistem Pusat Kontrol Panel PPDB Elektronis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn("p-2.5 rounded-xl transition-all duration-200 border active:scale-95", 
                isDarkMode 
                  ? "bg-slate-900/80 border-slate-700/60 text-yellow-400 hover:bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <Sun size={18} className="drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95"
            >
              <LogOut size={14} /> Daftar Sekarang
            </button>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="flex border-b mb-8 border-slate-800/80 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-5 py-3 text-xs font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all relative",
              activeTab === 'dashboard' 
                ? "border-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutDashboard size={16} /> Beranda
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-5 py-3 text-xs font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-all relative",
              activeTab === 'settings' 
                ? "border-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <Settings size={16} /> Admin Panel
          </button>
        </div>
 
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Statistics Row - Sesuai Dengan Foto (Desain Kristal Hologram Cosmic) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Pendaftar', sub: 'TOTAL USERS', value: data.length, color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-cyan-400' },
                { label: 'Lulus', sub: 'CONFIRMED', value: data.filter(item => item.Status === 'Lulus').length, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400' },
                { label: 'Tidak Lulus', sub: 'REJECTED', value: data.filter(item => item.Status === 'Tidak Lulus').length, color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400' },
                { label: 'Laki-laki', sub: 'MALE', value: data.filter(item => { const jk = getFieldValue(item, 'Jenis Kelamin'); return jk && jk.toLowerCase().includes('laki'); }).length, color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400' },
                { label: 'Perempuan', sub: 'FEMALE', value: data.filter(item => { const jk = getFieldValue(item, 'Jenis Kelamin'); return jk && jk.toLowerCase().includes('perempuan'); }).length, color: 'from-pink-500/20 to-fuchsia-500/10 border-pink-500/40 text-pink-400' },
              ].map((stat, idx) => (
                <div key={idx} className={cn("p-4 rounded-xl bg-gradient-to-b border backdrop-blur-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 shadow-[inset_0_0_12px_rgba(255,255,255,0.03)] bg-slate-900/60", stat.color)}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</span>
                  <span className="text-4xl font-black tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">{stat.value}</span>
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-2 border-t border-slate-800 w-full pt-1 block">{stat.sub}</span>
                </div>
              ))}
            </div>
 
            {/* Filters & Search - Futuristik Glass Container */}
            <div className={cn("rounded-2xl border p-4 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center backdrop-blur-md shadow-xl", 
              isDarkMode ? "bg-slate-900/40 border-slate-800/80 shadow-black/40" : "bg-white border-slate-200"
            )}>
              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={16} className="text-cyan-400/70" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nama, NIK, atau No. Pendaftaran..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className={cn("block w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-xs transition-all shadow-inner", 
                    isDarkMode ? "bg-slate-950/80 border-slate-800 text-white placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter size={16} className="text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className={cn("block w-full py-2 pl-3 pr-10 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-cyan-500/40 transition-all cursor-pointer",
                      isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
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
                  className="inline-flex items-center justify-center gap-1.5 bg-cyan-600/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                >
                  <RefreshCw size={13} className={cn(isLoading && "animate-spin")} /> Segarkan
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center justify-center gap-1.5 bg-emerald-600/20 border border-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                >
                  <Download size={13} /> Export
                </button>
              </div>
            </div>
 
            {/* Cyber Table Container */}
            <div className={cn("rounded-2xl border overflow-hidden shadow-2xl relative transition-all duration-300", 
              isDarkMode ? "bg-slate-900/30 border-slate-800/80 shadow-black/50" : "bg-white border-slate-200"
            )}>
              {/* Decorative Side Tech Line Accent */}
              {isDarkMode && <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 via-indigo-500 to-transparent opacity-40" />}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className={isDarkMode ? "bg-slate-950/60 text-slate-400 border-b border-slate-800" : "bg-slate-100 text-slate-800"}>
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">No. Pendaftaran</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">Nama Lengkap</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">Usia</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">Jarak</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">NIK</th>
                      <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDarkMode ? "divide-slate-800/60" : "divide-slate-200")}>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Loader2 className="animate-spin h-8 w-8 mx-auto text-cyan-400 mb-3" />
                          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Sinkronisasi Basis Data...</p>
                        </td>
                      </tr>
                    ) : currentData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <FileText size={40} className="mx-auto text-slate-600 mb-3" />
                          <p className="text-xs font-semibold text-slate-500">Tidak ada arsip data yang terintegrasi</p>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          key={item['No Pendaftaran']} 
                          className={cn("transition-all duration-150 relative group", isDarkMode ? "hover:bg-cyan-950/10" : "hover:bg-slate-50")}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-cyan-400 font-mono tracking-wide drop-shadow-[0_0_6px_rgba(34,211,238,0.2)]">
                            {item['No Pendaftaran']}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{getFieldValue(item, 'Nama Lengkap') || '-'}</div>
                            <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                              {getFieldValue(item, 'Tempat Lahir') || '-'}, {formatDate(getFieldValue(item, 'Tanggal Lahir'))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-400">
                            {calculateAge(getFieldValue(item, 'Tanggal Lahir'), settings?.tanggalCutoffUsia)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-300">
                            {item['Jarak ke Sekolah (km)'] ? `${item['Jarak ke Sekolah (km)']} km` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                            <span className="bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              {getFieldValue(item, 'NIK') || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.Status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setSelectedStudent(item)}
                                className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all active:scale-95" 
                                title="Lihat Detail"
                              >
                                <Eye size={14} />
                              </button>
                              {item.Status !== 'Lulus' && (
                                <button onClick={() => handleUpdateStatus(item['No Pendaftaran'], 'Lulus')}
                                  className="p-1.5 text-emerald-500 hover:text-white bg-emerald-950/30 border border-emerald-500/20 hover:bg-emerald-600 rounded-lg transition-all active:scale-95" 
                                  title="Ubah ke Lulus"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}
                              {item.Status !== 'Tidak Lulus' && (
                                <button onClick={() => handleUpdateStatus(item['No Pendaftaran'], 'Tidak Lulus')}
                                  className="p-1.5 text-rose-500 hover:text-white bg-rose-950/30 border border-rose-500/20 hover:bg-rose-600 rounded-lg transition-all active:scale-95" 
                                  title="Ubah ke Tidak Lulus"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}
                              <button onClick={() => printCard(item)}
                                className="p-1.5 text-blue-400 hover:text-white bg-blue-950/30 border border-blue-500/20 hover:bg-blue-600 rounded-lg transition-all active:scale-95" 
                                title="Cetak Kartu"
                              >
                                <Printer size={14} />
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
                <div className={cn("px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs", 
                  isDarkMode ? "border-slate-800/60 bg-slate-950/40" : "border-slate-200 bg-slate-50"
                )}>
                  <div className="text-slate-500 font-medium">
                    Menampilkan <span className="text-slate-300 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-300 font-bold">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="text-cyan-400 font-bold">{filteredData.length}</span> entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-slate-800 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 bg-transparent text-slate-400 transition-all active:scale-95"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-slate-800 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 bg-transparent text-slate-400 transition-all active:scale-95"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {/* Konten Tab Settings Tetap Mengikuti wrapper styling siber */}
        {activeTab === 'settings' && localSettings && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className={cn("rounded-2xl border p-6 backdrop-blur-md shadow-2xl", 
              isDarkMode ? "bg-slate-900/40 border-slate-800/80 shadow-black/40" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4 overflow-x-auto no-scrollbar">
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
                    className={cn("px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap border active:scale-95",
                      settingsTab === tab.id 
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
                        : "bg-transparent border-slate-800 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Konten internal form settings Anda ... */}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
