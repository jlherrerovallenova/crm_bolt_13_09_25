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
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase, type Persona } from '@/lib/supabase'
import { ESTADOS_VALIDOS } from '@/lib/utils'

export interface ViviendaFilters {
  search: string
  portal: string
  estados: string[]
  tipologia: string
  responsable: string
  gestor: string
}

interface ViviendaFiltersProps {
  filters: ViviendaFilters
  onChange: (filters: ViviendaFilters) => void
  onReset: () => void
}

export function ViviendaFilters({ filters, onChange, onReset }: ViviendaFiltersProps) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [portales, setPortales] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      // Cargar personas
      const { data: personasData } = await supabase
        .from('personas')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      setPersonas(personasData || [])

      // Cargar opciones únicas de viviendas
      const { data: viviendasData } = await supabase
        .from('viviendas')
        .select('portal, tipologia')

      if (viviendasData) {
        const portalesUnicos = [...new Set(viviendasData.map(v => v.portal).filter(Boolean))].sort()
        const tipologiasUnicas = [...new Set(viviendasData.map(v => v.tipologia).filter(Boolean))].sort()
        
        setPortales(portalesUnicos)
        setTipologias(tipologiasUnicas)
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const updateFilters = (key: keyof ViviendaFilters, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleEstado = (estado: string) => {
    const newEstados = filters.estados.includes(estado)
      ? filters.estados.filter(e => e !== estado)
      : [...filters.estados, estado]
    updateFilters('estados', newEstados)
  }

  const removeEstado = (estado: string) => {
    updateFilters('estados', filters.estados.filter(e => e !== estado))
  }

  const hasActiveFilters = filters.search || filters.portal || filters.estados.length > 0 || 
                          filters.tipologia || filters.responsable || filters.gestor

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros</span>
        </h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-2">
          <Label htmlFor="search">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Código, portal..."
              value={filters.search}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Portal</Label>
          <Select value={filters.portal} onValueChange={(value) => updateFilters('portal', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {portales.map(portal => (
                <SelectItem key={portal} value={portal}>{portal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipología</Label>
          <Select value={filters.tipologia} onValueChange={(value) => updateFilters('tipologia', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {tipologias.map(tipologia => (
                <SelectItem key={tipologia} value={tipologia}>{tipologia}</SelectItem>
              ))}
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
      </div>

      {/* Estados como chips clickeables */}
      <div className="space-y-2">
        <Label>Estados</Label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_VALIDOS.map(estado => {
            const isActive = filters.estados.includes(estado)
            return (
              <Badge
                key={estado}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleEstado(estado)}
              >
                {estado}
              </Badge>
            )
          })}
        </div>
        
        {filters.estados.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.estados.map(estado => (
              <Badge key={estado} variant="secondary" className="text-xs">
                {estado}
                <button
                  onClick={() => removeEstado(estado)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}