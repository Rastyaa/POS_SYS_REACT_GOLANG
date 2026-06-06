import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePosStore } from '../store/posStore'
import { ShoppingCart, Plus, Minus, Check, ArrowRight, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerOrderView() {
  const { tableNumber } = useParams()
  const { products, fetchPublicProducts, submitTableOrder, isLoadingProducts } = usePosStore()
  const [customerName, setCustomerName] = useState('')
  const [cart, setCart] = useState([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  useEffect(() => {
    fetchPublicProducts()
  }, [fetchPublicProducts])

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Categories extraction
  const defaultCategories = ['Makanan Utama', 'Minuman', 'Cemilan', 'Dessert', 'Kopi']
  const categories = ['Semua', ...new Set([...defaultCategories, ...products.map(p => p.category).filter(Boolean)])]

  const filteredProducts = products.filter(p => selectedCategory === 'Semua' || p.category === selectedCategory)

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Stok habis')
          return prev
        }
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } : item)
      } else {
        if (product.stock <= 0) {
          toast.error('Stok kosong')
          return prev
        }
        return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, subtotal: product.price }]
      }
    })
  }

  const decreaseQuantity = (productId) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product_id === productId) {
          if (item.quantity <= 1) return null
          return { ...item, quantity: item.quantity - 1, subtotal: (item.quantity - 1) * item.price }
        }
        return item
      }).filter(Boolean)
    })
  }

  const getQuantity = (productId) => {
    return cart.find(item => item.product_id === productId)?.quantity || 0
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return toast.error('Keranjang kosong')
    
    try {
      await submitTableOrder(tableNumber, customerName, cart, totalAmount)
      setIsSuccess(true)
      setCart([])
      setIsCheckoutOpen(false)
    } catch (err) {
      toast.error('Gagal mengirim pesanan. Coba lagi.')
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 animate-bounce">
          <Check className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Pesanan Diterima!</h1>
        <p className="text-slate-500 font-medium max-w-xs">Pesanan Anda untuk Meja {tableNumber} sedang disiapkan oleh dapur kami. Mohon tunggu sebentar.</p>
        <button onClick={() => setIsSuccess(false)} className="mt-8 bg-slate-900 text-white font-bold py-3 px-8 rounded-full shadow-lg">Pesan Lagi</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative overflow-hidden text-slate-900 animate-fadeIn">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight">RestoPOS</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meja {tableNumber}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Pilih Pesanan Anda</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Sentuh makanan untuk menambah ke keranjang.</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-5 px-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Menus */}
        {isLoadingProducts ? (
          <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Memuat Menu...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(p => {
              const qty = getQuantity(p.id)
              return (
                <div key={p.id} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-3">
                    <img src={p.image} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Image+Error' }} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">{p.name}</h3>
                    <p className="text-xs font-black text-indigo-600 mb-3">{formatIDR(p.price)}</p>
                  </div>
                  
                  {/* Controls */}
                  {qty === 0 ? (
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-1 border border-indigo-100">
                      <button onClick={() => decreaseQuantity(p.id)} className="w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-sm font-bold shadow-indigo-200/50 active:scale-95">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-indigo-700">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm font-bold shadow-indigo-600/30 active:scale-95">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Stock tag */}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Sisa {p.stock}</span>
                  )}
                  {p.stock <= 0 && (
                    <span className="absolute top-4 left-4 bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Habis</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent z-40 animate-slideUp">
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgb(0,0,0,0.2)] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">{totalItems}</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Total Pesanan</p>
                <p className="font-black text-base">{formatIDR(totalAmount)}</p>
              </div>
            </div>
            <div className="bg-white text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              Lihat <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl relative animate-slideUp">
            <h3 className="text-xl font-black text-slate-900 mb-1">Rincian Pesanan</h3>
            <p className="text-xs font-bold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-lg">Meja {tableNumber}</p>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-indigo-600 bg-indigo-50 w-7 h-7 flex items-center justify-center rounded-lg">{item.quantity}x</span>
                    <span className="font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-black text-slate-900">{formatIDR(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nama Anda (Opsional)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="font-extrabold text-slate-600 uppercase text-xs tracking-widest">Total Bayar Nanti</span>
                <span className="font-black text-xl text-slate-900">{formatIDR(totalAmount)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-colors active:scale-95">Kembali</button>
                <button type="submit" className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm transition-colors shadow-lg shadow-indigo-600/30 active:scale-95">Kirim Pesanan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
