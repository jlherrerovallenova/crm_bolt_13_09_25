import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { EstadoChip } from '@/components/common/EstadoChip'
import { supabase, type Vivienda, type Persona, type Estado } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { TRANSICIONES_VALIDAS } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface CambiarEstadoModalProps {
  vivienda: Vivienda | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CambiarEstadoModal({
  vivienda,
  open,
  onOpenChange,
  onSuccess
}: CambiarEstadoModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState<Estado>('LIBRE')
  const [gestorId, setGestorId] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [personas, setPersonas] = useState<Persona[]>([])
  
  const { user, profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open && vivienda) {
      loadPersonas()
      // Resetear form
      setNuevoEstado('LIBRE')
      setGestorId(vivienda.gestor_id || '')
      setResponsableId(vivienda.responsable_id || '')
      setMotivo('')
    }
  }, [open, vivienda])

  const loadPersonas = async () => {
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setPersonas(data || [])
    } catch (error) {
      console.error('Error loading personas:', error)
    }
  }

  const handleSubmit = async () => {
    if (!vivienda || !user) return

    // Validaciones
    if (nuevoEstado === vivienda.estado) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe seleccionar un estado diferente al actual",
      })
      return
    }

    if (nuevoEstado !== 'LIBRE' && !motivo.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El motivo es obligatorio para estados BLOQUEADA y RESERVADA",
      })
      return
    }

    setLoading(true)

    try {
      // Ejecutar RPC
      const { data, error } = await supabase.rpc('rpc_change_estado', {
        p_vivienda_id: vivienda.id,
        p_a_estado: nuevoEstado,
        p_gestor_id: gestorId || null,
        p_responsable_id: responsableId || null,
        p_motivo: motivo || null,
        p_actor_user_id: user.id
      })

      if (error) throw error

      // Enviar notificación por email
      const gestor = personas.find(p => p.id === gestorId)
      const responsable = personas.find(p => p.id === responsableId)

      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sendStatusEmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            vivienda_id: vivienda.id,
            codigo_unique: vivienda.codigo_unique,
            de_estado: vivienda.estado,
            a_estado: nuevoEstado,
            gestor: gestor ? { id: gestor.id, nombre: gestor.nombre } : null,
            responsable: responsable ? { id: responsable.id, nombre: responsable.nombre } : null,
            motivo,
            actor_email: profile?.email,
            fecha_iso: new Date().toISOString()
          })
        })
      } catch (emailError) {
        console.warn('Error sending email notification:', emailError)
        // No fallar por error de email
      }

      toast({
        title: "Estado cambiado",
        description: `Vivienda ${vivienda.codigo_unique} cambiada a ${nuevoEstado}`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al cambiar el estado",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!vivienda) return null

  const estadosDisponibles = TRANSICIONES_VALIDAS[vivienda.estado] || []
  const gestores = personas.filter(p => p.tipo === 'GESTOR')
  const promotores = personas.filter(p => p.tipo === 'PROMOTOR')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado</DialogTitle>
          <DialogDescription>
            Vivienda: <strong>{vivienda.codigo_unique}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <EstadoChip estado={vivienda.estado} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <EstadoChip estado={nuevoEstado} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuevo-estado">Nuevo Estado</Label>
            <Select value={nuevoEstado} onValueChange={(value) => setNuevoEstado(value as Estado)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estadosDisponibles.map(estado => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gestor">Gestor</Label>
              <Select value={gestorId} onValueChange={setGestorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin gestor</SelectItem>
                  {gestores.map(gestor => (
                    <SelectItem key={gestor.id} value={gestor.id}>
                      {gestor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Select value={responsableId} onValueChange={setResponsableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin responsable</SelectItem>
                  {personas.map(persona => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.nombre} ({persona.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo {nuevoEstado !== 'LIBRE' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="motivo"
              placeholder="Describe el motivo del cambio..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Cambiando..." : "Cambiar Estado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}