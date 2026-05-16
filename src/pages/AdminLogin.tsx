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
          confirmButtonColor: '#d4af37', // Tombol warna emas
          customClass: { popup: 'rounded-2xl border border-amber-500/20 bg-slate-900 text-white' }
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: error.response?.data?.message || 'Gagal terhubung ke server internal.',
        confirmButtonColor: '#d4af37', // Tombol warna emas
        customClass: { popup: 'rounded-2xl border border-amber-500/20 bg-slate-900 text-white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] relative flex flex-col items-center justify-center p-4 overflow-hidden antialiased">
      {/* Ornamen Background Cahaya Emas (Gold Glow Effect) */}
      <div className="absolute top-[-25%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-600/5 blur-[130px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Tombol Kembali dengan Hover Emas */}
        <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-amber-400 mb-8 transition-all duration-300 group">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Beranda
        </Link>

        {/* Card Login Utama - Dark Charcoal dengan Border Emas Tipis */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-500/15 overflow-hidden"
        >
          {/* Header Card dengan Aksen Emas Gradasi */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20 transform rotate-3">
              <Lock className="text-slate-950 font-bold" size={26} />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight mb-2">
              Login Admin PMB
            </h2>
            <p className="text-slate-400 text-sm">Gunakan akun premium Anda untuk mengakses sistem.</p>
          </div>

          {/* Form Input */}
          <form onSubmit={handleLogin} className="p-8 pt-4 space-y-6">
            {/* Input Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider block ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 text-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder-slate-600 text-sm" 
                  placeholder="Masukkan nama pengguna" 
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider block ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-950/60 border border-slate-800 text-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder-slate-600 text-sm" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Gradasi Emas Metalik */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-slate-950 font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin text-slate-950" size={18} /> Memverifikasi...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
