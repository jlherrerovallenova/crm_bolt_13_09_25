import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ChartData {
  name: string
  value: number
  color: string
}

export function EstadosChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: viviendas, error } = await supabase
        .from('viviendas')
        .select('estado')

      if (error) throw error

      const counts = viviendas.reduce((acc, v) => {
        acc[v.estado] = (acc[v.estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const chartData = [
        { name: 'Libres', value: counts['LIBRE'] || 0, color: '#10b981' },
        { name: 'Bloqueadas', value: counts['BLOQUEADA'] || 0, color: '#f59e0b' },
        { name: 'Reservadas', value: counts['RESERVADA'] || 0, color: '#ef4444' }
      ]

      setData(chartData)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}