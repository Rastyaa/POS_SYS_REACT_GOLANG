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
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
          <Check className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Pesanan Diterima!</h1>
        <p className="text-slate-500 font-medium max-w-xs text-sm sm:text-base">Pesanan Anda untuk Meja {tableNumber} sedang disiapkan oleh dapur kami. Mohon tunggu sebentar.</p>
        <button onClick={() => setIsSuccess(false)} className="mt-8 bg-slate-900 text-white font-bold py-3 px-8 rounded-lg shadow-sm">Pesan Lagi</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 sm:bg-slate-50 font-sans text-slate-900 animate-fadeIn">
      <div className="max-w-lg mx-auto min-h-screen bg-slate-50 pb-28 shadow-none sm:shadow-xl">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-tight">RestoPOS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Meja {tableNumber}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-5 space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Pilih Pesanan Anda</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Sentuh makanan untuk menambah ke keranjang.</p>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 sm:-mx-5 sm:px-5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-semibold text-sm">Menu tidak ditemukan.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {filteredProducts.map(p => {
                const qty = getQuantity(p.id)
                return (
                  <div key={p.id} className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden min-w-0">
                    <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2.5">
                      <img src={p.image} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Image+Error' }} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight mb-1 line-clamp-2 min-h-[2.2em]">{p.name}</h3>
                      <p className="text-xs font-black text-indigo-600 mb-2.5">{formatIDR(p.price)}</p>
                    </div>

                    {/* Controls */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-1 border border-indigo-100">
                        <button onClick={() => decreaseQuantity(p.id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white text-indigo-600 flex items-center justify-center shadow-sm font-bold active:scale-95 shrink-0">
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-black text-indigo-700 text-sm">{qty}</span>
                        <button onClick={() => addToCart(p)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-sm font-bold active:scale-95 shrink-0">
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}

                    {/* Stock tag */}
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-3.5 left-3.5 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Sisa {p.stock}</span>
                    )}
                    {p.stock <= 0 && (
                      <span className="absolute top-3.5 left-3.5 bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Habis</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp">
            <div className="max-w-lg mx-auto p-4 sm:p-5 bg-gradient-to-t from-white via-white/95 to-transparent">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-indigo-600 text-white rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-md active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center relative shrink-0">
                    <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-indigo-600">{totalItems}</span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Total Pesanan</p>
                    <p className="font-black text-sm sm:text-base truncate">{formatIDR(totalAmount)}</p>
                  </div>
                </div>
                <div className="bg-white text-slate-900 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                  Lihat <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-sm relative animate-slideUp max-h-[92vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">Rincian Pesanan</h3>
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
              
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-600 uppercase text-xs tracking-widest">Total Bayar Nanti</span>
                <span className="font-black text-xl text-slate-900">{formatIDR(totalAmount)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors active:scale-95">Kembali</button>
                <button type="submit" className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-sm transition-colors shadow-sm active:scale-95">Kirim Pesanan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
