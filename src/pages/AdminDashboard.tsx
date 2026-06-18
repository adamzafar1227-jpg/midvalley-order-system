import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Order, OrderStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { 
  DollarSign, 
  ShoppingBag,
  CreditCard,
  Utensils,
  Clock, 
  ChevronRight, 
  Plus,
  LayoutGrid,
  ChefHat,
  TrendingUp,
  PackageCheck,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { theme } from '../config/theme';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeTables: 0,
    pendingPayments: 0
  });
  const [popularItems, setPopularItems] = useState<{ name: string; count: number }[]>([]);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/\s/g, ' ');
  };

  useEffect(() => {
    if (!user?.venueId) return;

    const fetchData = async () => {
      setLoading(true);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch last 100 orders to calculate today's KPIs and show recent activity
      const { data } = await supabase
        .from('orders')
        .select('*, table:tables(table_number), items:order_items(*, menu_item:menu_items(name))')
        .eq('venue_id', user.venueId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        const mappedOrders: Order[] = data.map((o: any) => ({
          id: o.id,
          venueId: o.venue_id,
          tableId: o.table?.table_number || 'Walk-in',
          status: o.status,
          totalPrice: o.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
          notes: o.note || '',
          createdAt: o.created_at,
          items: o.items.map((i: any) => ({
            id: i.id,
            orderId: i.order_id,
            menuItemId: i.menu_item_id,
            quantity: i.quantity,
            menuItemName: i.menu_item?.name || 'Unknown Item',
            price: i.price,
            notes: ''
          }))
        }));
        setOrders(mappedOrders);

        // Calculate Stats
        const todayOrdersList = mappedOrders.filter(o => new Date(o.createdAt) >= startOfDay);
        
        const todayRevenue = todayOrdersList
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.totalPrice, 0);

        const activeTables = new Set(
          mappedOrders
            .filter(o => ['pending_payment', 'confirmed', 'preparing'].includes(o.status))
            .map(o => o.tableId)
        ).size;

        const pendingPayments = mappedOrders.filter(o => o.status === 'pending_payment').length;

        setStats({ todayOrders: todayOrdersList.length, todayRevenue, activeTables, pendingPayments });

        // Calculate Popular Items (Today)
        const itemCounts: Record<string, { name: string; count: number }> = {};
        todayOrdersList.forEach(order => {
          order.items.forEach(item => {
            if (!itemCounts[item.menuItemId]) itemCounts[item.menuItemId] = { name: item.menuItemName, count: 0 };
            itemCounts[item.menuItemId].count += item.quantity;
          });
        });

        setPopularItems(Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 3));
      }
      setLoading(false);
    };

    fetchData();

    // Set up Realtime subscription for incoming orders
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `venue_id=eq.${user.venueId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.venueId]);

  // Modify order status dynamically in memory
  const handlePrintReceipt = (order: Order) => {
    const venueName = user?.venueName || `${theme.brandName} Admin`;
    const totalWithTax = (order.totalPrice * 1.08).toFixed(2);
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${item.menuItemName}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      setAlertConfig({ title: 'Pop-up Diblokir', message: 'Harap izinkan pop-up untuk mencetak struk belanja.' });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${order.id.toUpperCase()}</title>
          <style>
            body { font-family: monospace; width: 280px; margin: 0 auto; font-size: 12px; line-height: 1.4; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed black; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            @page { size: 80mm auto; margin: 5mm; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${venueName}</div>
          <div class="divider"></div>
          <div class="bold">ORDER: ${order.id.toUpperCase()}</div>
          <div>TABLE: ${order.tableId}</div>
          <div>DATE: ${new Date().toLocaleString()}</div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px dashed black;">
                <th align="left">ITEM</th>
                <th align="center">QTY</th>
                <th align="right">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="bold" style="display: flex; justify-content: space-between; font-size: 14px;">
            <span>TOTAL PAID</span>
            <span>${formatCurrency(totalWithTax)}</span>
          </div>
          <div class="divider" style="margin-top: 20px;"></div>
          <div class="center bold">THANK YOU!</div>
          <div class="center" style="font-size: 10px; margin-top: 5px;">Powered by ${theme.brandName}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      setAlertConfig({ title: 'Gagal', message: 'Gagal memperbarui status pesanan.' });
      return;
    }

    const updatedOrders = orders.map(ord => 
      ord.id === orderId ? { ...ord, status: newStatus } : ord
    );
    setOrders(updatedOrders);

    // Automatically trigger receipt print when payment is confirmed
    if (newStatus === 'confirmed') {
      const orderToPrint = updatedOrders.find(o => o.id === orderId);
      if (orderToPrint) handlePrintReceipt(orderToPrint);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const now = new Date();
    const past = new Date(isoString);
    const diffInMins = Math.floor((now.getTime() - past.getTime()) / 60000);
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m yang lalu`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Status color pill helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FDE68A] flex items-center gap-1">● Menunggu Pembayaran</span>;
      case 'confirmed':
        return <span className="bg-[#DBEAFE] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#BFDBFE] flex items-center gap-1">● Dikonfirmasi</span>;
      case 'preparing':
        return <span className="bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">● Sedang Diproses</span>;
      case 'ready':
        return <span className="bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#BBF7D0] flex items-center gap-1">● Siap</span>;
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">● Selesai</span>;
      case 'cancelled':
        return <span className="bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">● Dibatalkan</span>;
    }
  };

  // Human date display helper
  const formatTime = (isoString: string) => {
    const timeValue = new Date(isoString);
    return timeValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && orders.length === 0) {
    return <AdminLayout title="Dashboard" subtitle="Loading..."><div className="h-96 flex items-center justify-center text-slate-400 font-bold">Warming up the kitchen...</div></AdminLayout>;
  }

  return (
    <AdminLayout
      title="Pesanan Masuk"
      subtitle="Pelacakan KPI real-time dan manajemen layanan."
    >
      
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pesanan Hari Ini", value: stats.todayOrders, icon: ShoppingBag, color: `bg-[${theme.primaryColor}]`, text: `text-[${theme.primaryColor}]` },
          { label: "Pendapatan Hari Ini", value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: `bg-[${theme.primaryColor}]`, text: `text-[${theme.primaryColor}]` },
          { label: "Meja Aktif", value: stats.activeTables, icon: Utensils, color: `bg-[${theme.primaryColor}]`, text: `text-[${theme.primaryColor}]` },
          { label: "Menunggu Pembayaran", value: stats.pendingPayments, icon: CreditCard, color: `bg-[${theme.primaryColor}]`, text: `text-[${theme.primaryColor}]` }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between transition-transform hover:scale-[1.02]">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{kpi.label}</span>
              <span className="text-3xl font-black text-slate-900">{kpi.value}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Clock style={{ color: theme.primaryColor }} size={20} />
                Aktivitas Terbaru
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 px-3 min-w-[40px]`}>
                      {`Meja ${order.tableId.replace(/Table\s+/i, '').replace('Walk-in', '00')}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Order #{order.id.slice(0, 5).toUpperCase()}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTimeAgo(order.createdAt)}</span>
                    {order.status === 'pending_payment' && (
                      <button // Confirm Payment button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="bg-[#16A34A] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
                      >
                        KONFIRMASI PEMBAYARAN
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm font-medium">No activity recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Popular Items Today */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs p-6">
            <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
              <TrendingUp style={{ color: theme.primaryColor }} size={20} />
              Terpopuler Hari Ini
            </h3>
            <div className="space-y-4">
              {popularItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase" style={{ backgroundColor: `${theme.primaryColor}1A`, color: theme.primaryColor }}>
                    {item.count} Sold
                  </span>
                </div>
              ))}
              {popularItems.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs italic">Belum ada item terjual hari ini.</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1A1A1A] rounded-3xl p-6 shadow-xl shadow-slate-950/20">
            <h3 className="font-black text-white text-lg mb-6 flex items-center gap-2">
              <ArrowUpRight style={{ color: theme.primaryColor }} size={20} />
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/admin/menu" 
                className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all group border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                  <Plus size={18} />
                </div>
                <span className="text-sm font-bold">Tambah Menu</span>
              </Link>
              <Link 
                to="/admin/tables" 
                className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all group border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                  <LayoutGrid size={18} />
                </div>
                <span className="text-sm font-bold">Tambah Meja</span>
              </Link>
              <Link 
                to="/admin/kitchen" 
                className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all group border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                  <ChefHat size={18} />
                </div>
                <span className="text-sm font-bold">Lihat Dapur</span>
              </Link>
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
