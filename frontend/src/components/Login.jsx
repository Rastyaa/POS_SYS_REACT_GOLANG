import { useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Coffee, Key, User, Lock } from 'lucide-react'

export default function Login() {
  const login = usePosStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const success = login(username, password)
    if (!success) {
      setError('Username atau Password salah! (Gunakan: admin/admin atau cashier/cashier)')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-900">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-2 shadow-md">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">RestoPOS</h2>
          <p className="text-slate-500 text-sm">Masuk ke Point of Sale & Inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Username</label>
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
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-800 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Password</label>
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
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-800 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-450">
            Gunakan user <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">admin</code> (password: admin) untuk kelola menu & laporan.
          </p>
        </div>
      </div>
    </div>
  )
}
