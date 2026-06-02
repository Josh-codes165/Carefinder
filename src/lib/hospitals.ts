import { supabase } from './supabase'

export type Hospital = {
  id: string
  name: string
  address: string
  city: string
  lga: string
  state: string
  phone: string | null
  email: string | null
  specialties: string[]
  ownership_type: 'public' | 'private'
  description: string | null
  visiting_hours: string | null
  is_published: boolean
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export async function fetchHospitals({
  city,
  specialty,
}: {
  city?: string | null
  specialty?: string | null
}) {
  let query = supabase
    .from('hospitals')
    .select('*')
    .eq('is_published', true)

  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  if (specialty) {
    query = query.contains('specialties', [specialty])
  }

  query = query.order('name')

  const { data, error } = await query
  if (error) throw error
  return data as Hospital[]
}

export async function fetchHospitalById(id: string) {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Hospital
}