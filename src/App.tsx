import AdminDashboard from './pages/AdminDashboard';
import AdminKitchen from './pages/AdminKitchen';
import AdminMenu from './pages/AdminMenu';
import AdminTables from './pages/AdminTables';
import AdminSettings from './pages/AdminSettings';
import AdminReports from './pages/AdminReports';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import { AuthProvider } from './lib/auth';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { 
  QrCode,
  ArrowRight,
  Utensils,
  Smartphone,
  Sparkles,
  ChefHat,
  Activity,
  Printer,
  Monitor,
  ClipboardList,
  CheckCircle2,
  Layout,
  MessageCircle,
  Zap,
  Users,
  Wallet,
  ArrowDown,
  BadgeCheck,
  Coffee,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANDING_IMAGES = {
  customer: 'https://placehold.co/600x400?text=Customer+Menu',
  kitchen: 'https://placehold.co/600x400?text=Kitchen+Dashboard',
  cashier: 'https://placehold.co/600x400?text=Cashier+Dashboard'
};

function HomePortal() {
  const scrollToDemo = () => {
    document.getElementById('demo-request')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans antialiased text-slate-200 relative overflow-x-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <QrCode size={24} />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">Ordio</span>
            <span className="text-[10px] text-emerald-500 block font-bold uppercase tracking-widest leading-none mt-0.5">Indonesia</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">How It Works</button>
          <button onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Product</button>
          <Link to="/admin/login" className="hover:text-white transition-colors">Sign In</Link>
          <button onClick={scrollToDemo} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer">
            Book Free Demo
          </button>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
              <Sparkles size={14} />
              <span>#1 QR Ordering System for Modern Restaurants</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
              Customers Scan, Order, <br />
              <span className="text-emerald-500">and Pay Faster</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Boost table turnover and eliminate order mistakes with our all-in-one QR Menu, 
              Kitchen Display, and Cashier Dashboard. <strong>No app download required.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={scrollToDemo} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 active:scale-95 cursor-pointer">
                Book Free Demo
                <ArrowRight size={20} />
              </button>
              <a href="https://wa.me/yournumber" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95">
                <MessageCircle size={20} className="text-emerald-500" />
                WhatsApp Sales
              </a>
            </div>
          </motion.div>
        </div>

        {/* Product Visual Flow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-slate-900/50 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-3xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 aspect-[9/19] bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col">
                <div className="h-10 bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">Scan to Menu</div>
                <div className="p-2 space-y-2">
                   <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse" />
                   <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs font-black text-white block">1. Customer Scans QR</span>
                <span className="text-[10px] text-slate-500">Orders in 30 seconds</span>
              </div>
            </div>

            <div className="hidden md:flex justify-center text-emerald-500/30"><ArrowRight size={32} /></div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-video bg-slate-950 rounded-xl border-4 border-slate-800 shadow-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center"><div className="h-2 w-8 bg-orange-500 rounded-full" /><div className="h-2 w-4 bg-slate-700 rounded-full" /></div>
                <div className="h-full w-full bg-slate-900 rounded-lg border border-white/5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-black text-white block">2. Kitchen Receives</span>
                <span className="text-[10px] text-slate-500">Real-time Dashboard</span>
              </div>
            </div>

            <div className="hidden md:flex justify-center text-emerald-500/30"><ArrowRight size={32} /></div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-video bg-slate-950 rounded-xl border-4 border-slate-800 shadow-xl p-3">
                 <div className="flex gap-2 h-full">
                    <div className="w-1/3 bg-slate-900 rounded-lg" />
                    <div className="flex-1 bg-slate-900 rounded-lg" />
                 </div>
              </div>
              <div className="text-center">
                <span className="text-xs font-black text-white block">3. Cashier Payment</span>
                <span className="text-[10px] text-slate-500">Fast Table Turnover</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <BadgeCheck className="text-emerald-600" />
            <span className="text-sm font-black uppercase tracking-tight">Zero App Installations Required</span>
          </div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <div className="bg-slate-900/80 border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-8">
          {[
            { icon: Zap, text: 'Setup in 24 Hours' },
            { icon: QrCode, text: 'Unlimited Tables' },
            { icon: Users, text: 'Any Smartphone' },
            { icon: Activity, text: 'Real-Time Sync' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <item.icon size={18} className="text-emerald-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tight">The Complete Ecosystem</h2>
          <p className="text-slate-400 max-w-2xl font-medium text-lg">One platform to sync your entire front and back of house.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Customer Ordering */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col group hover:border-emerald-500/20 transition-all">
            <div className="aspect-[4/3] mb-8 relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 group bg-slate-950">
              <img 
                src={LANDING_IMAGES.customer} 
                alt="Customer Ordering Experience" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-md uppercase tracking-wider">
                  Customer Ordering Experience
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-3">01. Smart Digital Menu</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Guests scan a QR to browse high-res photos, view calorie tags, and place orders directly from their phone. No apps, no wait.
              </p>
            </div>
          </div>

          {/* Card 2: Kitchen Display */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col group hover:border-indigo-500/20 transition-all">
            <div className="aspect-[4/3] mb-8 relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 group bg-slate-950">
              <img 
                src={LANDING_IMAGES.kitchen} 
                alt="Kitchen Dashboard" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-1 rounded-md uppercase tracking-wider">
                  Kitchen Dashboard
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-3">02. Kitchen Display (KDS)</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Tickets appear instantly on the kitchen screen with color-coded urgency. Organize orders by status and notify guests when ready.
              </p>
            </div>
          </div>

          {/* Card 3: Admin Hub */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col group hover:border-amber-500/20 transition-all">
            <div className="aspect-[4/3] mb-8 relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 group bg-slate-950">
              <img 
                src={LANDING_IMAGES.cashier} 
                alt="Cashier Dashboard" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-1 rounded-md uppercase tracking-wider">
                  Cashier Dashboard
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-3">03. Real-time Admin Hub</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Manage your menu, track live sales, and process table payments. One central hub to monitor performance and adjust pricing instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Showcase */}
      <section id="product" className="py-24 space-y-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 flex justify-center">
             <div className="w-64 aspect-[9/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-3xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=800&fit=crop" className="opacity-50 object-cover w-full h-full" />
                <div className="absolute bottom-8 inset-x-6 space-y-3">
                  <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                  <div className="h-12 w-full bg-emerald-600 rounded-xl" />
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-black text-white mb-6">Reduce Wait Times</h2>
            <p className="text-slate-400 mb-8 font-medium">Guests order as soon as they sit down. No more waving at busy staff or waiting for physical menus.</p>
            <ul className="space-y-4">
              {['Stunning Visual Menus', 'No App Download Required', 'Real-Time Item Availability'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-900/50 py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-6">Orders Reach The Kitchen Instantly</h2>
              <p className="text-slate-400 mb-8 font-medium">Ditch the paper tickets. Our Kitchen Display System (KDS) ensures every order is tracked and timed perfectly.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-white/5">
                  <span className="text-emerald-500 font-black block text-lg mb-1">-90%</span>
                  <span className="text-xs text-slate-400 uppercase font-bold">Ticket Errors</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-white/5">
                  <span className="text-emerald-500 font-black block text-lg mb-1">Live</span>
                  <span className="text-xs text-slate-400 uppercase font-bold">Prep Tracking</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-3xl p-3 border border-slate-700 shadow-3xl">
              <div className="bg-slate-950 rounded-2xl aspect-video p-4 flex gap-4 overflow-hidden">
                <div className="w-1/3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-2"><div className="h-2 w-8 bg-orange-500 rounded-full" /></div>
                <div className="w-1/3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-2"><div className="h-2 w-8 bg-blue-500 rounded-full" /></div>
                <div className="w-1/3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2"><div className="h-2 w-8 bg-emerald-500 rounded-full" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-slate-800 rounded-3xl p-3 border border-slate-700 shadow-3xl">
            <div className="bg-slate-950 rounded-2xl aspect-video p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="h-16 flex-1 bg-slate-900 border border-white/5 rounded-xl" />
                <div className="h-16 flex-1 bg-slate-900 border border-white/5 rounded-xl" />
              </div>
              <div className="h-24 w-full bg-slate-900 border border-white/5 rounded-xl" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-black text-white mb-6">Update Prices In Seconds</h2>
            <p className="text-slate-400 mb-8 font-medium">Manage your menu, track sales, and control your restaurant from anywhere in the world with the Admin Dashboard.</p>
            <ul className="space-y-4">
              {['Instant Menu Updates', 'Real-Time Revenue Stats', 'Staff Management'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 p-12 rounded-[3rem] max-w-2xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black rotate-12 uppercase tracking-widest">Limited Beta</div>
          <h2 className="text-4xl font-black text-white mb-2">Premium Partner</h2>
          <p className="text-emerald-500 text-2xl font-black mb-8">Free During Beta</p>
          <div className="text-left max-w-xs mx-auto mb-10 space-y-4">
            {[
              'Unlimited Menu Items', 
              'Kitchen Dashboard Access', 
              'Cashier / Admin Management', 
              'Custom QR Table Setup',
              'Free Staff Training'
            ].map((li, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm font-bold">
                <CheckCircle2 className="text-emerald-500" size={18} />
                {li}
              </div>
            ))}
          </div>
          <button onClick={scrollToDemo} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 cursor-pointer">
            Book Free Demo Today
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section id="demo-request" className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready To Modernize <br />Your Restaurant?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/yournumber" className="bg-white text-emerald-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                WhatsApp Us
              </a>
              <button onClick={scrollToDemo} className="bg-emerald-900/30 text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xl hover:bg-emerald-900/40 transition-all active:scale-95">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/yournumber" target="_blank" rel="noreferrer" className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all">
        <MessageCircle size={32} />
      </a>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 grayscale opacity-50">
          <QrCode className="text-white" size={24} />
          <span className="text-lg font-black text-white tracking-tight">Ordio</span>
        </div>
        <p className="text-slate-500 text-xs font-medium mb-6">The modern operating system for the food industry.</p>
        <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">© 2026 Ordio Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/menu/:venueId/:tableId" element={<CustomerMenu />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/kitchen" element={<AdminKitchen />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/tables" element={<AdminTables />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          <Route path="/ordio-core-x9k2/login" element={<SuperAdminLogin />} />
          <Route element={<SuperAdminProtectedRoute />}>
            <Route path="/ordio-core-x9k2/dashboard" element={<SuperAdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}