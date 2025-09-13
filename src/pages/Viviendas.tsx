import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ViviendaFilters, type ViviendaFilters as ViviendaFiltersType } from '@/components/viviendas/ViviendaFilters'
import { ViviendaTable } from '@/components/viviendas/ViviendaTable'
import { ViviendaDetail } from '@/components/viviendas/ViviendaDetail'
import { CambiarEstadoModal } from '@/components/viviendas/CambiarEstadoModal'
import { supabase, type Vivienda } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

const DEFAULT_FILTERS: ViviendaFiltersType = {
  search: '',
  portal: '',
  estados: [],
  tipologia: '',
  responsable: '',
  gestor: ''
}

export function Viviendas() {
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ViviendaFiltersType>(DEFAULT_FILTERS)
  const [selectedVivienda, setSelectedVivienda] = useState<Vivienda | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [changeEstadoOpen, setChangeEstadoOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadViviendas()
  }, [])

  const loadViviendas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          *,
          gestor:personas!viviendas_gestor_id_fkey(*),
          responsable:personas!viviendas_responsable_id_fkey(*)
        `)
        .order('codigo_unique')

      if (error) throw error
      setViviendas(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las viviendas",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredViviendas = useMemo(() => {
    return viviendas.filter(vivienda => {
      // Búsqueda por texto
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const searchFields = [
          vivienda.codigo_unique,
          vivienda.portal,
          vivienda.planta,
          vivienda.letra,
          vivienda.tipologia
        ].join(' ').toLowerCase()
        
        if (!searchFields.includes(search)) return false
      }

      // Filtro por portal
      if (filters.portal && vivienda.portal !== filters.portal) return false

      // Filtro por estados
      if (filters.estados.length > 0 && !filters.estados.includes(vivienda.estado)) return false

      // Filtro por tipología
      if (filters.tipologia && vivienda.tipologia !== filters.tipologia) return false

      // Filtro por gestor
      if (filters.gestor && vivienda.gestor_id !== filters.gestor) return false

      // Filtro por responsable
      if (filters.responsable && vivienda.responsable_id !== filters.responsable) return false

      return true
    })
  }, [viviendas, filters])

  const handleExport = () => {
    const dataToExport = filteredViviendas.map(v => ({
      'Código': v.codigo_unique,
      'Portal': v.portal,
      'Planta': v.planta,
      'Letra': v.letra,
      'Tipología': v.tipologia,
      'Orientación': v.orientacion,
      'Dormitorios': v.dormitorios,
      'Superficie Útil + Terraza': v.sup_util_terraza,
      'Superficie Útil Vivienda': v.sup_util_vivienda,
      'Superficie Útil Terrazas': v.sup_util_terrazas,
      'PVP Final': v.pvp_final,
      'Estado': v.estado,
      'Gestor': v.gestor?.nombre || '',
      'Responsable': v.responsable?.nombre || '',
      'Observaciones': v.observaciones || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    XLSX.utils.book_append_sheet(wb, ws, 'Viviendas')
    XLSX.writeFile(wb, `viviendas_${new Date().toISOString().split('T')[0]}.xlsx`)

    toast({
      title: "Exportación completada",
      description: `Se han exportado ${dataToExport.length} viviendas`,
    })
  }

  const handleViewDetail = (vivienda: Vivienda) => {
    setSelectedVivienda(vivienda)
    setDetailOpen(true)
  }

  const handleChangeEstado = (vivienda: Vivienda) => {
    setSelectedVivienda(vivienda)
    setChangeEstadoOpen(true)
  }

  const handleEstadoChanged = () => {
    loadViviendas()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Viviendas</h2>
            <p className="text-gray-600">
              {filteredViviendas.length} de {viviendas.length} viviendas
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </Button>
        </div>

        <ViviendaFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        <ViviendaTable
          viviendas={filteredViviendas}
          loading={loading}
          onViewDetail={handleViewDetail}
          onChangeEstado={handleChangeEstado}
        />
      </div>

      <ViviendaDetail
        vivienda={selectedVivienda}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <CambiarEstadoModal
        vivienda={selectedVivienda}
        open={changeEstadoOpen}
        onOpenChange={setChangeEstadoOpen}
        onSuccess={handleEstadoChanged}
      />
    </div>
  )
}