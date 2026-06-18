import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Check,
  QrCode,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  Star,
  Coffee,
  Croissant,
  Cake,
  GlassWater,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  Banknote
} from 'lucide-react';
import { MenuItem, Venue } from '../types';
import { supabase } from '../lib/supabase';
import { theme } from '../config/theme';

export default function CustomerMenu() {
  const { venueId, tableId } = useParams<{ venueId: string; tableId: string }>();
  
  // States
  const [venue, setVenue] = useState<Venue | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories] = useState<string[]>(['Semua', 'Makanan', 'Minuman', 'Cimilan']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number; notes: string }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [activeItemDetails, setActiveItemDetails] = useState<MenuItem | null>(null);
  const [activeItemNotes, setActiveItemNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<{ id: string; table_number: string } | null>(null);

  const formatPrice = (price: number) => {
    return 'Rp ' + price.toLocaleString('id-ID');
  };

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      console.log('DEBUG: Starting fetchData for venueId:', venueId);
      setLoading(true);

      // Fetch venue metadata and tables in parallel
      const { data: vData, error: vError } = await supabase.from('venues').select('*').eq('id', venueId).single();
      
      if (vError) {
        console.error("DEBUG: Supabase error fetching venue:", vError);
      }
      
      if (vData) {
        console.log('DEBUG: Venue data successfully retrieved:', vData);
        setVenue({ id: vData.id, name: vData.name, description: vData.description, logoUrl: vData.logo_url });
      }

      // Fetch menu items
      const { data: mData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('venue_id', venueId)
        .order('name');
      
      if (mData) {
        const mapped: MenuItem[] = mData.map((i: any) => ({
          id: i.id,
          venueId: i.venue_id,
          name: i.name,
          description: i.description,
          price: i.price,
          imageUrl: i.image_url,
          category: i.category,
          isAvailable: i.is_available
        }));
        setMenuItems(mapped);
      }

      // Resolve table info for display
      const { data: tData } = await supabase.from('tables').select('id, table_number').eq('venue_id', venueId);
      if (tData && tableId) {
        const searchId = tableId.toLowerCase().trim();
        const found = tData.find(t => 
          t.id === tableId || 
          t.table_number.toLowerCase().trim() === searchId ||
          t.table_number.toLowerCase().trim() === `table ${searchId}` ||
          t.table_number.toLowerCase().trim() === `table${searchId}`
        );
        if (found) setActiveTable(found);
      }

      setLoading(false);
    };

    fetchData();
  }, [venueId, tableId]);

  // Update browser tab title dynamically
  useEffect(() => {
    if (venue?.name) {
      document.title = `${venue.name} - ${theme.brandName}`;
    } else {
      document.title = theme.brandName; // Default title if venue name is not available
    }
  }, [venue?.name]);

  // Human descriptive names

  // Filter items
  // Cart operations
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, current) => acc + current.quantity, 0);
  }, [cart]);

  const addToCart = (item: MenuItem, notes: string = '') => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id && i.notes === notes);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1, notes }];
    });
    setActiveItemDetails(null);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(cartItem => {
        if (cartItem.item.id === itemId) {
          const newQuantity = Math.max(0, cartItem.quantity + delta);
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      }).filter(cartItem => cartItem.quantity > 0);
      
      if (updated.length === 0) setIsCartOpen(false);
      return updated;
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !venueId) return;
    setIsOrdering(true);

    try {
      // Resolve the human-friendly tableId from URL to its actual UUID in the database
      const { data: venueTables } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('venue_id', venueId);

      const searchId = tableId?.toLowerCase().trim() || '';
      const tableRecord = venueTables?.find(t => {
        const num = t.table_number.toLowerCase().trim();
        return t.id === tableId || 
               num === searchId || 
               num === `table ${searchId}` || 
               num === `table${searchId}`;
      });

      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        venue_id: venueId,
        table_id: tableRecord?.id || null,
        status: 'pending_payment',
        note: ''
      }).select();

      const order = orderData?.[0];

      if (orderError || !order?.id) throw orderError || new Error('Order creation failed');

      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.item.id,
        quantity: item.quantity,
        price: item.item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) console.error('Non-critical error inserting order items:', itemsError);

      setOrderId(order.id.slice(0, 8).toUpperCase());
      setOrderSuccess(true);
      setCart([]);
      setIsCartOpen(false);
    } catch (err: any) {
      console.error('Full error:', err);
      alert('Error details: ' + (err?.message || err?.details || JSON.stringify(err)));
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Memuat Menu...</div>;

  // Human descriptive names (now that loading is complete and venue is available)
  const venueName = venue?.name || 'Venue Not Found';
  const tableDisplay = activeTable?.table_number || (
    tableId 
      ? (tableId.toLowerCase().startsWith('table') ? tableId : `Table ${tableId.replace(/\D/g, '') || tableId}`) 
      : '05'
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-32" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30" style={{ backgroundColor: `${theme.backgroundColor}CC` }}>
        <img src="/Mid Valley.png" style={{ width: '60px', height: 'auto' }} />
        <button className="text-slate-400 p-2">
          <Search size={20} />
        </button>
      </header>

      {/* Info Section */}
      <div className="px-5 py-2 space-y-1">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{venueName}</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Meja {tableDisplay}
        </p>
      </div>

      {/* Categories Pills */}
      <div className="flex gap-2 overflow-x-auto px-5 py-6 scrollbar-none">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === category 
                ? 'text-white shadow-lg' 
                : 'bg-white border border-slate-100 text-slate-400'
            }`}
            style={selectedCategory === category ? { backgroundColor: theme.primaryColor, boxShadow: `0 10px 15px -3px ${theme.primaryColor}33` } : {}}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="px-5 space-y-4">
        {filteredItems.map(item => (
          <motion.div 
            layout
            key={item.id}
            onClick={() => item.isAvailable && setActiveItemDetails(item)}
            className={`bg-white p-3 rounded-2xl flex gap-3 border border-slate-50 shadow-sm transition-all active:scale-[0.98] ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-shrink-0"
              /> 
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-[11px] font-bold text-slate-800 truncate pr-2">{item.name}</h3>
                  <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: theme.primaryColor }}>{formatPrice(item.price)}</span>
                </div>
                <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
              
              <div className="mt-2 flex justify-end">
                {item.isAvailable ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md transition-transform active:scale-90"
                    style={{ backgroundColor: theme.primaryColor, boxShadow: `0 4px 6px -1px ${theme.primaryColor}33` }}
                  >
                    <Plus size={14} />
                  </button>
                ) : (
                  <span className="text-[8px] font-black text-rose-500 uppercase">Stok Habis</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Menu tidak ditemukan</p>
          </div>
        ) : null}
      </div>

      {/* Persistent Order Success Modal Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-100 shadow-xl"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pesanan Berhasil!</h2>
              <p className="text-xs text-slate-400 mt-1">Kode Antrian: <span className="font-mono font-bold text-slate-700">{orderId}</span></p>
              
              <div className="bg-slate-50 rounded-lg p-3 my-4 text-left border border-slate-100 text-xs">
                <p className="font-semibold text-slate-700 mb-1">📋 Detail Pesanan:</p>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Restoran:</span>
                  <span className="font-semibold">{venueName}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Meja:</span>
                  <span className="font-semibold text-indigo-600">{tableDisplay}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex flex-col items-center gap-2">
                <Banknote className="w-6 h-6 text-amber-600" />
                <p className="text-xs font-bold text-amber-900 leading-snug">
                  Silakan bayar ke kasir untuk memproses pesanan Anda. Terima kasih!
                </p>
              </div>

              <button
                id="btn-close-success"
                onClick={() => setOrderSuccess(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-sm cursor-pointer"
              >
                Oke, Terima Kasih!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <div 
            id="cart-drawer-backdrop"
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-950/55 z-40 backdrop-blur-sm transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer Sheet */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#F5F0E8] shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-[#2C1810]/5 flex justify-between items-center bg-[#2C1810] text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-lg">Pesanan Saya</h2>
              </div>
              <button 
                id="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white/50 text-[#2C1810]/60 text-[10px] font-bold uppercase tracking-widest flex justify-between">
              <span>Memesan untuk: <strong>{tableDisplay}</strong></span>
              <span>{venueName}</span>
            </div>

            {/* Cart Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map(cartItem => (
                <div 
                  key={cartItem.item.id} 
                  className="flex gap-4 justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[#2C1810] block line-clamp-1">{cartItem.item.name}</span>
                    <span className="text-xs text-[#2C1810]/50 block mt-1">{formatPrice(cartItem.item.price)} each</span>
                    {cartItem.notes && ( /* No currency here */
                      <span className="text-[10px] text-[#2C1810]/40 bg-white px-2 py-1 rounded-lg inline-block mt-2 italic">
                        Note: {cartItem.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-[#2C1810]">{formatPrice(cartItem.item.price * cartItem.quantity)}</span>
                    <div className="flex items-center gap-2 border border-[#2C1810]/10 rounded-xl p-1 bg-white">
                      <button
                        onClick={() => updateQuantity(cartItem.item.id, -1)}
                        className="text-slate-500 hover:text-slate-800 p-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.item.id, 1)}
                        className="text-slate-500 hover:text-slate-800 p-1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold">Keranjang pesananmu kosong</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto">Select fresh coffees and foods from the list to populate your tray.</p>
                </div>
              )}
            </div>

            {/* Drawer Footer controls */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-[#2C1810]/5">
                <div className="space-y-2 text-xs text-[#2C1810]/60 mb-6 px-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span> {/* No currency here */}
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (8%)</span>
                    <span>{formatPrice(cartTotal * 0.08)}</span>
                  </div>
                  <div className="flex justify-between font-black text-[#2C1810] border-t border-[#2C1810]/5 pt-3 text-sm">
                    <span>Total Tagihan</span> {/* No currency here */}
                    <span>{formatPrice(cartTotal * 1.08)}</span>
                  </div>
                </div>

                <button
                  disabled={isOrdering}
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#2C1810] hover:opacity-90 disabled:bg-slate-400 text-white font-black py-4 px-4 rounded-[1.5rem] text-sm transition-all shadow-xl shadow-amber-900/20 flex justify-center items-center gap-2"
                >
                  {isOrdering ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Pesan Sekarang • {formatPrice(cartTotal * 1.08)}</span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Item Customizer Modal */}
      <AnimatePresence>
        {activeItemDetails && (
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
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col"
            >
              <div className="relative h-56 bg-slate-100">
                {activeItemDetails.imageUrl ? (
                  <img 
                    src={activeItemDetails.imageUrl} 
                    alt={activeItemDetails.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">No Image</div>
                )}
                <button
                  id="close-customizer-btn"
                  onClick={() => setActiveItemDetails(null)}
                  className="absolute right-3.5 top-3.5 bg-slate-900/70 hover:bg-slate-900 bg-slate-950/50 hover:bg-slate-950 text-white p-1 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{activeItemDetails.name}</h3>
                    <span className="font-bold text-indigo-600 text-lg">{formatPrice(activeItemDetails.price)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{activeItemDetails.description}</p>
                </div>

                <div>
                  <label htmlFor="item-notes-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Catatan Pesanan (Opsional)
                  </label>
                  <textarea
                    id="item-notes-input"
                    rows={2}
                    value={activeItemNotes}
                    onChange={(e) => setActiveItemNotes(e.target.value)}
                    placeholder="E.g., No ice, dressing on the side, extra hot..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    id="btn-cancel-customizer"
                    onClick={() => setActiveItemDetails(null)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-add-customizer-item"
                    onClick={() => addToCart(activeItemDetails, activeItemNotes)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sticky Bar */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 inset-x-5 z-40"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-slate-900 rounded-2xl p-4 flex justify-between items-center text-white shadow-2xl transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{cartItemCount} Item</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Lanjut • {formatPrice(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
