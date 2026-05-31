import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Plus, Edit2, Trash2, Search, X, Image } from 'lucide-react'

export default function MenuManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = usePosStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', cost: '', stock: '', category: 'Coffee', image: ''
  })

  // Format Helper
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Dynamic Categories merge with standard resto categories
  const defaultCategories = ['Makanan Utama', 'Minuman', 'Cemilan', 'Dessert']
  const categories = ['Semua', ...new Set([...defaultCategories, ...products.map((p) => p.category).filter(Boolean)])]

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setFormData({ name: '', sku: `SKU-${Date.now().toString().slice(-4)}`, price: '', cost: '', stock: '', category: 'Makanan Utama', image: '' })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setFormData({ ...p })
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (editingProduct) {
      updateProduct(editingProduct.id, formData)
      setEditingProduct(null)
    } else {
      addProduct(formData)
      setIsAddOpen(false)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      deleteProduct(id)
    }
  }

  return (
    <div className="space-y-6 text-slate-800 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Menu</h1>
          <p className="text-slate-500 text-sm">Kelola katalog produk, harga, dan stok barang.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-sm self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" /> Tambah Menu Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
          <input
            type="text"
            placeholder="Cari nama menu atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 pl-9 pr-4 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all text-xs font-medium"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-650 border border-transparent hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden shrink-0 border-b border-slate-100">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Image className="w-10 h-10" />
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200">
                {p.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-slate-950">{p.name}</h4>
                <p className="text-[10px] text-slate-450 uppercase font-bold">SKU: {p.sku}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-150 pt-2.5">
                <div>
                  <p className="text-slate-450 text-[10px] uppercase font-bold">Harga</p>
                  <p className="font-bold text-slate-800">{formatIDR(p.price)}</p>
                </div>
                <div>
                  <p className="text-slate-450 text-[10px] uppercase font-bold">Stok</p>
                  <p className={`font-bold ${p.stock <= 10 ? 'text-amber-600' : 'text-slate-600'}`}>{p.stock} pcs</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-slate-150">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-650 p-1.5 rounded-lg border border-red-200 transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-slate-450 text-sm font-semibold">Tidak ada menu yang sesuai kriteria.</p>
        </div>
      )}

      {/* Add / Edit modal */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/65 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">{editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => { setIsAddOpen(false); setEditingProduct(null) }} className="text-slate-450 hover:text-slate-700 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Nama Menu *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                    placeholder="Contoh: Es Kopi Susu Aren"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">SKU / Kode *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                    placeholder="25000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Stok Awal *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-850"
                  >
                    {categories.filter(c => c !== 'Semua').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold">Link Gambar / Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-slate-800 focus:bg-white text-xs font-semibold text-slate-800"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingProduct(null) }}
                  className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md active:scale-[0.98] transition-all"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
