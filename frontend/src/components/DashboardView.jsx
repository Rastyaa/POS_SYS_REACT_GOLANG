import { usePosStore } from '../store/posStore'
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'

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

  const paymentData = Object.keys(salesByPayment).map(key => ({
    name: key,
    value: salesByPayment[key]
  }))
  const COLORS = ['#34d399', '#60a5fa', '#818cf8']; // Emerald, Blue, Indigo

  // Trend Data (Group by Day)
  const trendMap = salesHistory.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    acc[date] = (acc[date] || 0) + sale.total
    return acc
  }, {})
  const trendData = Object.keys(trendMap).map(date => ({ date, value: trendMap[date] })).reverse().slice(0, 7).reverse() // Last 7 days


  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Dashboard Ringkasan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Lihat performa penjualan dan status inventaris Anda secara real-time.</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 px-4 py-2 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Transaksi Hari Ini</p>
          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{totalOrders} Pesanan</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {/* Rev Card */}
        <div className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/30 relative z-10">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Profit Card */}
        <div className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Keuntungan Bersih</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatIDR(totalProfit)}</h3>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/30 relative z-10">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Transactions Card */}
        <div className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Total Transaksi</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalOrders} <span className="text-lg font-bold text-slate-400">Trx</span></h3>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm border border-amber-200/50 dark:border-amber-800/30 relative z-10">
            <ShoppingBag className="w-7 h-7" />
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Rata-rata Order</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatIDR(avgOrderVal)}</h3>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm border border-indigo-200/50 dark:border-indigo-800/30 relative z-10">
            <RefreshCw className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Recent Transactions & Payment Channels */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl space-y-6 lg:col-span-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-colors">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Analisis Pendapatan & Metode</h4>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Keseluruhan</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 h-[250px]">
            {/* Payment Metrics (Recharts Pie Chart) */}
            <div className="space-y-2 h-full flex flex-col">
              <h5 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Distribusi Pembayaran</h5>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatIDR(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent History or Line Chart */}
            <div className="space-y-2 h-full flex flex-col">
              <h5 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tren Pendapatan Harian</h5>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `Rp${value/1000}k`} />
                    <Tooltip 
                      formatter={(value) => formatIDR(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl space-y-5 lg:col-span-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-colors flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <h4 className="font-extrabold text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 drop-shadow-sm" />
              Stok Menipis
            </h4>
            <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-black shadow-sm">
              {lowStockProducts.length}
            </span>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2 py-10">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Stok Aman</p>
                <p className="text-xs text-center">Semua inventaris dalam kondisi mencukupi.</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-white dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-700" />
                    <div>
                      <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">SKU: {p.sku}</p>
                    </div>
                  </div>
                  <div className={`ml-3 text-[11px] px-2.5 py-1 rounded-lg font-black border shadow-sm ${p.stock === 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-650 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'}`}>
                    {p.stock} left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
