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
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Penjualan</h1>
        <p className="text-slate-400 text-sm">Lihat riwayat transaksi dan detail pembayaran kasir.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-500 my-auto" />
          <input
            type="text"
            placeholder="Cari ID Transaksi, metode, kasir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 pl-9 pr-4 placeholder-slate-655 focus:outline-none focus:border-emerald-500 transition-all text-xs"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Hari Ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">Waktu</th>
                <th className="p-4 text-right">Total Transaksi</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Kasir</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.map((sale) => {
                const isExpanded = expandedSaleId === sale.id
                return (
                  <>
                    <tr
                      key={sale.id}
                      onClick={() => toggleExpand(sale.id)}
                      className="hover:bg-slate-850/40 transition-all cursor-pointer"
                    >
                      <td className="p-4 font-bold text-slate-200">{sale.id}</td>
                      <td className="p-4 text-slate-400">{new Date(sale.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td className="p-4 text-right font-bold text-emerald-400">{formatIDR(sale.total)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sale.paymentMethod === 'Cash' ? 'bg-emerald-500/10 text-emerald-400' :
                          sale.paymentMethod === 'Card' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{sale.cashier}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(sale.id)
                          }}
                          className="text-slate-400 hover:text-white transition-all inline-flex items-center gap-1.5 font-medium"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Detail
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Invoice Details */}
                    {isExpanded && (
                      <tr className="bg-slate-950/30">
                        <td colSpan="6" className="p-5 border-t border-slate-850/80">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-350">
                            {/* Products purchased */}
                            <div className="space-y-3">
                              <h5 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-450" />
                                Rincian Pesanan
                              </h5>
                              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-2">
                                {sale.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-xs">
                                    <span>{item.name} <span className="text-slate-500">x{item.quantity}</span></span>
                                    <span className="font-medium text-slate-200">{formatIDR(item.subtotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Transaction details & mock Print */}
                            <div className="space-y-3">
                              <h5 className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                                <span>Rincian Pembayaran</span>
                                <button
                                  onClick={() => window.print()}
                                  className="text-emerald-400 hover:text-emerald-350 text-[10px] inline-flex items-center gap-1 font-semibold bg-emerald-500/10 px-2 py-1 rounded"
                                >
                                  <Printer className="w-3 h-3" /> Cetak Ulang Struk
                                </button>
                              </h5>
                              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-2.5 text-xs">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span>{formatIDR(sale.subtotal)}</span>
                                </div>
                                {sale.discountPercent > 0 && (
                                  <div className="flex justify-between text-amber-400">
                                    <span>Diskon ({sale.discountPercent}%)</span>
                                    <span>-{formatIDR(sale.discountAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Pajak (10%)</span>
                                  <span>{formatIDR(sale.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-white border-t border-slate-800/60 pt-2 text-sm">
                                  <span>Total Dibayar</span>
                                  <span className="text-emerald-400">{formatIDR(sale.total)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-500">
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
