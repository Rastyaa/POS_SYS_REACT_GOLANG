import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Search, Calendar, ChevronDown, ChevronUp, FileText, Printer, CheckCircle2, Receipt, ArrowRight } from 'lucide-react'

export default function SalesReport() {
  const { salesHistory } = usePosStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSaleId, setExpandedSaleId] = useState(null)

  // Format Helper
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Filtered History
  const filteredSales = salesHistory.filter((s) =>
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleExpand = (id) => {
    setExpandedSaleId(expandedSaleId === id ? null : id)
  }

  return (
    <div className="space-y-8 text-slate-850 dark:text-slate-100 transition-colors animate-fadeIn min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Laporan Penjualan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Lacak seluruh histori transaksi dan performa kasir harian.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-colors relative z-10">
        {/* Search */}
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute inset-y-0 left-4 flex items-center w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 my-auto transition-colors" />
          <input
            type="text"
            placeholder="Cari ID Transaksi, Metode Pembayaran, atau Kasir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-2xl py-3 pl-11 pr-4 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold shadow-inner"
          />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5 font-bold bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm whitespace-nowrap">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>Hari Ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="flex-1 relative z-10">
        <div className="w-full text-left text-sm space-y-3">
          {/* Header row (visually separate) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="col-span-3">Transaksi</div>
            <div className="col-span-2">Waktu</div>
            <div className="col-span-3 text-right">Total</div>
            <div className="col-span-2 text-center">Metode</div>
            <div className="col-span-2 text-center">Aksi</div>
          </div>

          {filteredSales.map((sale) => {
            const isExpanded = expandedSaleId === sale.id
            return (
              <div key={sale.id} className="relative group perspective-1000">
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(sale.id)}
                  className={`relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:px-6 md:py-4 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-lg shadow-indigo-500/5' 
                      : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isExpanded 
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                    }`}>
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">{sale.id}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase flex items-center gap-1">
                        By: <span className="text-slate-700 dark:text-slate-300">{sale.cashier}</span>
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                    {new Date(sale.timestamp).toLocaleTimeString('id-ID')}
                  </div>

                  <div className="col-span-1 md:col-span-3 md:text-right font-black text-lg text-slate-900 dark:text-white">
                    {formatIDR(sale.total)}
                  </div>

                  <div className="col-span-1 md:col-span-2 md:text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase border inline-flex items-center gap-1.5 ${
                      sale.paymentMethod === 'Cash' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' :
                      sale.paymentMethod === 'Card' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' :
                      'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {sale.paymentMethod}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end md:justify-center">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isExpanded ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rotate-180' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Invoice Detail */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-inner relative z-0 ml-4 md:ml-12 mr-2 md:mr-6 mb-4">
                    {/* Decorative dash pattern at top like a receipt */}
                    <div className="absolute top-0 left-6 right-6 h-[2px] border-t-2 border-dashed border-slate-200 dark:border-slate-700"></div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-2">
                      {/* Products purchased */}
                      <div className="space-y-4">
                        <h5 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Daftar Pesanan
                        </h5>
                        <div className="space-y-3">
                          {sale.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                                  {item.quantity}x
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none pt-1">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-1">@ {formatIDR(item.price)}</p>
                                </div>
                              </div>
                              <span className="font-black text-slate-900 dark:text-white pt-1">{formatIDR(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Transaction details & mock Print */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Receipt className="w-4 h-4" /> Ringkasan
                          </h5>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.print(); }}
                            className="text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-400 text-xs inline-flex items-center gap-1.5 font-bold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" /> Cetak Struk
                          </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 space-y-3 text-sm shadow-sm relative overflow-hidden">
                          {/* Receipt zig-zag decorative bottom */}
                          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent,transparent_50%,#f8fafc_50%,#f8fafc_100%)] dark:bg-[radial-gradient(circle,transparent,transparent_50%,#0f172a_50%,#0f172a_100%)] bg-[length:12px_12px]"></div>

                          <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold">
                            <span>Subtotal</span>
                            <span className="text-slate-800 dark:text-slate-200">{formatIDR(sale.subtotal)}</span>
                          </div>
                          {sale.discountPercent > 0 && (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                              <span>Diskon ({sale.discountPercent}%)</span>
                              <span>-{formatIDR(sale.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                            <span>Pajak (10%)</span>
                            <span className="text-slate-800 dark:text-slate-200">{formatIDR(sale.taxAmount)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 pb-1">
                            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Total Akhir</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 dark:text-white font-black text-xl">{formatIDR(sale.total)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white dark:bg-slate-800 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700 mt-2">
                            <span className="text-xs font-bold text-slate-500">Bayar via {sale.paymentMethod}</span>
                            <ArrowRight className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredSales.length === 0 && (
            <div className="text-center py-24 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 dark:text-white text-lg font-extrabold">Tidak ada transaksi ditemukan.</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Coba gunakan kriteria pencarian yang berbeda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
