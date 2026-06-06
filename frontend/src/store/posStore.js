import { create } from 'zustand'
import axios from 'axios'
import { getLocalDb } from '../supabase'

const API_BASE = 'http://localhost:8080/api'

// Initialize Axios Authorization header from localStorage on startup
const initialToken = localStorage.getItem('pos_token')
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`
}

// Initialize Dark/Light theme on startup
const initialTheme = localStorage.getItem('pos_theme') || 'light'
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

export const usePosStore = create((set, get) => ({
  // Theme state
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('pos_theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: next })
  },

  // Authentication
  user: (initialToken && localStorage.getItem('pos_user')) ? JSON.parse(localStorage.getItem('pos_user')) : null,
  token: initialToken || null,
  
  login: async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { username, password })
      if (res.data && res.data.success) {
        const { token, user } = res.data.data
        localStorage.setItem('pos_token', token)
        localStorage.setItem('pos_user', JSON.stringify(user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ token, user })
        return true
      }
      return false
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message)
      throw new Error(err.response?.data?.message || 'Gagal terhubung ke server login')
    }
  },
  
  logout: () => {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    delete axios.defaults.headers.common['Authorization']
    set({ user: null, token: null, products: [], salesHistory: [], cart: [], discount: 0, tableOrders: [] })
  },

  // Products/Catalog
  products: [],
  isLoadingProducts: false,
  
  fetchProducts: async () => {
    set({ isLoadingProducts: true })
    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=85'
    try {
      const res = await axios.get(`${API_BASE}/products`)
      let productsData = res.data?.success ? res.data.data : res.data
      if (!Array.isArray(productsData)) productsData = []
      const withPhotos = productsData.map(p => (p ? { ...p, image: p.image || defaultImg } : p))
      set({ products: withPhotos })
    } catch (err) {
      console.warn('Gagal terhubung ke Golang API, menggunakan Local Storage:', err.message)
      let localProducts = getLocalDb.getProducts()
      if (!Array.isArray(localProducts)) localProducts = []
      const withPhotos = localProducts.map(p => (p ? { ...p, image: p.image || defaultImg } : p))
      set({ products: withPhotos })
    } finally {
      set({ isLoadingProducts: false })
    }
  },

  fetchPublicProducts: async () => {
    set({ isLoadingProducts: true })
    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=85'
    try {
      const res = await axios.get(`${API_BASE}/public/products`)
      let productsData = res.data?.success ? res.data.data : res.data
      if (!Array.isArray(productsData)) productsData = []
      const withPhotos = productsData.map(p => (p ? { ...p, image: p.image || defaultImg } : p))
      set({ products: withPhotos })
    } catch (err) {
      console.warn('Gagal memuat produk publik, fallback lokal:', err.message)
      let localProducts = getLocalDb.getProducts()
      if (!Array.isArray(localProducts)) localProducts = []
      const withPhotos = localProducts.map(p => (p ? { ...p, image: p.image || defaultImg } : p))
      set({ products: withPhotos })
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
      image: product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=85'
    }

    try {
      const res = await axios.post(`${API_BASE}/products`, newProduct)
      const addedProduct = res.data.success ? res.data.data : res.data
      set({ products: [...get().products, addedProduct] })
    } catch (err) {
      console.warn('Gagal kirim produk ke Golang API, menyimpan secara lokal:', err.message)
      const localProduct = { ...newProduct, id: Date.now().toString() }
      const updated = [...get().products, localProduct]
      getLocalDb.saveProducts(updated)
      set({ products: updated })
      throw err
    }
  },

  updateProduct: async (id, updatedFields) => {
    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=85'
    const cleanedFields = {
      name: updatedFields.name,
      sku: updatedFields.sku,
      price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
      cost: updatedFields.cost !== undefined ? Number(updatedFields.cost) : undefined,
      stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : undefined,
      category: updatedFields.category,
      image: updatedFields.image || defaultImg
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
      throw err
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
      throw err
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
      const salesData = res.data.success ? res.data.data : res.data
      
      const mappedSales = (salesData || []).map(s => ({
        ...s,
        discountPercent: s.discount_percent !== undefined ? s.discount_percent : s.discountPercent,
        discountAmount: s.discount_amount !== undefined ? s.discount_amount : s.discountAmount,
        taxAmount: s.tax_amount !== undefined ? s.tax_amount : s.taxAmount,
        paymentMethod: s.payment_method || s.paymentMethod,
        cashReceived: s.cash_received !== undefined ? s.cash_received : s.cashReceived,
      }))
      
      set({ salesHistory: mappedSales })
    } catch (err) {
      console.warn('Gagal memuat history dari Golang API, menggunakan lokal:', err.message)
      set({ salesHistory: getLocalDb.getSales() })
    } finally {
      set({ isLoadingSales: false })
    }
  },

  checkout: async (paymentMethod, cashAmount = 0, customerName = '', tableNumber = '') => {
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
      cashier: get().user?.username || 'Cashier',
      customer_name: customerName,
      table_number: tableNumber
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
            customerName: newSale.customer_name,
            tableNumber: newSale.table_number,
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
        customerName: newSale.customer_name,
        tableNumber: newSale.table_number,
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
      customerName: newSale.customer_name,
      tableNumber: newSale.table_number,
      items: newSale.items.map(i => ({ ...i, id: i.product_id }))
    }
  },

  // Table Orders Management
  tableOrders: [],
  isLoadingTableOrders: false,

  fetchTableOrders: async () => {
    set({ isLoadingTableOrders: true })
    try {
      const res = await axios.get(`${API_BASE}/orders`)
      const ordersData = res.data?.success ? res.data.data : res.data
      set({ tableOrders: Array.isArray(ordersData) ? ordersData : [] })
    } catch (err) {
      console.warn('Gagal memuat pesanan meja:', err.message)
    } finally {
      set({ isLoadingTableOrders: false })
    }
  },

  submitTableOrder: async (tableNumber, customerName, items, total) => {
    const orderId = `TBL-${tableNumber}-${Date.now().toString().slice(-5)}`
    const payload = {
      id: orderId,
      table_number: tableNumber,
      customer_name: customerName,
      total,
      items
    }
    try {
      await axios.post(`${API_BASE}/public/orders`, payload)
      return true
    } catch (err) {
      console.error('Gagal mengirim pesanan meja:', err.message)
      throw err
    }
  },

  updateTableOrderStatus: async (id, status) => {
    try {
      await axios.put(`${API_BASE}/orders/${id}/status`, { status })
      set({
        tableOrders: get().tableOrders.map(o => o.id === id ? { ...o, status } : o)
      })
    } catch (err) {
      console.error('Gagal mengupdate status pesanan:', err.message)
      throw err
    }
  }
}))

// Add interceptor to automatically catch 401 errors and log the user out
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      delete axios.defaults.headers.common['Authorization']
      usePosStore.setState({ user: null, token: null, products: [], salesHistory: [] })
    }
    return Promise.reject(error)
  }
)
