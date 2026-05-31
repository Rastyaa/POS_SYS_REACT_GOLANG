import { create } from 'zustand'
import { getLocalDb, supabase, isSupabaseConfigured } from '../supabase'

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true })
        if (error) throw error
        set({ products: data || [] })
      } catch (err) {
        console.error('Gagal mengambil produk dari Supabase, menggunakan lokal DB:', err)
        set({ products: getLocalDb.getProducts() })
      } finally {
        set({ isLoadingProducts: false })
      }
    } else {
      set({ products: getLocalDb.getProducts(), isLoadingProducts: false })
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

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
        if (error) throw error
        if (data) {
          set({ products: [...get().products, data[0]] })
        }
      } catch (err) {
        console.error('Gagal tambah produk ke Supabase:', err)
      }
    } else {
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
    // Remove undefined keys
    Object.keys(cleanedFields).forEach(key => cleanedFields[key] === undefined && delete cleanedFields[key])

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update(cleanedFields)
          .eq('id', id)
        if (error) throw error
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...cleanedFields } : p))
        })
      } catch (err) {
        console.error('Gagal update produk ke Supabase:', err)
      }
    } else {
      const updated = get().products.map((p) => (p.id === id ? { ...p, ...cleanedFields } : p))
      getLocalDb.saveProducts(updated)
      set({ products: updated })
    }
  },

  deleteProduct: async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        if (error) throw error
        set({ products: get().products.filter((p) => p.id !== id) })
      } catch (err) {
        console.error('Gagal hapus produk dari Supabase:', err)
      }
    } else {
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*, sale_items(*)')
          .order('timestamp', { ascending: false })
        if (error) throw error
        
        // Map table format to match state
        const mappedSales = (data || []).map((sale) => ({
          id: sale.id,
          timestamp: sale.timestamp,
          items: (sale.sale_items || []).map((item) => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal
          })),
          subtotal: Number(sale.subtotal),
          discountPercent: Number(sale.discount_percent),
          discountAmount: Number(sale.discount_amount),
          taxAmount: Number(sale.tax_amount),
          total: Number(sale.total),
          profit: Number(sale.profit),
          paymentMethod: sale.payment_method,
          cashReceived: Number(sale.cash_received),
          change: Number(sale.change),
          cashier: sale.cashier
        }))
        set({ salesHistory: mappedSales })
      } catch (err) {
        console.error('Gagal mengambil laporan penjualan dari Supabase:', err)
        set({ salesHistory: getLocalDb.getSales() })
      } finally {
        set({ isLoadingSales: false })
      }
    } else {
      set({ salesHistory: getLocalDb.getSales(), isLoadingSales: false })
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

    // Prepare transaction payload
    const trxId = `TRX-${Date.now().toString().slice(-6)}`
    const timestamp = new Date().toISOString()

    const newSaleState = {
      id: trxId,
      timestamp,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      })),
      subtotal,
      discountPercent: discount,
      discountAmount,
      taxAmount,
      total,
      profit,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? cashAmount : total,
      change,
      cashier: get().user?.username || 'Cashier'
    }

    // Deduct stock locally
    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((item) => item.product.id === p.id)
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) }
      }
      return p
    })

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insert header
        const { error: saleErr } = await supabase.from('sales').insert([{
          id: trxId,
          cashier: newSaleState.cashier,
          subtotal,
          discount_percent: discount,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total,
          profit,
          payment_method: paymentMethod,
          cash_received: newSaleState.cashReceived,
          change,
          timestamp
        }])
        if (saleErr) throw saleErr

        // 2. Insert items
        const saleItemsPayload = cart.map((item) => ({
          sale_id: trxId,
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        }))
        const { error: itemsErr } = await supabase.from('sale_items').insert(saleItemsPayload)
        if (itemsErr) throw itemsErr

        // 3. Update stock of products in DB
        for (const item of cart) {
          const newStock = Math.max(0, item.product.stock - item.quantity)
          await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id)
        }

        set({
          products: updatedProducts,
          salesHistory: [newSaleState, ...get().salesHistory],
          cart: [],
          discount: 0
        })
      } catch (err) {
        console.error('Gagal checkout ke Supabase:', err)
        alert('Gagal mengirim transaksi ke Supabase!')
      }
    } else {
      // Local Database Fallback
      getLocalDb.saveProducts(updatedProducts)
      getLocalDb.saveSale(newSaleState)
      set({
        products: updatedProducts,
        salesHistory: [newSaleState, ...get().salesHistory],
        cart: [],
        discount: 0
      })
    }

    return newSaleState
  }
}))
