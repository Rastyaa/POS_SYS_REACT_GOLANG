import { useState, useEffect } from 'react'
import { usePosStore } from './store/posStore'
import Login from './components/Login'
import DashboardView from './components/DashboardView'
import OrderView from './components/OrderView'
import MenuManagement from './components/MenuManagement'
import SalesReport from './components/SalesReport'
import { LayoutDashboard, ShoppingCart, Coffee, Database, FileBarChart2, LogOut, User, Sun, Moon } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

function App() {
  const { user, logout, fetchProducts, fetchSalesHistory, theme, toggleTheme } = usePosStore()
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-right" />
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">RestoPOS</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">System Kasir Modern</p>
          </div>
        </div>

        {/* User Badge / Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
          </button>

          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{user.username}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar"
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl shadow-sm transition-all hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 cursor-pointer"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 dark:bg-white border border-slate-950 dark:border-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-slate-900 dark:bg-white border border-slate-950 dark:border-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir (Order)</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-slate-900 dark:bg-white border border-slate-950 dark:border-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Menu / Stok</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-slate-900 dark:bg-white border border-slate-950 dark:border-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <FileBarChart2 className="w-4 h-4" />
              <span>Laporan</span>
            </button>
          </nav>
        )}

        {/* View Contents Pane (Takes full width for Cashier since sidebar is hidden) */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 md:p-6 rounded-3xl shadow-sm transition-colors duration-300">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App;
