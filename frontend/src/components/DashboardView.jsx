import { usePosStore } from '../store/posStore'
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'

export default function DashboardView() {
  const { salesHistory, products } = usePosStore()

  // Format helper
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Calculations
  const totalRevenue = salesHistory.reduce((sum, s) => sum + s.total, 0)
  const totalProfit = salesHistory.reduce((sum, s) => sum + (s.profit || 0), 0)
  const totalOrders = salesHistory.length
  const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const lowStockProducts = products.filter((p) => p.stock <= 10)

  // Calculate sales by payment method
  const salesByPayment = salesHistory.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
    return acc
  }, {})

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-slate-400 text-sm">Lihat performa penjualan dan status inventaris terbaru.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rev Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-xl font-bold">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Keuntungan Bersih</span>
            <h3 className="text-xl font-bold">{formatIDR(totalProfit)}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Transaksi</span>
            <h3 className="text-xl font-bold">{totalOrders} Pesanan</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Rata-rata Order</span>
            <h3 className="text-xl font-bold">{formatIDR(avgOrderVal)}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stok Menipis (≤10)
            </h4>
            <span className="bg-red-500/15 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {lowStockProducts.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">Semua stok produk mencukupi.</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    Stok: {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions & Payment Channels */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4 lg:col-span-2">
          <h4 className="font-semibold text-sm border-b border-slate-800/80 pb-3">Performa Pembayaran & Penjualan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Metrik Pembayaran */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metode Pembayaran</h5>
              <div className="space-y-2">
                {['Cash', 'Card', 'QRIS'].map((method) => {
                  const amount = salesByPayment[method] || 0
                  const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{method}</span>
                        <span className="text-slate-400">{formatIDR(amount)} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${method === 'Cash' ? 'bg-emerald-500' : method === 'Card' ? 'bg-blue-500' : 'bg-indigo-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Riwayat Ringkas */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3 Transaksi Terakhir</h5>
              <div className="space-y-2">
                {salesHistory.slice(0, 3).map((s) => (
                  <div key={s.id} className="text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-300">{s.id}</p>
                      <p className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleTimeString('id-ID')}</p>
                    </div>
                    <span className="font-semibold text-emerald-400">{formatIDR(s.total)}</span>
                  </div>
                ))}
                {salesHistory.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-6">Belum ada transaksi hari ini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
