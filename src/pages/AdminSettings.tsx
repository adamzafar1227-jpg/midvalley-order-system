import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { 
  Settings, 
  Save, 
  Lock, 
  User,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);
  
  // Form States
  const [venueData, setVenueData] = useState({
    name: '',
    description: '',
    logo_url: '',
    currency: '$',
    opening_hours: ''
  });
  
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user?.venueId) return;

    const fetchVenue = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('name, description, logo_url, currency, opening_hours')
        .eq('id', user.venueId)
        .single();

      if (data && !error) {
        setVenueData({
          name: data.name || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
          currency: data.currency || '$',
          opening_hours: data.opening_hours || ''
        });
      }
      setLoading(false);
    };

    fetchVenue();
  }, [user?.venueId]);

  const handleSaveBranding = async () => {
    if (!user?.venueId) return;
    setSaving('branding');
    
    const { error } = await supabase
      .from('venues')
      .update({
        name: venueData.name,
        description: venueData.description,
        logo_url: venueData.logo_url
      })
      .eq('id', user.venueId);

    if (error) setAlertConfig({ title: 'Gagal', message: error.message });
    else {
      setSuccess('branding');
      setTimeout(() => setSuccess(null), 2000);
    }
    setSaving(null);
  };

  const handleSavePreferences = async () => {
    if (!user?.venueId) return;
    setSaving('preferences');
    
    const { error } = await supabase
      .from('venues')
      .update({
        currency: venueData.currency,
        opening_hours: venueData.opening_hours
      })
      .eq('id', user.venueId);

    if (error) setAlertConfig({ title: 'Gagal', message: error.message });
    else {
      setSuccess('preferences');
      setTimeout(() => setSuccess(null), 2000);
    }
    setSaving(null);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setSaving('password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) setAlertConfig({ title: 'Gagal', message: error.message });
    else {
      setSuccess('password');
      setNewPassword('');
      setTimeout(() => setSuccess(null), 2000);
    }
    setSaving(null);
  };

  if (loading) return <AdminLayout title="Settings"><div className="p-8 text-center text-slate-400 font-bold">Loading configuration...</div></AdminLayout>;

  return (
    <AdminLayout
      title="Pengaturan Toko"
      subtitle="Customize your venue branding, system preferences, and account security."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        
        {/* Branding Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900">Identitas Merek</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Tempat</label>
              <input type="text" value={venueData.name} onChange={(e) => setVenueData({...venueData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deskripsi</label>
              <textarea rows={3} value={venueData.description} onChange={(e) => setVenueData({...venueData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logo URL</label>
              <input type="text" value={venueData.logo_url} onChange={(e) => setVenueData({...venueData, logo_url: e.target.value})} placeholder="https://example.com/logo.png" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <button onClick={handleSaveBranding} disabled={saving === 'branding'} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
            {success === 'branding' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving === 'branding' ? 'Menyimpan...' : success === 'branding' ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>

        {/* System Preferences Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-6 text-left">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900">System Preferences</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Currency Symbol</label>
              <input type="text" value={venueData.currency} onChange={(e) => setVenueData({...venueData, currency: e.target.value})} placeholder="$" maxLength={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opening Hours</label>
              <input type="text" value={venueData.opening_hours} onChange={(e) => setVenueData({...venueData, opening_hours: e.target.value})} placeholder="08:00 - 22:00" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <button onClick={handleSavePreferences} disabled={saving === 'preferences'} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
            {success === 'preferences' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving === 'preferences' ? 'Saving...' : success === 'preferences' ? 'Preferences Saved' : 'Save Preferences'}
          </button>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900">Keamanan Akun</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Masuk sebagai</span>
                <span className="text-sm font-bold text-slate-700">{user?.email}</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Masukkan password baru" title="Update password akses" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={handleUpdatePassword} disabled={saving === 'password' || !newPassword} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                {success === 'password' ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {saving === 'password' ? 'Memperbarui...' : success === 'password' ? 'Password Diperbarui' : 'Ubah Password'}
              </button>
              <div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium px-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <p>Ensure your password is at least 6 characters. You will remain logged in after changing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-100 shadow-xl"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-black text-slate-900">{alertConfig.title}</h3>
              <p className="text-xs text-slate-500 mt-2">{alertConfig.message}</p>

              <div className="mt-8">
                <button
                  onClick={() => setAlertConfig(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Oke
                </button>
              </div>
              
              <button 
                onClick={() => setAlertConfig(null)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}