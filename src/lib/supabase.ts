import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de base de datos
export type Estado = 'LIBRE' | 'BLOQUEADA' | 'RESERVADA'
export type Role = 'admin' | 'gestor' | 'promotor' | 'viewer'
export type PersonaTipo = 'GESTOR' | 'PROMOTOR'

export interface Profile {
  id: string
  full_name: string | null
  email: string
  role: Role
  created_at: string
  updated_at: string
}

export interface Persona {
  id: string
  nombre: string
  email: string | null
  tipo: PersonaTipo
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Vivienda {
  id: string
  portal: string | null
  planta: string | null
  letra: string | null
  tipologia: string | null
  orientacion: string | null
  dormitorios: number | null
  sup_util_terraza: number | null
  sup_util_vivienda: number | null
  sup_util_terrazas: number | null
  pvp_final: number | null
  observaciones: string | null
  estado: Estado
  gestor_id: string | null
  responsable_id: string | null
  codigo_unique: string
  created_at: string
  updated_at: string
  gestor?: Persona
  responsable?: Persona
}

export interface CambioEstado {
  id: string
  vivienda_id: string
  de_estado: Estado | null
  a_estado: Estado
  gestor_id: string | null
  responsable_id: string | null
  motivo: string | null
  actor_user_id: string | null
  created_at: string
  vivienda?: Vivienda
  gestor?: Persona
  responsable?: Persona
  actor?: Profile
}

export interface ImportJob {
  id: string
  filename: string | null
  status: 'PENDIENTE' | 'OK' | 'ERROR'
  total_rows: number | null
  ok_rows: number | null
  error_rows: number | null
  log: any
  created_at: string
}