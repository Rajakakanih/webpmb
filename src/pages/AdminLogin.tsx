import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginAdmin } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginAdmin(username, password);
      
      if (response.status === 'success') {
        sessionStorage.setItem('isAdmin', 'true');
        // Toast sukses yang lebih modern dan tidak mengganggu
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: 'success',
          title: 'Selamat datang kembali, Admin!'
        });
        navigate('/admin');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: response.message || 'Kredensial yang Anda masukkan salah.',
          confirmButtonColor: '#6366f1',
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: error.response?.data?.message || 'Gagal terhubung ke server internal.',
        confirmButtonColor: '#6366f1',
        customClass: { popup: 'rounded-2xl' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] relative flex flex-col items-center justify-center p-4 overflow-hidden antialiased">
      {/* Ornamen Background Estetik / Modern Glow Effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Tombol Kembali dengan Efek Hover Halus */}
        <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-400 mb-8 transition-all duration-300 group">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Beranda
        </Link>

        {/* Card Login Utama dengan Efek Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden"
        >
          {/* Header Card yang Minimalis & Elegan */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 transform rotate-3">
              <Lock className="text-white" size={26} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Dashboard Admin</h2>
            <p className="text-slate-400 text-sm">Silakan masuk untuk mengelola sistem PMB.</p>
          </div>

          {/* Form Input */}
          <form onSubmit={handleLogin} className="p-8 pt-4 space-y-6">
            {/* Input Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-600 text-sm" 
                  placeholder="Masukkan nama pengguna" 
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-950/40 border border-slate-800 text-white rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-600 text-sm" 
                  placeholder="••••••••" 
                />
                {/* Fitur Intip/Lihat Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Premium Gradient */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
