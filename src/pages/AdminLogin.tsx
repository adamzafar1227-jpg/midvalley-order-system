import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, QrCode } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { theme } from '../config/theme';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans antialiased text-slate-800">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/midvalley-bg.jpeg)' }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white/95 shadow-2xl rounded-3xl border border-slate-200/80 backdrop-blur-sm">
          <div className="px-6 py-8 sm:px-10">
            <div className="mb-6 text-center">
              <img
                src="/Mid Valley.png"
                alt="Mid Valley"
                className="mx-auto object-contain"
                style={{ width: '150px', height: 'auto' }}
              />
              <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
                Masuk ke Mid Valley
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Masuk untuk mengelola pengaturan dan pesanan restoran
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white py-8 px-4 shadow-none sm:rounded-2xl sm:px-10 border border-slate-100"
            >
              {error && (
                <div className="mb-4 bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-lg border border-rose-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
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
                      placeholder="manager@restaurant.com"
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
                </div>

                <div className="flex items-center justify-between text-xs font-medium">
                  <label htmlFor="remember-me" className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      id="remember-me"
                      defaultChecked
                      className="rounded-sm border-slate-300 h-4 w-4"
                      style={{ color: theme.primaryColor, '--tw-ring-color': theme.primaryColor } as any}
                    />
                    <span>Ingat saya</span>
                  </label>
                  <span className="text-slate-400 hover:underline cursor-pointer" style={{ '--hover-color': theme.primaryColor } as any}>Lupa Password?</span>
                </div>

                <button
                  id="admin-submit-login-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition-all cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 15px -3px ${theme.primaryColor}33` }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center text-xs">
                <span className="text-slate-500">Mitra baru? </span>
                <Link to="/admin/register" className="font-bold hover:underline" style={{ color: theme.primaryColor }}>
                  Buat akun gratis
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
