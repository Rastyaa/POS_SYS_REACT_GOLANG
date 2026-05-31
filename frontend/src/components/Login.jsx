import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Coffee, User, Lock, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function Login() {
  const login = usePosStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const success = await login(username, password)
      if (success) {
        toast.success('Login berhasil! Selamat datang.')
      } else {
        throw new Error('Username atau Password salah!')
      }
    } catch (err) {
      toast.error(err.message || 'Username atau Password salah!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300">
      <Toaster position="top-right" />
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-2 shadow-lg group hover:scale-105 transition-all duration-300">
            <Coffee className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">RestoPOS</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Masuk ke Point of Sale & Inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / cashier"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3.5 pl-10 pr-4 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-800 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3.5 pl-10 pr-4 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-800 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sedang Memproses...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-150 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Gunakan user <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">admin</code> atau <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">cashier</code> untuk login.
          </p>
        </div>
      </div>
    </div>
  )
}
