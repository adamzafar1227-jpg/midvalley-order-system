import React, { useState, useMemo, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Table, Venue } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { QRCodeCanvas } from 'qrcode.react';
import domtoimage from 'dom-to-image-more';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink,
  Utensils,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminTables() {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);

  // Add Table state
  const [newTableNum, setNewTableNum] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.venueId) return;

    const fetchData = async () => {
      setLoading(true);
      const { data: vData } = await supabase.from('venues').select('*').eq('id', user.venueId).single();
      if (vData) setVenue({ id: vData.id, name: vData.name, description: vData.description, logoUrl: vData.logo_url });

      const { data: tData } = await supabase
        .from('tables')
        .select('*')
        .eq('venue_id', user.venueId)
        .order('table_number');
      
      if (tData) {
        const mapped: Table[] = tData.map((t: any) => ({
          id: t.id,
          venueId: t.venue_id,
          tableNumber: t.table_number
        }));
        setTables(mapped);
        if (mapped.length > 0 && !selectedTableId) setSelectedTableId(mapped[0].id);
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.venueId]);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  // Generate target URL for QR code
  const targetUrl = useMemo(() => {
    if (!selectedTable || !user?.venueId) return '';
    return `${window.location.origin}/menu/${user.venueId}/${selectedTable.id}`;
  }, [selectedTable, user?.venueId]);

  // Handle Add Table submission
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim() || !user?.venueId) return;

    const exists = tables.some(
      t => t.tableNumber.toLowerCase() === `table ${newTableNum.trim()}`.toLowerCase() || 
           t.tableNumber.toLowerCase() === newTableNum.trim().toLowerCase()
    );

    if (exists) {
      setAlertConfig({ title: 'Gagal', message: 'Nomor meja ini sudah terdaftar di sistem.' });
      return;
    }

    const tableNumberDisplay = newTableNum.toLowerCase().startsWith('table') 
      ? newTableNum.trim() 
      : `Table ${newTableNum.trim()}`;

    const { data, error } = await supabase.from('tables').insert({
      venue_id: user.venueId,
      table_number: tableNumberDisplay
    }).select().single();

    if (error) {
      setAlertConfig({ title: 'Gagal', message: 'Gagal mendaftarkan meja ke database.' });
      return;
    }

    const newTable: Table = {
      id: data.id,
      venueId: data.venue_id,
      tableNumber: data.table_number
    };

    setTables(prev => [...prev, newTable].sort((a,b) => a.tableNumber.localeCompare(b.tableNumber)));
    setSelectedTableId(data.id);
    setNewTableNum('');
    setCreateSuccess(true);
    setTimeout(() => setCreateSuccess(false), 1500);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;
    const { error } = await supabase.from('tables').delete().eq('id', tableToDelete.id);
    if (error) {
      setAlertConfig({ title: 'Gagal', message: 'Gagal menghapus meja.' });
    } else {
      const remaining = tables.filter(t => t.id !== tableToDelete.id);
      setTables(remaining);
      if (selectedTableId === tableToDelete.id && remaining.length > 0) {
        setSelectedTableId(remaining[0].id);
      }
    }
    setTableToDelete(null);
  };

  const copyUrlToClipboard = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const downloadAsPng = async () => {
    if (!selectedTable || !cardRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        bgcolor: '#ffffff',
        cacheBust: true,
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `tent-card-${selectedTable.tableNumber.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error generating PNG:', error);
      setAlertConfig({ title: 'Gagal', message: 'Gagal membuat pratinjau kartu PNG.' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout
      title="Meja & Generator QR"
      subtitle="Kelola meja makan dan buat kartu meja QR otomatis."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left side: Table roster & Provision form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* List existing ones */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Area Terdaftar</h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tables.map(table => {
                const isSelected = table.id === selectedTableId;
                return (
                  <div
                    key={table.id}
                    id={`table-row-${table.id}`}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/10 shadow-xs' 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        T{table.tableNumber.replace(/\D/g, '') || table.tableNumber[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{table.tableNumber}</span>
                    </div>

                    <button
                      id={`delete-table-btn-${table.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableToDelete(table);
                      }}
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-md transition-colors cursor-pointer"
                      title="Delete table entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {tables.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No tables configured. Use the form below to provision a dining desk.
                </div>
              )}
            </div>
          </div>

          {/* Create new table form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Tambah Meja</h3>
            
            {createSuccess && (
              <div className="mb-3 bg-indigo-50 text-indigo-700 text-xs font-semibold p-2 rounded-lg border border-indigo-100">
                Meja dan kartu QR berhasil dibuat!
              </div>
            )}

            <form onSubmit={handleAddTable} className="space-y-3">
              <div>
                <label htmlFor="table-number-input" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor / Referensi Meja
                </label>
                <input
                  id="table-number-input"
                  type="text"
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="E.g., 6, Terrace A, VIP Booth"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                id="btn-add-table"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Meja</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right side: QR designer & Print Tent Leaflet */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedTable ? (
              <motion.div
                key={selectedTable.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                {/* Visual flyer designer */}
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Active QR Ticket
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">
                      Routing for {selectedTable.tableNumber}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 lines-clamp-3">
                      When guests scan this code on their personal smartphone, they are instantly redirected to your cafe menu page customized for this table.
                    </p>
                  </div>

                  {/* Generated String URL panel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Redirect URI</span>
                    <div className="flex gap-2 items-center min-w-0">
                      <div className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md overflow-x-auto whitespace-nowrap flex-1 scrollbar-none">
                        {targetUrl}
                      </div>

                      <button
                        id="copy-url-btn"
                        onClick={copyUrlToClipboard}
                        className="bg-white border border-slate-200 hover:bg-slate-100 p-2 rounded-lg text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <a
                        id="test-url-btn"
                        href={`/menu/${selectedTable.venueId}/${selectedTable.tableNumber.toLowerCase().replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white border border-slate-200 hover:bg-slate-100 p-2 rounded-lg text-slate-600 transition-colors flex-shrink-0"
                        title="Test Client page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      id="btn-print-action"
                      onClick={handlePrint}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Kartu Meja</span>
                    </button>
                    <button
                      id="btn-download-action"
                      onClick={downloadAsPng}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh PNG</span>
                    </button>
                  </div>
                </div>

                {/* Print Flyer Artwork Design simulation / Desktop Table Tent view */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 relative overflow-hidden group">

                  {/* Outer Flyer leaf */}
                  <div
                    ref={cardRef}
                    id="tent-card-preview"
                    style={{
                      width: '85mm',
                      height: '120mm',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '40px 30px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {/* Top Section: Branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {venue?.logoUrl ? (
                        <img
                          src={venue.logoUrl}
                          alt="Logo"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', marginBottom: '12px' }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#94a3b8' }}>
                          <Utensils size={24} />
                        </div>
                      )}
                      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0, fontFamily: 'serif', letterSpacing: '-0.01em' }}>
                        {venue?.name || 'Our Venue'}
                      </h2>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '40px', height: '1.5px', backgroundColor: '#e2e8f0' }} />

                    {/* Middle: QR Code */}
                    <div style={{ padding: '15px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      {targetUrl ? (
                        <QRCodeCanvas
                          id="qr-canvas"
                          value={targetUrl}
                          size={160}
                          level="H"
                          includeMargin={false}
                        />
                      ) : (
                        <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                          <QrCode size={48} />
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div style={{ width: '40px', height: '1.5px', backgroundColor: '#e2e8f0' }} />

                    {/* Bottom: Table Information */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Table</span>
                      <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1 }}>Meja 
                        {selectedTable.tableNumber.replace(/\D/g, '') || selectedTable.tableNumber}
                      </h1>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Scan to Order</span>
                    </div>

                    {/* Footer */}
                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Powered by Ordio
                    </div>
                  </div>

                  <span className="absolute top-2.5 right-3 text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-3xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Print Tent Leaflet Preview
                  </span>

                </div>

              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                Select a table from the list to preview and export desktop-sign artwork.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tableToDelete && (
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
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-black text-slate-900">Hapus Meja?</h3>
              <p className="text-xs text-slate-500 mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setTableToDelete(null)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteTable}
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AnimatePresence>
        {alertConfig && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm"
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
