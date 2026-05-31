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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">RestoPOS</h2>
          <p className="text-slate-400 text-sm">Masuk ke Point of Sale & Inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / cashier"
                  className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-500">
            Gunakan user <code className="text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded">admin</code> (password: admin) untuk kelola menu & laporan.
          </p>
        </div>
      </div>
    </div>
  )
}
