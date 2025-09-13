import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import { EstadoChip } from '@/components/common/EstadoChip'
import type { Vivienda } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface ViviendaTableProps {
  viviendas: Vivienda[]
  loading: boolean
  onViewDetail: (vivienda: Vivienda) => void
  onChangeEstado: (vivienda: Vivienda) => void
}

export function ViviendaTable({ 
  viviendas, 
  loading, 
  onViewDetail, 
  onChangeEstado 
}: ViviendaTableProps) {
  const { profile } = useAuth()

  const canEdit = profile?.role && ['admin', 'gestor', 'promotor'].includes(profile.role)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (viviendas.length === 0) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-12 text-center">
          <p className="text-gray-500">No se encontraron viviendas con los filtros seleccionados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Portal</TableHead>
            <TableHead>Planta</TableHead>
            <TableHead>Letra</TableHead>
            <TableHead>Tipología</TableHead>
            <TableHead>Dormitorios</TableHead>
            <TableHead>PVP Final</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Gestor</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {viviendas.map((vivienda) => (
            <TableRow key={vivienda.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {vivienda.codigo_unique}
              </TableCell>
              <TableCell>{vivienda.portal}</TableCell>
              <TableCell>{vivienda.planta}</TableCell>
              <TableCell>{vivienda.letra}</TableCell>
              <TableCell>{vivienda.tipologia}</TableCell>
              <TableCell>{vivienda.dormitorios}</TableCell>
              <TableCell className="font-medium">
                {vivienda.pvp_final ? formatCurrency(vivienda.pvp_final) : '—'}
              </TableCell>
              <TableCell>
                <EstadoChip estado={vivienda.estado} />
              </TableCell>
              <TableCell>
                {vivienda.gestor ? (
                  <Badge variant="outline" className="text-xs">
                    {vivienda.gestor.nombre}
                  </Badge>
                ) : '—'}
              </TableCell>
              <TableCell>
                {vivienda.responsable ? (
                  <Badge variant="outline" className="text-xs">
                    {vivienda.responsable.nombre}
                  </Badge>
                ) : '—'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetail(vivienda)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalle
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onChangeEstado(vivienda)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Cambiar estado
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}