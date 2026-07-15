import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { usePosStore } from './store/posStore'
import Login from './components/Login'
import DashboardView from './components/DashboardView'
import OrderView from './components/OrderView'
import MenuManagement from './components/MenuManagement'
import SalesReport from './components/SalesReport'
import IncomingOrdersView from './components/IncomingOrdersView'
import CustomerOrderView from './components/CustomerOrderView'
import TableMapView from './components/TableMapView'
import { LayoutDashboard, ShoppingCart, Coffee, Database, FileBarChart2, LogOut, User, Sun, Moon, BellRing, Map } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

function POSApp() {
  const { user, logout, fetchProducts, fetchSalesHistory, theme, toggleTheme, tableOrders, fetchTableOrders } = usePosStore()
  const [activeTab, setActiveTab] = useState('order')

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchSalesHistory()
      fetchTableOrders()
      if (user.role === 'Administrator') {
        setActiveTab('dashboard')
      } else {
        setActiveTab('tableMap')
      }
    }
  }, [user, fetchProducts, fetchSalesHistory, fetchTableOrders])

  if (!user) {
    return <Login />
  }

  const pendingCount = tableOrders.filter(o => o.status === 'Pending').length

  // Render correct view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'order':
        return <OrderView />
      case 'tableMap':
        return <TableMapView setActiveTab={setActiveTab} />
      case 'tableOrders':
        return <IncomingOrdersView setActiveTab={setActiveTab} />
      case 'menu':
        return user.role === 'Administrator' ? <MenuManagement /> : <div className="text-center py-20 text-slate-500">Akses ditolak.</div>
      case 'reports':
        return user.role === 'Administrator' ? <SalesReport /> : <div className="text-center py-20 text-slate-500">Akses ditolak.</div>
      default:
        return <OrderView />
    }
  }

  const navItemClass = (tab) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
      activeTab === tab
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`

  const navGroupLabelClass = 'px-3.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 first:pt-0'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Coffee className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">RestoPOS</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">System Kasir Modern</p>
          </div>
        </div>

        {/* User Badge / Profile & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.username}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar"
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors hover:border-red-200 dark:hover:border-red-900/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Shell Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">

        {/* Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-[200px] md:shrink-0 self-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 md:p-2.5 custom-scrollbar">
          {user.role === 'Administrator' && (
            <>
              <span className={`${navGroupLabelClass} hidden md:block`}>Ringkasan</span>
              <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </>
          )}

          <span className={`${navGroupLabelClass} hidden md:block`}>Operasional</span>

          <button onClick={() => setActiveTab('tableMap')} className={navItemClass('tableMap')}>
            <Map className="w-4 h-4" />
            <span>Posisi Meja</span>
          </button>

          <button onClick={() => setActiveTab('tableOrders')} className={`${navItemClass('tableOrders')} justify-between`}>
            <div className="flex items-center gap-3">
              <BellRing className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-500 animate-pulse' : ''}`} />
              <span>Pesanan Meja</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{pendingCount}</span>
            )}
          </button>

          <button onClick={() => setActiveTab('order')} className={navItemClass('order')}>
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir</span>
          </button>

          {user.role === 'Administrator' && (
            <>
              <span className={`${navGroupLabelClass} hidden md:block`}>Admin</span>
              <button onClick={() => setActiveTab('menu')} className={navItemClass('menu')}>
                <Database className="w-4 h-4" />
                <span>Menu / Stok</span>
              </button>

              <button onClick={() => setActiveTab('reports')} className={navItemClass('reports')}>
                <FileBarChart2 className="w-4 h-4" />
                <span>Laporan</span>
              </button>
            </>
          )}
        </nav>

        {/* View Contents Pane */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-xl shadow-sm transition-colors duration-300">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/table/:tableNumber" element={<CustomerOrderView />} />
        <Route path="/*" element={<POSApp />} />
      </Routes>
    </Router>
  )
}
