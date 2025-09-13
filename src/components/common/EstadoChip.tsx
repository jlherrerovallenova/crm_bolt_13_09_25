import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lock, UserCheck } from 'lucide-react'
import { getEstadoColor } from '@/lib/utils'
import type { Estado } from '@/lib/supabase'

interface EstadoChipProps {
  estado: Estado
  size?: 'sm' | 'md'
}

export function EstadoChip({ estado, size = 'md' }: EstadoChipProps) {
  const getIcon = () => {
    const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
    switch (estado) {
      case 'LIBRE':
        return <CheckCircle className={iconClass} />
      case 'BLOQUEADA':
        return <Lock className={iconClass} />
      case 'RESERVADA':
        return <UserCheck className={iconClass} />
      default:
        return null
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${getEstadoColor(estado)} flex items-center space-x-1 ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'px-3 py-1'}`}
    >
      {getIcon()}
      <span>{estado}</span>
    </Badge>
  )
}