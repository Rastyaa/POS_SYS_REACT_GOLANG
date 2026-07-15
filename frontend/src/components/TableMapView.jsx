import { useEffect, useRef, useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Coffee, QrCode, X, Download } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import clsx from 'clsx'

// Assuming a fixed restaurant layout with 15 tables for demonstration
const TOTAL_TABLES = 15;

function TableQrModal({ tableNumber, onClose }) {
  const canvasRef = useRef(null)
  const orderUrl = `${window.location.origin}/table/${tableNumber}`

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-meja-${tableNumber}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 dark:bg-slate-950/70 animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">QR Meja {tableNumber}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-6">
          <div ref={canvasRef} className="p-4 bg-white rounded-xl border border-slate-200">
            <QRCodeCanvas value={orderUrl} size={220} level="M" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center break-all font-medium">{orderUrl}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Pindai kode ini untuk memesan langsung dari Meja {tableNumber}.</p>

          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Unduh PNG
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TableMapView({ setActiveTab }) {
  const { tableOrders, fetchTableOrders } = usePosStore()
  const [qrTable, setQrTable] = useState(null)

  useEffect(() => {
    fetchTableOrders()
    const interval = setInterval(fetchTableOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchTableOrders])

  // Process active orders to map to tables
  const activeOrders = tableOrders.filter(o => o.status === 'Pending' || o.status === 'Served')
  
  const getTableStatus = (tableNum) => {
    const order = activeOrders.find(o => o.table_number === tableNum.toString())
    if (order) {
      return { isOccupied: true, order }
    }
    return { isOccupied: false, order: null }
  }

  const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1).map(num => ({
    number: num,
    ...getTableStatus(num)
  }))

  const occupiedCount = tables.filter(t => t.isOccupied).length
  const emptyCount = TOTAL_TABLES - occupiedCount

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Posisi Meja
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
          Pantau ketersediaan meja secara real-time.
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          Kosong ({emptyCount})
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 dark:border-amber-800">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          Terisi ({occupiedCount})
        </div>
      </div>

      <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-xl min-h-[500px]">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {tables.map(table => (
            <div 
              key={table.number}
              onClick={() => {
                if(table.isOccupied) setActiveTab('tableOrders');
              }}
              className={clsx(
                "relative group flex flex-col items-center justify-center aspect-square rounded-2xl p-4 transition-all duration-300 border-2 shadow-sm",
                table.isOccupied 
                  ? "bg-white dark:bg-slate-800 border-amber-400 dark:border-amber-600 cursor-pointer hover:shadow-md hover:scale-105" 
                  : "bg-white dark:bg-slate-800 border-emerald-400 dark:border-emerald-600 cursor-default"
              )}
            >
              <div className="absolute top-2 right-2">
                {table.isOccupied ? (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setQrTable(table.number) }}
                title={`Lihat QR Meja ${table.number}`}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>

              <Coffee className={clsx("w-8 h-8 mb-2 transition-colors", table.isOccupied ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400")} />
              
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                {table.number}
              </span>
              
              {table.isOccupied && (
                <div className="mt-2 text-center w-full">
                  <p className="text-[10px] font-bold text-slate-500 truncate w-full px-1">
                    {table.order.customer_name || 'Pelanggan'}
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {table.order.status === 'Pending' ? 'Menunggu' : 'Sedang Makan'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {qrTable && <TableQrModal tableNumber={qrTable} onClose={() => setQrTable(null)} />}
    </div>
  )
}
