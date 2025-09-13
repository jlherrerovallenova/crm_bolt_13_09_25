import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { supabase, type CambioEstado } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Clock } from 'lucide-react'
import { EstadoChip } from '@/components/common/EstadoChip'

export function RecentChanges() {
  const [changes, setChanges] = useState<CambioEstado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChanges()
  }, [])

  const loadChanges = async () => {
    try {
      const { data, error } = await supabase
        .from('cambios_estado')
        .select(`
          *,
          vivienda:viviendas(codigo_unique),
          gestor:personas!cambios_estado_gestor_id_fkey(nombre),
          actor:profiles!cambios_estado_actor_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setChanges(data || [])
    } catch (error) {
      console.error('Error loading recent changes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Últimos Cambios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Últimos Cambios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No hay cambios recientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Últimos Cambios</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change) => (
            <div key={change.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">
                  {change.vivienda?.codigo_unique}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(change.created_at)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                {change.de_estado && <EstadoChip estado={change.de_estado} size="sm" />}
                {change.de_estado && <ArrowRight className="h-3 w-3 text-gray-400" />}
                <EstadoChip estado={change.a_estado} size="sm" />
              </div>

              {change.motivo && (
                <p className="text-xs text-gray-600 mb-1">{change.motivo}</p>
              )}
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {change.gestor && (
                  <span>Gestor: {change.gestor.nombre}</span>
                )}
                {change.actor && (
                  <span>• Por: {change.actor.full_name || change.actor.email}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}