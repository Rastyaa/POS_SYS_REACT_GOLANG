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

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchSalesHistory()
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-bold text-white tracking-tight">RestoPOS</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">System Kasir Modern</p>
          </div>
        </div>

        {/* User Badge / Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-350 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user.username}</p>
              <p className="text-[9px] text-emerald-400 font-medium">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar"
            className="p-2 bg-slate-950/80 border border-slate-850 text-slate-400 hover:text-red-400 rounded-xl transition-all hover:border-red-500/20"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Shell Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 z-10">
        
        {/* Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-[220px] md:shrink-0 self-start">
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'order'
                ? 'bg-slate-900 border border-slate-850 text-emerald-450'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir</span>
          </button>

          {user.role === 'Administrator' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 border border-slate-850 text-emerald-455'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}

          {user.role === 'Administrator' && (
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'menu'
                  ? 'bg-slate-900 border border-slate-850 text-emerald-460'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Menu / Stok</span>
            </button>
          )}

          {user.role === 'Administrator' && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 border border-slate-850 text-emerald-465'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileBarChart2 className="w-4 h-4" />
              <span>Laporan</span>
            </button>
          )}
        </nav>

        {/* View Contents Pane */}
        <main className="flex-1 min-w-0 bg-slate-900/10 border border-slate-850/50 p-4 md:p-6 rounded-3xl backdrop-blur-sm">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App
