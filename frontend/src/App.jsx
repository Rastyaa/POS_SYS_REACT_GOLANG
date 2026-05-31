import { useState, useEffect } from 'react'
import { usePosStore } from './store/posStore'
import Login from './components/Login'
import DashboardView from './components/DashboardView'
import OrderView from './components/OrderView'
import MenuManagement from './components/MenuManagement'
import SalesReport from './components/SalesReport'
import { LayoutDashboard, ShoppingCart, Coffee, Database, FileBarChart2, LogOut, User } from 'lucide-react'

function App() {
  const { user, logout, fetchProducts, fetchSalesHistory } = usePosStore()
  const [activeTab, setActiveTab] = useState('order')

  // Fetch initial data when user is authenticated and set default landing page based on role
  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchSalesHistory()
      if (user.role === 'Administrator') {
        setActiveTab('dashboard')
      } else {
        setActiveTab('order')
      }
    }
  }, [user, fetchProducts, fetchSalesHistory])

  if (!user) {
    return <Login />
  }

  // Render correct view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'order':
        return <OrderView />
      case 'menu':
        return user.role === 'Administrator' ? <MenuManagement /> : <div className="text-center py-20 text-slate-500">Hanya Administrator yang memiliki akses ke Menu Management.</div>
      case 'reports':
        return user.role === 'Administrator' ? <SalesReport /> : <div className="text-center py-20 text-slate-500">Hanya Administrator yang memiliki akses ke Sales Report.</div>
      default:
        return <OrderView />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden text-slate-900">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-slate-200/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-slate-200/50 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">RestoPOS</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">System Kasir Modern</p>
          </div>
        </div>

        {/* User Badge / Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user.username}</p>
              <p className="text-[9px] text-slate-500 font-bold">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar"
            className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-red-600 rounded-xl shadow-sm transition-all hover:border-red-200 hover:bg-red-50/50"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Shell Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 z-10">
        
        {/* Navigation Sidebar (Only shown for Administrator) */}
        {user.role === 'Administrator' && (
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-[200px] md:shrink-0 self-start">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'order'
                  ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir (Order)</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'menu'
                  ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Menu / Stok</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <FileBarChart2 className="w-4 h-4" />
              <span>Laporan</span>
            </button>
          </nav>
        )}

        {/* View Contents Pane (Takes full width for Cashier since sidebar is hidden) */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200/80 p-4 md:p-6 rounded-3xl shadow-sm">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App;
