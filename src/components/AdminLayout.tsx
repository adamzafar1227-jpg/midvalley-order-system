import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Utensils, 
  QrCode, 
  LogOut, 
  Menu, 
  X, 
  ArrowUpRight,
  ExternalLink,
  ChefHat,
  Settings,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../config/theme';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [venueLogo, setVenueLogo] = useState<string | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  
  const venueDisplayName = user?.venueName || `${theme.brandName} Admin`;

  useEffect(() => {
    if (!user?.venueId) return;
    const getLogo = async () => {
      const { data } = await supabase.from('venues').select('logo_url').eq('id', user.venueId).single();
      if (data?.logo_url) setVenueLogo(data.logo_url);
    };
    getLogo();
  }, [user?.venueId]);

  useEffect(() => {
    if (!user?.venueId) return;

    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', user.venueId)
        .eq('status', 'pending_payment');
      
      setPendingOrdersCount(count || 0);
    };

    fetchPendingCount();

    const channel = supabase
      .channel('pending-orders-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `venue_id=eq.${user.venueId}` },
        () => fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.venueId]);

  // Nav configuration
  const menuItems = [
    {
      name: 'Incoming Orders',
      path: '/admin/dashboard',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Baru` : undefined
    },
    {
      name: 'Kitchen',
      path: '/admin/kitchen',
      icon: ChefHat,
    },
    {
      name: 'Menu Manager',
      path: '/admin/menu',
      icon: Utensils,
    },
    {
      name: 'Tables & QR Codes',
      path: '/admin/tables',
      icon: QrCode,
    },
    {
      name: 'Laporan',
      path: '/admin/reports',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (e) {
      console.error(e);
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      
      {/* Desktop Sidebar (Sidebar element stays fixed) */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white text-slate-600 border-r border-gray-200 flex-shrink-0">
        <div className="py-8 flex flex-col items-center bg-white border-b border-gray-200">
          <img
  src="/Mid Valley.png"
  style={{ width: '200px', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
/>
          <span className="text-[11px] text-[#6B7280] text-center mt-2">MID VALLEY Coffee & Eatery</span>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`sidebar-link-${item.path.split('/').pop()}`}
                className={`flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-[#F3F4F6] text-[#1A1A1A] border-l-[3px] border-[#1A1A1A] rounded-r-lg' 
                    : 'text-[#1A1A1A] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 text-[#1A1A1A]" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5'
                  }`}
                  style={!isActive ? { color: theme.primaryColor } : {}}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 border-t border-gray-100 mt-6">
            {user?.venueId && (
              <Link
                to={`/menu/${user.venueId}/t1`}
                target="_blank"
                className="flex items-center justify-between p-3 rounded-lg text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9FAFB] transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-[#1A1A1A]" />
                  <span>Test Customer Page</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </nav>

        {/* Footer Admin controls */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold text-[#DC2626] hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Client Content Container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header Menu bar */}
        <header className="md:hidden bg-white text-slate-800 border-b border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              QR
            </span>
            <span className="font-extrabold text-sm tracking-tight text-slate-800">{theme.brandName} Admin</span>
          </div>

          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile menu sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1A1A] text-slate-600 border-b border-slate-800 p-4 space-y-2 shadow-xs">
            <div className="px-2 py-3 bg-white/5 rounded-lg flex items-center gap-3 mb-2 min-h-13">
              {venueLogo ? (
                <img 
                  src={venueLogo} 
                  alt={venueDisplayName} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">QR</div>
              )}
              <span className="text-white text-xs font-bold truncate">{venueDisplayName}</span>
            </div>

            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`mobile-nav-${item.path.split('/').pop()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold ${
                    isActive ? 'text-white' : 'hover:bg-white/5 text-slate-400'
                  }`}
                  style={isActive ? { backgroundColor: theme.primaryColor } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[9px] font-black">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 mt-2">
              {user?.venueId && (
                <Link
                  to={`/menu/${user.venueId}/t1`}
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg text-xs text-slate-400 hover:bg-white/5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test Customer Page</span>
                </Link>
              )}
              
              <button
                id="mobile-logout-btn"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-xs text-rose-400 hover:bg-rose-900 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Viewport Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-6 gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
              </div>

              <div className="bg-white border border-slate-200 shadow-3xs px-4 py-2 rounded-xl flex items-center gap-3 self-start text-xs font-semibold flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-600">Sistem Online</span>
              </div>
            </div>

            {/* Page specific slot */}
            {children}

          </div>
        </main>

      </div>
    </div>
  );
}
