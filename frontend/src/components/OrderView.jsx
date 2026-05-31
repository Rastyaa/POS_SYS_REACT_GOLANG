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

  // Filters
  const categories = ['Semua', 'Coffee', 'Non-Coffee', 'Bakery', 'Beverage']

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
    <div className="flex flex-col lg:flex-row gap-6 text-white h-[calc(100vh-140px)]">
      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col space-y-4 min-w-0">
        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 border border-slate-800 p-3 rounded-2xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-500 my-auto" />
            <input
              type="text"
              placeholder="Cari menu atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 pl-9 pr-4 placeholder-slate-650 focus:outline-none focus:border-emerald-500 transition-all text-xs"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-850 border border-slate-700 text-emerald-400'
                    : 'bg-slate-950/40 text-slate-400 border border-transparent hover:text-slate-350'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0
            const cartItem = cart.find((item) => item.product.id === p.id)
            const cartQty = cartItem?.quantity || 0

            return (
              <button
                key={p.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(p)}
                className={`group flex flex-col text-left bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 active:scale-[0.98] transition-all relative ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="aspect-[4/3] w-full bg-slate-950 relative overflow-hidden">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />}
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-full font-bold border border-red-500/30">Habis</span>
                    </div>
                  ) : p.stock <= 5 ? (
                    <span className="absolute top-2 left-2 bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                      Stok Sisa {p.stock}
                    </span>
                  ) : null}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 line-clamp-1">{p.name}</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">SKU: {p.sku}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-emerald-400 text-xs">{formatIDR(p.price)}</span>
                    {cartQty > 0 && (
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cartQty}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/10 border border-slate-850 rounded-2xl">
              <p className="text-slate-500 text-sm">Menu tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar Column */}
      <div className="w-full lg:w-[360px] flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            Keranjang
          </h3>
          <span className="bg-slate-850 border border-slate-700 text-slate-350 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} Item
          </span>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-16">
              <ShoppingCart className="w-8 h-8 opacity-25" />
              <p className="text-xs">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 flex gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-200 truncate">{item.product.name}</h5>
                  <p className="text-[10px] text-emerald-400 font-semibold">{formatIDR(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-all ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount & Totals */}
        <div className="border-t border-slate-800/80 pt-3 space-y-3">
          {/* Discount Field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pl-0.5 text-slate-500">
              <Percent className="w-3.5 h-3.5" />
            </span>
            <input
              type="number"
              placeholder="Diskon (%)"
              min="0"
              max="100"
              value={discount || ''}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Checkout Totals */}
          <div className="bg-slate-950/60 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Diskon ({discount}%)</span>
                <span>-{formatIDR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Pajak (10%)</span>
              <span>{formatIDR(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-sm border-t border-slate-800/60 pt-2">
              <span>Total</span>
              <span className="text-emerald-450">{formatIDR(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
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
