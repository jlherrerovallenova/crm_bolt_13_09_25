import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Filter, ArrowRight, Calendar } from 'lucide-react'
import { EstadoChip } from '@/components/common/EstadoChip'
import { supabase, type CambioEstado, type Persona } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

interface HistorialFilters {
  search: string
  deEstado: string
  aEstado: string
  gestor: string
  responsable: string
  actor: string
  fechaDesde: string
  fechaHasta: string
}

const DEFAULT_FILTERS: HistorialFilters = {
  search: '',
  deEstado: '',
  aEstado: '',
  gestor: '',
  responsable: '',
  actor: '',
  fechaDesde: '',
  fechaHasta: ''
}

export function Historial() {
  const [cambios, setCambios] = useState<CambioEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<HistorialFilters>(DEFAULT_FILTERS)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar cambios
      const { data: cambiosData, error: cambiosError } = await supabase
        .from('cambios_estado')
        .select(`
          *,
          vivienda:viviendas(codigo_unique),
          gestor:personas!cambios_estado_gestor_id_fkey(id, nombre),
          responsable:personas!cambios_estado_responsable_id_fkey(id, nombre),
          actor:profiles!cambios_estado_actor_user_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (cambiosError) throw cambiosError

      // Cargar personas para filtros
      const { data: personasData } = await supabase
        .from('personas')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      // Cargar profiles para filtros
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name')

      setCambios(cambiosData || [])
      setPersonas(personasData || [])
      setProfiles(profilesData || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar el historial",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCambios = useMemo(() => {
    return cambios.filter(cambio => {
      // Búsqueda por código de vivienda o motivo
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const searchText = [
          cambio.vivienda?.codigo_unique,
          cambio.motivo
        ].join(' ').toLowerCase()
        
        if (!searchText.includes(search)) return false
      }

      // Filtro por estado origen
      if (filters.deEstado && cambio.de_estado !== filters.deEstado) return false

      // Filtro por estado destino
      if (filters.aEstado && cambio.a_estado !== filters.aEstado) return false

      // Filtro por gestor
      if (filters.gestor && cambio.gestor_id !== filters.gestor) return false

      // Filtro por responsable
      if (filters.responsable && cambio.responsable_id !== filters.responsable) return false

      // Filtro por actor
      if (filters.actor && cambio.actor_user_id !== filters.actor) return false

      // Filtro por rango de fechas
      if (filters.fechaDesde) {
        const fechaCambio = new Date(cambio.created_at)
        const fechaDesde = new Date(filters.fechaDesde)
        if (fechaCambio < fechaDesde) return false
      }

      if (filters.fechaHasta) {
        const fechaCambio = new Date(cambio.created_at)
        const fechaHasta = new Date(filters.fechaHasta)
        fechaHasta.setHours(23, 59, 59, 999) // Final del día
        if (fechaCambio > fechaHasta) return false
      }

      return true
    })
  }, [cambios, filters])

  const updateFilters = (key: keyof HistorialFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const handleExport = () => {
    const dataToExport = filteredCambios.map(c => ({
      'Fecha': formatDate(c.created_at),
      'Vivienda': c.vivienda?.codigo_unique || '',
      'De Estado': c.de_estado || '',
      'A Estado': c.a_estado,
      'Gestor': c.gestor?.nombre || '',
      'Responsable': c.responsable?.nombre || '',
      'Actor': c.actor?.full_name || c.actor?.email || '',
      'Motivo': c.motivo || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    XLSX.utils.book_append_sheet(wb, ws, 'Historial')
    XLSX.writeFile(wb, `historial_cambios_${new Date().toISOString().split('T')[0]}.xlsx`)

    toast({
      title: "Exportación completada",
      description: `Se han exportado ${dataToExport.length} registros`,
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historial de Cambios</h2>
            <p className="text-gray-600">
              {filteredCambios.length} de {cambios.length} cambios
            </p>
          </div>
          <Button onClick={handleExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </h3>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda</Label>
              <Input
                id="search"
                placeholder="Código vivienda, motivo..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado Origen</Label>
              <Select value={filters.deEstado} onValueChange={(value) => updateFilters('deEstado', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="LIBRE">LIBRE</SelectItem>
                  <SelectItem value="BLOQUEADA">BLOQUEADA</SelectItem>
                  <SelectItem value="RESERVADA">RESERVADA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado Destino</Label>
              <Select value={filters.aEstado} onValueChange={(value) => updateFilters('aEstado', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="LIBRE">LIBRE</SelectItem>
                  <SelectItem value="BLOQUEADA">BLOQUEADA</SelectItem>
                  <SelectItem value="RESERVADA">RESERVADA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gestor</Label>
              <Select value={filters.gestor} onValueChange={(value) => updateFilters('gestor', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {personas.filter(p => p.tipo === 'GESTOR').map(persona => (
                    <SelectItem key={persona.id} value={persona.id}>{persona.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select value={filters.responsable} onValueChange={(value) => updateFilters('responsable', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {personas.map(persona => (
                    <SelectItem key={persona.id} value={persona.id}>{persona.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Usuario Actor</Label>
              <Select value={filters.actor} onValueChange={(value) => updateFilters('actor', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-desde">Desde</Label>
              <Input
                id="fecha-desde"
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => updateFilters('fechaDesde', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-hasta">Hasta</Label>
              <Input
                id="fecha-hasta"
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => updateFilters('fechaHasta', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border">
          {filteredCambios.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No hay cambios que mostrar con los filtros seleccionados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vivienda</TableHead>
                  <TableHead>Cambio de Estado</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCambios.map((cambio) => (
                  <TableRow key={cambio.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {formatDate(cambio.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cambio.vivienda?.codigo_unique}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {cambio.de_estado ? (
                          <>
                            <EstadoChip estado={cambio.de_estado} size="sm" />
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400">—</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                          </>
                        )}
                        <EstadoChip estado={cambio.a_estado} size="sm" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {cambio.gestor ? (
                        <Badge variant="secondary" className="text-xs">
                          {cambio.gestor.nombre}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {cambio.responsable ? (
                        <Badge variant="secondary" className="text-xs">
                          {cambio.responsable.nombre}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {cambio.actor ? (
                        <Badge variant="outline" className="text-xs">
                          {cambio.actor.full_name || cambio.actor.email}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={cambio.motivo || ''}>
                        {cambio.motivo || '—'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}