import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Order } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  ChefHat,
  ArrowRight,
  Check,
  Inbox,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminKitchen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (silent = false) => {
    if (!user?.venueId) return;
    
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, table:tables(table_number), items:order_items(*, menu_item:menu_items(name))')
      .eq('venue_id', user.venueId)
      .in('status', ['confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: true });

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
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    if (!user?.venueId) return;

    fetchData();

    const channel = supabase
      .channel('kitchen-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `venue_id=eq.${user.venueId}` },
        () => fetchData(true)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `venue_id=eq.${user.venueId}` },
        () => fetchData(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.venueId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      setAlertConfig({ title: 'Gagal', message: 'Gagal memperbarui status pesanan di sistem.' });
      return;
    }
    // Local state will be updated by the realtime listener
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return 'Baru saja';
    return `${diff} menit lalu`;
  };

  const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon, accentColor }: any) => (
    <div
      className="bg-[#1E293B] rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl flex flex-col"
    >
      <div className="p-3.5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/50 text-white px-3 py-1.5 rounded-xl text-lg font-black border border-slate-700">
            {order.tableId.includes('Table') ? order.tableId : `Table ${order.tableId}`}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-tighter">Waktu Tunggu</span>
            <span className={`text-xs font-black ${parseInt(formatTimeAgo(order.createdAt)) > 15 ? 'text-rose-500' : 'text-slate-300'}`}>
              {formatTimeAgo(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-lg font-black text-white bg-slate-800 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700">
                {item.quantity}
              </span>
              <div className="flex-1 pt-0.5">
                <span className="text-lg font-bold text-slate-100 leading-tight block">{item.menuItemName}</span>
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-200">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Catatan Dapur</p>
            <p className="text-lg font-bold italic">"{order.notes}"</p>
          </div>
        )}
      </div>

      <button
        onClick={() => updateStatus(order.id, nextStatus)}
        className={`w-full ${accentColor} text-white font-black py-5 text-xl flex items-center justify-center gap-3 transition-all active:scale-95 hover:brightness-110 cursor-pointer`}
      >
        <Icon size={24} />
        {nextLabel}
      </button>
    </div>
  );

  const ReadyOrderCard = ({ order }: { order: Order }) => (
    <div
      className="bg-[#1E293B] rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg flex items-center p-3 gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="bg-slate-900/50 text-white px-2 py-0.5 rounded-lg text-xs font-black border border-slate-700">
            {order.tableId.includes('Table') ? order.tableId : `Table ${order.tableId}`}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase">{formatTimeAgo(order.createdAt)}</span>
        </div>
        <div className="space-y-0.5">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-400">{item.quantity}x</span>
              <span className="text-sm font-bold text-slate-200 truncate">{item.menuItemName}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => updateStatus(order.id, 'completed')}
        className="bg-emerald-600 text-white font-black py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 cursor-pointer h-full"
      >
        <Check size={18} />
        <span>SELESAI</span>
      </button>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
      <Inbox size={64} strokeWidth={1} />
      <p className="text-lg font-bold uppercase tracking-widest">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 lg:p-8 flex flex-col gap-8">
      {/* KDS Custom Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">TAMPILAN DAPUR</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">Sistem Online</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] px-8 py-4 rounded-3xl border border-slate-800 flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Waktu Stasiun</span>
          <span className="text-3xl font-black text-white font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        
        {/* New Orders */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <h2 className="text-2xl font-black flex items-center justify-between uppercase text-orange-500 px-2">
            <span className="flex items-center gap-3"><Clock size={28} /> Pesanan Baru</span>
            <span className="bg-orange-500/10 px-3 py-1 rounded-full text-sm">{orders.filter(o => o.status === 'confirmed').length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pb-12">
            {orders.filter(o => o.status === 'confirmed').length > 0 ? (
              orders.filter(o => o.status === 'confirmed').map(order => (
                <OrderCard key={order.id} order={order} nextStatus="preparing" nextLabel="TERIMA" icon={ChefHat} accentColor="bg-orange-600" />
              ))
            ) : (
              <EmptyState message="No New Tickets" />
            )}
          </div>
        </div>

        {/* Preparing */}
        <div className="flex flex-col gap-6 overflow-hidden border-x border-slate-800/50 px-4">
          <h2 className="text-2xl font-black flex items-center justify-between uppercase text-blue-500 px-2">
            <span className="flex items-center gap-3"><UtensilsCrossed size={28} /> Sedang Diproses</span>
            <span className="bg-blue-500/10 px-3 py-1 rounded-full text-sm">{orders.filter(o => o.status === 'preparing').length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pb-12">
            {orders.filter(o => o.status === 'preparing').length > 0 ? (
              orders.filter(o => o.status === 'preparing').map(order => (
                <OrderCard key={order.id} order={order} nextStatus="ready" nextLabel="SIAP" icon={ArrowRight} accentColor="bg-blue-600" />
              ))
            ) : (
              <EmptyState message="Clean Rail" />
            )}
          </div>
        </div>

        {/* Ready */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <h2 className="text-2xl font-black flex items-center justify-between uppercase text-emerald-500 px-2">
            <span className="flex items-center gap-3"><CheckCircle2 size={28} /> Siap Disajikan</span>
            <span className="bg-emerald-500/10 px-3 py-1 rounded-full text-sm">{orders.filter(o => o.status === 'ready').length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-12">
            {orders.filter(o => o.status === 'ready').length > 0 ? (
              orders.filter(o => o.status === 'ready').map(order => (
                <ReadyOrderCard key={order.id} order={order} />
              ))
            ) : (
              <EmptyState message="Nothing Ready" />
            )}
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
    </div>
  );
}