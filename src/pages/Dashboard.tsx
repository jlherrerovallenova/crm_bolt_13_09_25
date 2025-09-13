import { KPICards } from '@/components/dashboard/KPICards'
import { EstadosChart } from '@/components/dashboard/EstadosChart'
import { RecentChanges } from '@/components/dashboard/RecentChanges'

export function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Resumen del estado actual de las viviendas</p>
        </div>

        <KPICards />

        <div className="grid gap-6 md:grid-cols-2">
          <EstadosChart />
          <RecentChanges />
        </div>
      </div>
    </div>
  )
}