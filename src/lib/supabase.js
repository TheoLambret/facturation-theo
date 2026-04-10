import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Variables Supabase manquantes au build.\n` +
    `VITE_SUPABASE_URL = "${supabaseUrl}"\n` +
    `VITE_SUPABASE_ANON_KEY = "${supabaseAnonKey ? '(défini)' : 'undefined'}"`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
