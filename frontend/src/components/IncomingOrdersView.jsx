import { useEffect } from 'react'
import { usePosStore } from '../store/posStore'
import { Utensils, CheckCircle, Clock, Search, XCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IncomingOrdersView({ setActiveTab }) {
  const { tableOrders, fetchTableOrders, updateTableOrderStatus, checkout, addToCart, clearCart } = usePosStore()

  useEffect(() => {
    fetchTableOrders()
    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchTableOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchTableOrders])

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  const pendingOrders = tableOrders.filter(o => o.status === 'Pending')
  const servedOrders = tableOrders.filter(o => o.status === 'Served')

  const handleProcessOrder = async (id) => {
    try {
      await updateTableOrderStatus(id, 'Served')
      toast.success('Pesanan mulai diproses/disajikan')
    } catch (err) {
      toast.error('Gagal update status pesanan')
    }
  }

  const handleCancelOrder = async (id) => {
    if (window.confirm('Yakin ingin membatalkan pesanan meja ini?')) {
      try {
        await updateTableOrderStatus(id, 'Cancelled')
        toast.success('Pesanan dibatalkan')
      } catch (err) {
        toast.error('Gagal batalkan pesanan')
      }
    }
  }

  const handlePayOrder = async (order) => {
    if (window.confirm(`Proses pembayaran untuk Meja ${order.table_number}?`)) {
      try {
        // Clear current cart just in case
        clearCart()
        // Inject all items into the POS cart
        const { products } = usePosStore.getState()
        for (const item of order.items) {
          const product = products.find(p => p.id === item.product_id)
          if (product) {
            // Add quantity times
            for (let i = 0; i < item.quantity; i++) {
              addToCart(product)
            }
          } else {
            toast.error(`Produk ${item.name} tidak ditemukan di katalog`)
            return
          }
        }
        
        // Since we injected the cart, we can jump to Kasir view 
        // Wait, it's better to just do checkout directly if they pay cash?
        // Let's just update status to Paid and redirect to Kasir to let cashier handle the standard payment flow
        await updateTableOrderStatus(order.id, 'Paid')
        toast.success(`Pesanan Meja ${order.table_number} masuk ke Kasir`)
        setActiveTab('order')
      } catch (err) {
        toast.error('Gagal memproses pembayaran')
      }
    }
  }

  const OrderCard = ({ order, type }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
            type === 'Pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
          }`}>
            {order.table_number}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white">Meja {order.table_number}</h3>
            <p className="text-xs font-bold text-slate-500">{order.customer_name || 'Pelanggan'} • {new Date(order.created_at).toLocaleTimeString('id-ID')}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          type === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
        }`}>
          {type === 'Pending' ? 'Baru Masuk' : 'Sedang Makan'}
        </span>
      </div>

      <div className="space-y-2 mb-5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex gap-2 text-slate-700 dark:text-slate-300">
              <span className="font-black text-indigo-500">{item.quantity}x</span>
              <span className="font-semibold">{item.name}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{formatIDR(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mb-5">
        <span className="text-xs font-bold text-slate-500 uppercase">Total Tagihan</span>
        <span className="text-lg font-black text-slate-900 dark:text-white">{formatIDR(order.total)}</span>
      </div>

      <div className="flex gap-2">
        {type === 'Pending' ? (
          <>
            <button onClick={() => handleCancelOrder(order.id)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4" /> Tolak
            </button>
            <button onClick={() => handleProcessOrder(order.id)} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5">
              <Utensils className="w-4 h-4" /> Proses
            </button>
          </>
        ) : (
          <button onClick={() => handlePayOrder(order)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" /> Bawa ke Kasir
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Pesanan Meja
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Terima pesanan otomatis dari pindaian QR Code di meja.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Column */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl min-h-[500px]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Pesanan Baru Masuk</h2>
            <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{pendingOrders.length}</span>
          </div>
          
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} type="Pending" />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                Belum ada pesanan baru
              </div>
            )}
          </div>
        </div>

        {/* Served Column */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl min-h-[500px]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Sedang Disajikan</h2>
            <span className="ml-auto bg-blue-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{servedOrders.length}</span>
          </div>
          
          <div className="space-y-4">
            {servedOrders.map(order => (
              <OrderCard key={order.id} order={order} type="Served" />
            ))}
            {servedOrders.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                Tidak ada pesanan disajikan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
