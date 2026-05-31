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
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Ringkasan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Lihat performa penjualan dan status inventaris terbaru.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rev Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Keuntungan Bersih</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{formatIDR(totalProfit)}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Transaksi</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{totalOrders} Pesanan</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Rata-rata Order</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{formatIDR(avgOrderVal)}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 lg:col-span-1 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-650 animate-pulse" />
              Stok Menipis (≤10)
            </h4>
            <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-red-150 dark:border-red-900/50 shadow-sm">
              {lowStockProducts.length}
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-8 font-semibold">Semua stok produk mencukupi.</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-slate-850 dark:text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">SKU: {p.sku}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-extrabold border ${p.stock === 0 ? 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/50' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'}`}>
                    Stok: {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions & Payment Channels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 lg:col-span-2 shadow-sm transition-colors">
          <h4 className="font-bold text-sm border-b border-slate-150 dark:border-slate-850 pb-3 text-slate-800 dark:text-slate-200">Performa Pembayaran & Penjualan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Metrik Pembayaran */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Metode Pembayaran</h5>
              <div className="space-y-2">
                {['Cash', 'Card', 'QRIS'].map((method) => {
                  const amount = salesByPayment[method] || 0
                  const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-650 dark:text-slate-350">{method}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">{formatIDR(amount)} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
              <h5 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">3 Transaksi Terakhir</h5>
              <div className="space-y-2">
                {salesHistory.slice(0, 3).map((s) => (
                  <div key={s.id} className="text-xs bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{s.id}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">{new Date(s.timestamp).toLocaleTimeString('id-ID')}</p>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{formatIDR(s.total)}</span>
                  </div>
                ))}
                {salesHistory.length === 0 && (
                  <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-6 font-semibold">Belum ada transaksi hari ini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
