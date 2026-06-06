import { useEffect, useState } from 'react'
import { usePosStore } from '../store/posStore'
import { Monitor, CheckCircle2, Clock, Users, Coffee } from 'lucide-react'
import clsx from 'clsx'

// Assuming a fixed restaurant layout with 15 tables for demonstration
const TOTAL_TABLES = 15;

export default function TableMapView({ setActiveTab }) {
  const { tableOrders, fetchTableOrders } = usePosStore()

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
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
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

      <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl min-h-[500px]">
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
    </div>
  )
}
