import { create } from 'zustand'
import axios from 'axios'
import { getLocalDb } from '../supabase'

const API_BASE = 'http://localhost:8080/api'

export const usePosStore = create((set, get) => ({
  // Authentication
  user: localStorage.getItem('pos_user') ? JSON.parse(localStorage.getItem('pos_user')) : null,
  login: (username, password) => {
    if ((username === 'admin' && password === 'admin') || (username === 'cashier' && password === 'cashier')) {
      const userData = { username, role: username === 'admin' ? 'Administrator' : 'Cashier' }
      localStorage.setItem('pos_user', JSON.stringify(userData))
      set({ user: userData })
      return true
    }
    return false
  },
  logout: () => {
    localStorage.removeItem('pos_user')
    set({ user: null })
  },

  // Products/Catalog
  products: [],
  isLoadingProducts: false,
  
  fetchProducts: async () => {
    set({ isLoadingProducts: true })
    try {
      const res = await axios.get(`${API_BASE}/products`)
      set({ products: res.data || [] })
    } catch (err) {
      console.warn('Gagal terhubung ke Golang API, menggunakan Local Storage:', err.message)
      set({ products: getLocalDb.getProducts() })
    } finally {
      set({ isLoadingProducts: false })
    }
  },

  addProduct: async (product) => {
    const newProduct = {
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      cost: Number(product.cost),
      stock: Number(product.stock),
      category: product.category,
      image: product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60'
    }

    try {
      const res = await axios.post(`${API_BASE}/products`, newProduct)
      set({ products: [...get().products, res.data] })
    } catch (err) {
      console.warn('Gagal kirim produk ke Golang API, menyimpan secara lokal:', err.message)
      const localProduct = { ...newProduct, id: Date.now().toString() }
      const updated = [...get().products, localProduct]
      getLocalDb.saveProducts(updated)
      set({ products: updated })
    }
  },

  updateProduct: async (id, updatedFields) => {
    const cleanedFields = {
      name: updatedFields.name,
      sku: updatedFields.sku,
      price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
      cost: updatedFields.cost !== undefined ? Number(updatedFields.cost) : undefined,
      stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : undefined,
      category: updatedFields.category,
      image: updatedFields.image
    }
    Object.keys(cleanedFields).forEach(key => cleanedFields[key] === undefined && delete cleanedFields[key])

    try {
      await axios.put(`${API_BASE}/products/${id}`, cleanedFields)
      set({
        products: get().products.map((p) => (p.id === id ? { ...p, ...cleanedFields } : p))
      })
    } catch (err) {
      console.warn('Gagal update produk di Golang API, menggunakan lokal:', err.message)
      const updated = get().products.map((p) => (p.id === id ? { ...p, ...cleanedFields } : p))
      getLocalDb.saveProducts(updated)
      set({ products: updated })
    }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`)
      set({ products: get().products.filter((p) => p.id !== id) })
    } catch (err) {
      console.warn('Gagal hapus produk di Golang API, menghapus lokal:', err.message)
      const updated = get().products.filter((p) => p.id !== id)
      getLocalDb.saveProducts(updated)
      set({ products: updated })
    }
  },

  // Cart Management
  cart: [],
  discount: 0, 
  taxRate: 0.1, 

  addToCart: (product) => {
    const existing = get().cart.find((item) => item.product.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock) return false
      set({
        cart: get().cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      })
    } else {
      if (product.stock <= 0) return false
      set({ cart: [...get().cart, { product, quantity: 1 }] })
    }
    return true
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    const product = get().products.find((p) => p.id === productId)
    if (product && quantity > product.stock) {
      return
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) })
  },

  setDiscount: (percent) => set({ discount: Math.max(0, Math.min(100, percent)) }),
  clearCart: () => set({ cart: [], discount: 0 }),

  // Checkout and Sales History
  salesHistory: [],
  isLoadingSales: false,

  fetchSalesHistory: async () => {
    set({ isLoadingSales: true })
    try {
      const res = await axios.get(`${API_BASE}/sales`)
      set({ salesHistory: res.data || [] })
    } catch (err) {
      console.warn('Gagal memuat history dari Golang API, menggunakan lokal:', err.message)
      set({ salesHistory: getLocalDb.getSales() })
    } finally {
      set({ isLoadingSales: false })
    }
  },

  checkout: async (paymentMethod, cashAmount = 0) => {
    const { cart, discount, taxRate, products } = get()
    if (cart.length === 0) return null

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const discountAmount = subtotal * (discount / 100)
    const taxAmount = (subtotal - discountAmount) * taxRate
    const total = subtotal - discountAmount + taxAmount
    const totalCost = cart.reduce((sum, item) => sum + (item.product.cost || 0) * item.quantity, 0)
    const profit = total - taxAmount - totalCost
    const change = paymentMethod === 'Cash' ? Math.max(0, cashAmount - total) : 0

    const trxId = `TRX-${Date.now().toString().slice(-6)}`
    const timestamp = new Date().toISOString()

    const newSale = {
      id: trxId,
      timestamp,
      items: cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      })),
      subtotal,
      discount_percent: discount,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total,
      profit,
      payment_method: paymentMethod,
      cash_received: paymentMethod === 'Cash' ? cashAmount : total,
      change,
      cashier: get().user?.username || 'Cashier'
    }

    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((item) => item.product.id === p.id)
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) }
      }
      return p
    })

    try {
      await axios.post(`${API_BASE}/sales`, newSale)
      set({
        products: updatedProducts,
        salesHistory: [
          {
            ...newSale,
            discountPercent: discount,
            discountAmount,
            taxAmount,
            cashReceived: newSale.cash_received,
            paymentMethod: newSale.payment_method,
            items: newSale.items.map(i => ({ ...i, id: i.product_id }))
          },
          ...get().salesHistory
        ],
        cart: [],
        discount: 0
      })
    } catch (err) {
      console.warn('Gagal checkout ke Golang API, menyimpan secara lokal:', err.message)
      getLocalDb.saveProducts(updatedProducts)
      
      const localSale = {
        ...newSale,
        discountPercent: discount,
        discountAmount,
        taxAmount,
        cashReceived: newSale.cash_received,
        paymentMethod: newSale.payment_method,
        items: newSale.items.map(i => ({ ...i, id: i.product_id }))
      }
      getLocalDb.saveSale(localSale)

      set({
        products: updatedProducts,
        salesHistory: [localSale, ...get().salesHistory],
        cart: [],
        discount: 0
      })
    }

    return {
      ...newSale,
      discountPercent: discount,
      discountAmount,
      taxAmount,
      cashReceived: newSale.cash_received,
      paymentMethod: newSale.payment_method,
      items: newSale.items.map(i => ({ ...i, id: i.product_id }))
    }
  }
}))
