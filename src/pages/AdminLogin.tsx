import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginAdmin } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginAdmin(username, password);
      if (response.status === 'success') {
        sessionStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: response.message || 'Username atau password salah',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat menghubungi server',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Varian animasi untuk kemunculan elemen secara berurutan (Stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Jeda antar elemen 0.1 detik
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dekorasi Background Abstrak Bergerak */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-60"
        />
      </div>

      <div className="max-w-md w-full z-10">
        {/* Tombol kembali dengan animasi geser halus saat di-hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/" className="group inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" /> 
            Kembali ke Beranda
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8 text-white text-center relative">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.3 }}
              className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 border border-slate-600"
            >
              <Lock className="text-blue-400" size={32} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 tracking-wide">Login Admin</h2>
            <p className="text-slate-300 text-sm">Masuk untuk mengelola data pendaftaran PMB.</p>
          </div>

          {/* Form dengan Animasi Staggered */}
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleLogin} 
            className="p-8 space-y-6"
          >
            {/* Input Username */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white transition-all duration-200"
                  placeholder="Masukkan username"
                />
              </div>
            </motion.div>

            {/* Input Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white transition-all duration-200"
                  placeholder="Masukkan password"
                />
              </div>
            </motion.div>

            {/* Tombol Submit dengan Interaksi Hover & Tap */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={!isLoading ? { scale: 1.02, backgroundColor: '#1d4ed8' } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
