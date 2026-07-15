import { useMemo, useState } from 'react'
import { usePosStore } from '../store/posStore'
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, RefreshCw, Flame } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CATEGORY_COLORS = {
  'Makanan Utama': '#4f46e5',
  'Minuman': '#0ea5e9',
  'Kopi': '#d97706',
  'Dessert': '#e11d48',
  'Cemilan': '#059669',
}
const FALLBACK_COLOR = '#64748b'
const PAYMENT_COLORS = ['#4f46e5', '#0ea5e9', '#059669']

const RANGE_OPTIONS = [
  { key: 'today', label: 'Hari Ini', days: 0 },
  { key: '7d', label: '7 Hari', days: 6 },
  { key: '30d', label: '30 Hari', days: 29 },
]

export default function DashboardView() {
  const { salesHistory, products } = usePosStore()
  const [range, setRange] = useState('7d')

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // All-time stat cards
  const totalRevenue = salesHistory.reduce((sum, s) => sum + s.total, 0)
  const totalProfit = salesHistory.reduce((sum, s) => sum + (s.profit || 0), 0)
  const totalOrders = salesHistory.length
  const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const lowStockProducts = products.filter((p) => p.stock <= 10)

  // Payment method distribution
  const salesByPayment = salesHistory.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
    return acc
  }, {})
  const paymentData = Object.keys(salesByPayment).map((key) => ({ name: key, value: salesByPayment[key] }))

  // Produk terlaris (by qty terjual, all-time)
  const topProducts = useMemo(() => {
    const qtyMap = {}
    salesHistory.forEach((sale) => {
      ;(sale.items || []).forEach((item) => {
        qtyMap[item.name] = (qtyMap[item.name] || 0) + item.quantity
      })
    })
    return Object.entries(qtyMap)
      .map(([name, qty]) => ({ name: name.length > 18 ? `${name.slice(0, 18)}…` : name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
  }, [salesHistory])

  // Penjualan per kategori (all-time)
  const categoryData = useMemo(() => {
    const categoryById = {}
    products.forEach((p) => { categoryById[p.id] = p.category })
    const revenueMap = {}
    salesHistory.forEach((sale) => {
      ;(sale.items || []).forEach((item) => {
        const cat = categoryById[item.product_id] || categoryById[item.id] || 'Lainnya'
        revenueMap[cat] = (revenueMap[cat] || 0) + (item.subtotal || item.price * item.quantity)
      })
    })
    return Object.entries(revenueMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [salesHistory, products])

  // Tren pendapatan dengan filter rentang tanggal
  const rangeStart = useMemo(() => {
    const opt = RANGE_OPTIONS.find((o) => o.key === range)
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - opt.days)
    return d
  }, [range])

  const trendData = useMemo(() => {
    const filtered = salesHistory.filter((s) => new Date(s.timestamp) >= rangeStart)
    const map = new Map()
    filtered.forEach((s) => {
      const d = new Date(s.timestamp)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      map.set(key, { label, value: (map.get(key)?.value || 0) + s.total })
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
  }, [salesHistory, rangeStart])

  // Jam sibuk (peak hours, all-time)
  const peakHoursData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}`, value: 0 }))
    salesHistory.forEach((s) => {
      const h = new Date(s.timestamp).getHours()
      buckets[h].value += s.total
    })
    return buckets
  }, [salesHistory])

  const axisTick = { fontSize: 10, fill: '#94a3b8' }
  const tooltipStyle = { borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Ringkasan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lihat performa penjualan dan status inventaris Anda secara real-time.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Transaksi Keseluruhan</p>
          <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{totalOrders} Pesanan</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formatIDR(totalRevenue)}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Keuntungan Bersih</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formatIDR(totalProfit)}</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Transaksi</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{totalOrders} <span className="text-sm font-semibold text-slate-400">Trx</span></h3>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Rata-rata Order</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{formatIDR(avgOrderVal)}</h3>
          </div>
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row: Tren Pendapatan + Distribusi Pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tren Pendapatan</h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    range === opt.key ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[220px] w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Belum ada transaksi pada rentang ini.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatIDR(value)} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Distribusi Pembayaran</h4>
          <div className="h-[220px] w-full">
            {paymentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Belum ada data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                    {paymentData.map((entry, index) => (
                      <Cell key={entry.name} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatIDR(value)} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row: Produk Terlaris + Penjualan per Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Produk Terlaris</h4>
          <div className="h-[240px] w-full">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Belum ada penjualan.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:opacity-10" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={axisTick} width={110} />
                  <Tooltip formatter={(value) => [`${value} terjual`, 'Qty']} contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="qty" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Penjualan per Kategori</h4>
          <div className="h-[240px] w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">Belum ada penjualan.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} interval={0} angle={-15} dy={10} height={40} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatIDR(value)} contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || FALLBACK_COLOR} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row: Jam Sibuk + Stok Menipis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" /> Jam Sibuk (Peak Hours)
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={axisTick} interval={1} tickFormatter={(h) => `${h}:00`} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip formatter={(value) => formatIDR(value)} labelFormatter={(h) => `Jam ${h}:00`} contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stok Menipis
            </h4>
            <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {lowStockProducts.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2 py-8">
                <RefreshCw className="w-6 h-6 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Stok Aman</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-md object-cover border border-slate-100 dark:border-slate-700" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">SKU: {p.sku}</p>
                    </div>
                  </div>
                  <div className={`ml-2 text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${p.stock === 0 ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
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
