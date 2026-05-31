import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Search, Calendar, ChevronDown, ChevronUp, FileText, Printer } from 'lucide-react'

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
    <div className="space-y-6 text-slate-850 dark:text-slate-100 transition-colors">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Laporan Penjualan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Lihat riwayat transaksi dan detail pembayaran kasir.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
          <input
            type="text"
            placeholder="Cari ID Transaksi, metode, kasir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 pl-9 pr-4 placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-850 transition-all text-xs font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-bold">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Hari Ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold border-b border-slate-200 dark:border-slate-850">
              <tr>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">Waktu</th>
                <th className="p-4 text-right">Total Transaksi</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Kasir</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((sale) => {
                const isExpanded = expandedSaleId === sale.id
                return (
                  <tbody key={sale.id} className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr
                      onClick={() => toggleExpand(sale.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer odd:bg-white dark:odd:bg-slate-900 even:bg-slate-50/30 dark:even:bg-slate-850/20"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{sale.id}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-450 font-semibold">{new Date(sale.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white">{formatIDR(sale.total)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          sale.paymentMethod === 'Cash' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' :
                          sale.paymentMethod === 'Card' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' :
                          'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{sale.cashier}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(sale.id)
                          }}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Detail
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Invoice Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                        <td colSpan="6" className="p-5 border-t border-slate-150 dark:border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-650 dark:text-slate-350">
                            {/* Products purchased */}
                            <div className="space-y-3">
                              <h5 className="font-bold text-xs text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                Rincian Pesanan
                              </h5>
                              <div className="bg-white dark:bg-slate-850 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                                {sale.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-xs">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name} <span className="text-slate-450 dark:text-slate-500 font-semibold">x{item.quantity}</span></span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatIDR(item.subtotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Transaction details & mock Print */}
                            <div className="space-y-3">
                              <h5 className="font-bold text-xs text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                                <span>Rincian Pembayaran</span>
                                <button
                                  onClick={() => window.print()}
                                  className="text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-[10px] inline-flex items-center gap-1 font-bold bg-slate-900 dark:bg-white px-2 py-1 rounded shadow-sm cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" /> Cetak Ulang Struk
                                </button>
                              </h5>
                              <div className="bg-white dark:bg-slate-850 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-sm">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                  <span>Subtotal</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(sale.subtotal)}</span>
                                </div>
                                {sale.discountPercent > 0 && (
                                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                                    <span>Diskon ({sale.discountPercent}%)</span>
                                    <span>-{formatIDR(sale.discountAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                  <span>Pajak (10%)</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(sale.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-750 pt-2 text-sm">
                                  <span>Total Dibayar</span>
                                  <span className="text-slate-900 dark:text-white font-extrabold">{formatIDR(sale.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                )
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-450 dark:text-slate-500 font-semibold">
                    Tidak ada laporan penjualan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
