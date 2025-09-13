import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, CheckCircle, Lock, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase, type Vivienda } from '@/lib/supabase'

interface KPIData {
  total: number
  libres: number
  bloqueadas: number
  reservadas: number
}

export function KPICards() {
  const [data, setData] = useState<KPIData>({
    total: 0,
    libres: 0,
    bloqueadas: 0,
    reservadas: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIs()
  }, [])

  const loadKPIs = async () => {
    try {
      const { data: viviendas, error } = await supabase
        .from('viviendas')
        .select('estado')

      if (error) throw error

      const kpis = viviendas.reduce((acc, v) => {
        acc.total++
        switch (v.estado) {
          case 'LIBRE': acc.libres++; break
          case 'BLOQUEADA': acc.bloqueadas++; break
          case 'RESERVADA': acc.reservadas++; break
        }
        return acc
      }, { total: 0, libres: 0, bloqueadas: 0, reservadas: 0 })

      setData(kpis)
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Total Viviendas',
      value: data.total,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Libres',
      value: data.libres,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Bloqueadas',
      value: data.bloqueadas,
      icon: Lock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Reservadas',
      value: data.reservadas,
      icon: UserCheck,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}