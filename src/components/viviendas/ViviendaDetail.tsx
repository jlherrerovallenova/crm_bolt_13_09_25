import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EstadoChip } from '@/components/common/EstadoChip'
import type { Vivienda } from '@/lib/supabase'

interface ViviendaDetailProps {
  vivienda: Vivienda | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViviendaDetail({ vivienda, open, onOpenChange }: ViviendaDetailProps) {
  if (!vivienda) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{vivienda.codigo_unique}</SheetTitle>
          <SheetDescription>
            Información detallada de la vivienda
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Estado Actual</h4>
              <EstadoChip estado={vivienda.estado} />
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Ubicación</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Portal:</span>
                  <p className="font-medium">{vivienda.portal || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Planta:</span>
                  <p className="font-medium">{vivienda.planta || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Letra:</span>
                  <p className="font-medium">{vivienda.letra || '—'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Características</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipología:</span>
                  <span className="font-medium">{vivienda.tipologia || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Orientación:</span>
                  <span className="font-medium">{vivienda.orientacion || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dormitorios:</span>
                  <span className="font-medium">{vivienda.dormitorios || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sup. Útil + Terraza:</span>
                  <span className="font-medium">
                    {vivienda.sup_util_terraza ? `${vivienda.sup_util_terraza} m²` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sup. Útil Vivienda:</span>
                  <span className="font-medium">
                    {vivienda.sup_util_vivienda ? `${vivienda.sup_util_vivienda} m²` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sup. Útil Terrazas:</span>
                  <span className="font-medium">
                    {vivienda.sup_util_terrazas ? `${vivienda.sup_util_terrazas} m²` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Precio</h4>
              <div className="text-2xl font-bold text-green-600">
                {vivienda.pvp_final ? formatCurrency(vivienda.pvp_final) : '—'}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Responsables</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Gestor:</span>
                  {vivienda.gestor ? (
                    <Badge variant="outline">{vivienda.gestor.nombre}</Badge>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Responsable:</span>
                  {vivienda.responsable ? (
                    <Badge variant="outline">{vivienda.responsable.nombre}</Badge>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
            </div>

            {vivienda.observaciones && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Observaciones</h4>
                  <p className="text-sm text-gray-600">{vivienda.observaciones}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="text-xs text-gray-400">
              <p>Creado: {formatDate(vivienda.created_at)}</p>
              <p>Actualizado: {formatDate(vivienda.updated_at)}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}