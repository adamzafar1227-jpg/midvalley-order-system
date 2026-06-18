import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Store, QrCode } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { theme } from '../config/theme';

export default function AdminRegister() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [venueName, setVenueName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !venueName) {
      setError('Please fill in all the required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setLoading(true);

    console.log('DEBUG: handleRegister initiated in AdminRegister.tsx');
    try {
      await signUp(email, password, venueName);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-800" style={{ backgroundColor: theme.backgroundColor }}>
      
      {/* Visual Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/Mid Valley.jpeg"
            alt="Mid Valley"
            className="max-h-[40px] object-contain rounded-xl shadow-lg mx-auto"
          />
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
          Daftar ke Mid Valley
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Luncurkan menu digital restoran Anda dalam hitungan detik
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100"
        >
          {error && (
            <div className="mb-4 bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="venue-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Nama Restoran
              </label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  id="venue-name"
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="The Golden Fork Bistro"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-1 transition-all font-medium"
                  style={{ '--tw-ring-color': theme.primaryColor } as any}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email
              </label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@goldenfork.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-1 transition-all font-medium"
                  style={{ '--tw-ring-color': theme.primaryColor } as any}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Kata Sandi
              </label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-1 transition-all font-medium"
                  style={{ '--tw-ring-color': theme.primaryColor } as any}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400 font-medium">Must be at least 6 characters.</p>
            </div>

            <button
              id="admin-submit-register-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition-all cursor-pointer hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 15px -3px ${theme.primaryColor}33` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Sudah punya akun? </span>
            <Link to="/admin/login" className="font-bold hover:underline" style={{ color: theme.primaryColor }}>
              Masuk di sini
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
