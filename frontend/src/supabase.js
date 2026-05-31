import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Initialize supabase if configured, otherwise we'll fall back to our local store
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Mock local database helper for local development offline
const MOCK_STORAGE_KEYS = {
  PRODUCTS: 'pos_mock_products',
  SALES: 'pos_mock_sales',
  USERS: 'pos_mock_users'
}

const defaultProducts = [
  { id: '1', name: 'Espresso Single', sku: 'ESP-01', price: 20000, cost: 8000, stock: 50, category: 'Coffee', image: 'https://images.unsplash.com/photo-1510972527409-cef6e4a4d64e?w=300&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Iced Caffè Latte', sku: 'LAT-02', price: 28000, cost: 12000, stock: 40, category: 'Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Croissant Butter', sku: 'BAK-01', price: 25000, cost: 10000, stock: 15, category: 'Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=60' },
  { id: '4', name: 'Matcha Latte', sku: 'MAT-03', price: 30000, cost: 14000, stock: 30, category: 'Non-Coffee', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=60' },
  { id: '5', name: 'Red Velvet Cake Slice', sku: 'BAK-02', price: 35000, cost: 15000, stock: 8, category: 'Bakery', image: 'https://images.unsplash.com/photo-1616031037011-08bc3e863dbe?w=300&auto=format&fit=crop&q=60' },
  { id: '6', name: 'Mineral Water 500ml', sku: 'DRK-01', price: 6000, cost: 2000, stock: 100, category: 'Beverage', image: 'https://images.unsplash.com/photo-1608885898957-a599fb16ec88?w=300&auto=format&fit=crop&q=60' }
]

export const getLocalDb = {
  getProducts: () => {
    const data = localStorage.getItem(MOCK_STORAGE_KEYS.PRODUCTS)
    if (!data) {
      localStorage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts))
      return defaultProducts
    }
    return JSON.parse(data)
  },
  saveProducts: (products) => {
    localStorage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  },
  getSales: () => {
    const data = localStorage.getItem(MOCK_STORAGE_KEYS.SALES)
    return data ? JSON.parse(data) : []
  },
  saveSale: (sale) => {
    const sales = getLocalDb.getSales()
    sales.unshift(sale) // Newer sales first
    localStorage.setItem(MOCK_STORAGE_KEYS.SALES, JSON.stringify(sales))
  }
}
