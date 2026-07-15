import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Plus, Minus, Trash2, Search, ShoppingCart, Percent } from 'lucide-react'
import PaymentModal from './PaymentModal'

export default function OrderView() {
  const { products, cart, discount, taxRate, addToCart, updateCartQuantity, removeFromCart, setDiscount } = usePosStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  // Helpers
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Dynamic Categories merge with standard resto categories
  const defaultCategories = ['Makanan Utama', 'Minuman', 'Kopi', 'Cemilan', 'Dessert']
  const categories = ['Semua', ...new Set([...defaultCategories, ...products.map((p) => p.category).filter(Boolean)])]

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const taxAmount = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + taxAmount

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-slate-800 dark:text-slate-200 h-[calc(100vh-140px)]">
      
      {/* Categories Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-[150px] shrink-0 space-y-2 overflow-y-auto pb-4 scrollbar-hide">
        <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 px-1">Kategori Menu</h3>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-md shadow-slate-900/10 dark:shadow-white/5 scale-[1.02]'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col space-y-4 min-w-0">
        
        {/* Mobile Categories & Search */}
        <div className="flex flex-col gap-3">
          {/* Mobile Categories (Horizontal Swipe) */}
          <div className="md:hidden flex gap-2 overflow-x-auto w-full pb-1 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-2 rounded-2xl shadow-sm transition-colors">
            <Search className="absolute inset-y-0 left-5 flex items-center w-4 h-4 text-slate-400 my-auto" />
            <input
              type="text"
              placeholder="Cari menu atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white rounded-xl py-2.5 pl-9 pr-4 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all text-xs font-bold"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0
            const cartItem = cart.find((item) => item.product.id === p.id)
            const cartQty = cartItem?.quantity || 0

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => { if (!isOutOfStock) addToCart(p); }}
                onKeyDown={(e) => { if (!isOutOfStock && (e.key === 'Enter' || e.key === ' ')) addToCart(p); }}
                className={`group flex flex-col text-left bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md active:scale-[0.98] transition-all relative cursor-pointer ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="aspect-[4/3] w-full bg-white dark:bg-slate-800 relative overflow-hidden shrink-0 border-b border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Image+Error' }} className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-sm" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-slate-350 dark:text-slate-500 text-xs font-medium">No Image</span>
                    </div>
                  )}
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
                      <span className="bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-bold border border-red-200 dark:border-red-900/50">Habis</span>
                    </div>
                  ) : p.stock <= 5 ? (
                    <span className="absolute top-2 left-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 uppercase tracking-wider z-10">
                      Sisa {p.stock}
                    </span>
                  ) : null}
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white line-clamp-2 leading-tight min-h-[40px]">{p.name || 'Produk Tanpa Nama'}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mt-1">SKU: {p.sku || '-'}</p>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{formatIDR(p.price || 0)}</span>
                    {cartQty > 0 && (
                      <span className="bg-blue-650 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm animate-scaleIn">
                        {cartQty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-450 dark:text-slate-500 text-sm font-semibold">Menu tidak ditemukan.</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar Column */}
      <div className="w-full lg:w-[360px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-4 shadow-sm transition-colors">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800 dark:text-white">
            <ShoppingCart className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            Keranjang
          </h3>
          <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} Item
          </span>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2 py-16">
              <ShoppingCart className="w-8 h-8 opacity-40" />
              <p className="text-xs font-semibold">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex gap-3 animate-slideIn">
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.product.name}</h5>
                  <p className="text-[10px] text-slate-650 dark:text-slate-400 font-semibold">{formatIDR(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-white w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-red-650 transition-all ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount & Totals */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
          {/* Discount Field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-slate-400">
              <Percent className="w-3.5 h-3.5" />
            </span>
            <input
              type="number"
              placeholder="Diskon (%)"
              min="0"
              max="100"
              value={discount || ''}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2 pl-9 pr-4 placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800 text-xs font-medium"
            />
          </div>

          {/* Checkout Totals */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                <span>Diskon ({discount}%)</span>
                <span>-{formatIDR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
              <span>Pajak (10%)</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatIDR(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm border-t border-slate-200 dark:border-slate-800 pt-2">
              <span>Total</span>
              <span className="text-slate-900 dark:text-white font-extrabold text-base">{formatIDR(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs shadow-md shadow-slate-900/10 active:scale-[0.99] cursor-pointer"
          >
            Proses Pembayaran
          </button>
        </div>

        {/* Modal */}
        <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
      </div>
    </div>
  )
}
