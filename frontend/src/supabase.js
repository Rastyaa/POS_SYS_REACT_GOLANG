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
  { id: '1', name: 'Espresso Double Shot', sku: 'DRK-CF-01', price: 25000, cost: 6000, stock: 200, category: 'Kopi', description: 'Espresso pekat double shot dari biji kopi pilihan.', image: 'https://images.unsplash.com/photo-1522992319-0365e5f11656?w=300&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Cafe Latte Hot Creamy', sku: 'DRK-CF-04', price: 32000, cost: 9000, stock: 85, category: 'Kopi', description: 'Latte panas dengan susu creamy dan sedikit foam.', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Nasi Goreng Wagyu Rendang', sku: 'FOOD-ID-02', price: 75000, cost: 30000, stock: 40, category: 'Makanan Utama', description: 'Nasi goreng gurih dipadukan potongan wagyu dan bumbu rendang otentik.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&auto=format&fit=crop&q=60' },
  { id: '4', name: 'Matcha Green Tea Latte Iced', sku: 'DRK-NC-10', price: 28000, cost: 10000, stock: 60, category: 'Minuman', description: 'Matcha premium dicampur susu dingin creamy.', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=60' },
  { id: '5', name: 'Red Velvet Premium Cake Slice', sku: 'DSR-05', price: 45000, cost: 15000, stock: 15, category: 'Dessert', description: 'Kue red velvet lembut dengan frosting cream cheese.', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=300&auto=format&fit=crop&q=60' },
  { id: '6', name: 'Premium Mineral Water 750ml', sku: 'DRK-NC-18', price: 12000, cost: 3000, stock: 120, category: 'Minuman', description: 'Air mineral premium kemasan botol 750ml.', image: 'https://images.unsplash.com/photo-1596803244618-8dbee441d70b?w=300&auto=format&fit=crop&q=60' },
  { id: '7', name: 'French Fries Truffle Parmesan', sku: 'SNK-01', price: 38000, cost: 14000, stock: 60, category: 'Cemilan', description: 'Kentang goreng renyah ditaburi truffle oil dan parmesan.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=60' }
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
