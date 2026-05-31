import { useState, useEffect } from 'react'
import { usePosStore } from '../store/posStore'
import { X, CheckCircle, Receipt, Landmark, QrCode, Coins } from 'lucide-react'

export default function PaymentModal({ isOpen, onClose }) {
  const { cart, discount, taxRate, checkout } = usePosStore()
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [cashAmount, setCashAmount] = useState('')
  const [change, setChange] = useState(0)
  const [completedTransaction, setCompletedTransaction] = useState(null)

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const taxAmount = (subtotal - discountAmount) * taxRate
  const total = subtotal - discountAmount + taxAmount

  // Helpers
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Recalculate change on cash input change
  useEffect(() => {
    const cashVal = parseFloat(cashAmount) || 0
    if (cashVal >= total) {
      setChange(cashVal - total)
    } else {
      setChange(0)
    }
  }, [cashAmount, total])

  if (!isOpen) return null

  const handlePay = () => {
    if (paymentMethod === 'Cash' && (parseFloat(cashAmount) || 0) < total) {
      alert('Uang tunai kurang dari total tagihan!')
      return
    }
    const finalCash = paymentMethod === 'Cash' ? parseFloat(cashAmount) : total
    const transaction = checkout(paymentMethod, finalCash)
    if (transaction) {
      setCompletedTransaction(transaction)
    }
  }

  const handleReset = () => {
    setCompletedTransaction(null)
    setPaymentMethod('Cash')
    setCashAmount('')
    setChange(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm px-4">
      {!completedTransaction ? (
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-800">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Ringkasan Pembayaran</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bill Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800 font-semibold">{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Diskon ({discount}%)</span>
                <span>-{formatIDR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Pajak (10%)</span>
              <span className="text-slate-800 font-semibold">{formatIDR(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-950 font-bold text-lg border-t border-slate-200 pt-2">
              <span>Total Tagihan</span>
              <span className="text-slate-900 font-extrabold">{formatIDR(total)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Cash', icon: Coins },
                { name: 'Card', icon: Landmark },
                { name: 'QRIS', icon: QrCode }
              ].map((method) => {
                const IconComp = method.icon
                const isSelected = paymentMethod === method.name
                return (
                  <button
                    key={method.name}
                    type="button"
                    onClick={() => setPaymentMethod(method.name)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                    <span className="text-xs font-semibold">{method.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cash Input Detail */}
          {paymentMethod === 'Cash' && (
            <div className="space-y-4 pt-2 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Uang Diterima (Rp)</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-slate-800 focus:bg-white text-sm font-semibold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Kembalian</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900">
                    {formatIDR(change)}
                  </div>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex gap-2">
                {[total, 10000, 20000, 50000, 100000].map((quickVal) => {
                  const val = Math.ceil(quickVal)
                  if (val < total) return null
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashAmount(val.toString())}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                    >
                      {formatIDR(val)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={handlePay}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.99] transition-all text-sm"
          >
            Bayar & Cetak Struk
          </button>
        </div>
      ) : (
        /* Completed Transaction Receipt Screen */
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-800 text-center animate-scaleIn">
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">Transaksi Sukses!</h3>
            <p className="text-slate-500 text-xs font-semibold">ID Transaksi: {completedTransaction.id}</p>
          </div>

          {/* Receipt Preview */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left font-mono text-xs space-y-4 text-slate-700 border-dashed">
            <div className="text-center space-y-0.5 border-b border-slate-200 pb-3">
              <p className="font-bold text-sm text-slate-900">RestoPOS Cafe</p>
              <p className="text-[10px] text-slate-500">Kuningan, Jakarta Selatan</p>
              <p className="text-[9px] text-slate-500">{new Date(completedTransaction.timestamp).toLocaleString('id-ID')}</p>
            </div>

            <div className="space-y-1.5 border-b border-slate-200 pb-3">
              {completedTransaction.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatIDR(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(completedTransaction.subtotal)}</span>
              </div>
              {completedTransaction.discountPercent > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Diskon ({completedTransaction.discountPercent}%)</span>
                  <span>-{formatIDR(completedTransaction.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pajak (10%)</span>
                <span>{formatIDR(completedTransaction.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
                <span>Total Akhir</span>
                <span>{formatIDR(completedTransaction.total)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-1 text-slate-550">
              <div className="flex justify-between">
                <span>Metode</span>
                <span className="font-bold text-slate-900">{completedTransaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Diterima</span>
                <span>{formatIDR(completedTransaction.cashReceived)}</span>
              </div>
              {completedTransaction.paymentMethod === 'Cash' && (
                <div className="flex justify-between">
                  <span>Kembalian</span>
                  <span>{formatIDR(completedTransaction.change)}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-3 border-t border-slate-200">
              <p className="text-[10px] text-slate-500">Terima kasih atas kunjungan Anda!</p>
              <p className="text-[8px] text-slate-500">Kasir: {completedTransaction.cashier}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-[0.98]"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
