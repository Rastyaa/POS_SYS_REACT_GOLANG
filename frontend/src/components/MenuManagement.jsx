import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Plus, Edit2, Trash2, Search, X, Image, Tag, DollarSign, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MenuManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = usePosStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', price: '', cost: '', stock: '', category: 'Kopi', image: ''
  })

  // Format Helper
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Dynamic Categories merge with standard resto categories
  const defaultCategories = ['Makanan Utama', 'Minuman', 'Cemilan', 'Dessert', 'Kopi']
  const categories = ['Semua', ...new Set([...defaultCategories, ...products.map((p) => p.category).filter(Boolean)])]

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setFormData({ name: '', sku: `SKU-${Date.now().toString().slice(-4)}`, description: '', price: '', cost: '', stock: '', category: 'Makanan Utama', image: '' })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setFormData({ ...p })
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
        toast.success('Menu berhasil diperbarui!')
        setEditingProduct(null)
      } else {
        await addProduct(formData)
        toast.success('Menu baru berhasil ditambahkan!')
        setIsAddOpen(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu!')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      try {
        await deleteProduct(id)
        toast.success('Menu berhasil dihapus!')
      } catch (err) {
        toast.error('Gagal menghapus menu dari database!')
      }
    }
  }

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 relative transition-colors animate-fadeIn min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manajemen Menu
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Kelola katalog produk, harga, dan stok barang secara real-time.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-lg shadow-sm active:scale-[0.98] transition-colors text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Tambah Menu Baru
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors z-10 relative">
        {/* Search */}
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute inset-y-0 left-4 flex items-center w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 my-auto transition-colors" />
          <input
            type="text"
            placeholder="Cari nama menu atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-3 pl-11 pr-4 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-colors text-sm font-semibold"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer shadow-sm ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 relative z-10">
        {filteredProducts.map((p) => (
          <div key={p.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative">
            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border-b border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center">
              {p.image ? (
                <img src={p.image} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Image+Error' }} className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Image className="w-8 h-8 mb-1 opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                </div>
              )}
              <span className="absolute top-3 left-3 text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm">
                {p.category}
              </span>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">SKU: {p.sku}</p>
                {p.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 line-clamp-2">{p.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest">Harga</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{formatIDR(p.price)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest">Stok</p>
                  <p className={`font-bold text-sm ${p.stock <= 10 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]' : 'text-slate-700 dark:text-slate-300'}`}>{p.stock}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="inline-flex items-center justify-center bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 p-2 rounded-xl border border-rose-200/60 dark:border-rose-800/40 transition-all shadow-sm cursor-pointer hover:shadow-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative z-10">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 dark:text-white text-lg font-extrabold">Tidak ada menu yang sesuai.</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Coba gunakan kata kunci lain atau pilih kategori berbeda.</p>
        </div>
      )}

      {/* Add / Edit modal */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 dark:bg-slate-950/70 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm relative animate-slideUp overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{editingProduct ? 'Update Data Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => { setIsAddOpen(false); setEditingProduct(null) }} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 pt-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Nama Menu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    placeholder="Contoh: Es Kopi Susu Aren"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> SKU / Kode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Deskripsi</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-900 dark:text-white shadow-inner resize-none"
                  placeholder="Deskripsi singkat menu untuk pelanggan..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Harga Jual *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    placeholder="25000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Modal / HPP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Stok Awal *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner appearance-none"
                  >
                    {categories.filter(c => c !== 'Semua').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> URL Gambar
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingProduct(null) }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 dark:from-indigo-500 dark:to-indigo-400 text-white font-black px-8 py-3 rounded-xl text-sm shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/20"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
