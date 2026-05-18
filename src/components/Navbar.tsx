import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  const links = [
    { name: 'Beranda', path: '/' },
    { name: 'Panduan', path: '/panduan' },
    { name: 'Pendaftaran', path: '/daftar' },
    { name: 'Cek Kelulusan', path: '/cek-kelulusan' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo dengan efek hover futuristik */}
          <motion.div 
            whileHover={{ scale: 1.03, filter: "drop-shadow(0 0 8px rgba(37, 99, 235, 0.3))" }} 
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/" className="flex items-center gap-2">
              {settings?.logoSekolah ? (
                <img src={settings.logoSekolah} alt="Logo Sekolah" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <GraduationCap size={24} />
                </div>
              )}
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {settings?.namaSekolah || 'SDN Harapan Bangsa'}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu - Kapsul Futuristik */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/50">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium relative px-4 py-2 rounded-full transition-colors duration-300",
                    isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {/* Efek Kapsul Berwarna yang Meluncur saat diklik/aktif */}
                  {isActive && (
                    <motion.span
                      layoutId="futuristicActiveBg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                  
                  {/* Efek Flash/Riak Cahaya saat diklik */}
                  <motion.span 
                    className="absolute inset-0 rounded-full bg-blue-400/30 opacity-0 -z-10"
                    whileTap={{ opacity: [0, 1, 0], scale: [0.9, 1.15, 1], transition: { duration: 0.4 } }}
                  />
                  
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
            
            {/* Tombol Aksi Utama dengan Gradasi & Glow */}
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(37, 99, 235, 0.5)" }} 
              whileTap={{ scale: 0.95 }}
              className="pl-2"
            >
              <Link
                to="/daftar"
                className="block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md"
              >
                Daftar Sekarang
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.85 }}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-xl bg-slate-50 border border-slate-200/60"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown dengan Animasi Berwarna */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 overflow-hidden absolute w-full left-0 shadow-xl"
          >
            <div className="px-4 pt-2 pb-4 space-y-1.5">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div 
                    key={link.path}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-4 py-2.5 rounded-xl text-base font-medium transition-all relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-l-4 border-blue-600 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
