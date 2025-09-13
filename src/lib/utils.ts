import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'LIBRE': return 'bg-green-100 text-green-800 border-green-200'
    case 'BLOQUEADA': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'RESERVADA': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getEstadoIcon(estado: string) {
  switch (estado) {
    case 'LIBRE': return 'check-circle'
    case 'BLOQUEADA': return 'lock'
    case 'RESERVADA': return 'user-check'
    default: return 'help-circle'
  }
}

export const ESTADOS_VALIDOS = ['LIBRE', 'BLOQUEADA', 'RESERVADA'] as const
export const TRANSICIONES_VALIDAS = {
  LIBRE: ['BLOQUEADA', 'RESERVADA'],
  BLOQUEADA: ['LIBRE', 'RESERVADA'],
  RESERVADA: ['LIBRE', 'BLOQUEADA']
}