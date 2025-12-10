import { supabase } from '@/lib/supabaseClient'

export async function syncRegistroToGoogleSheets(registro) {
  const hook = import.meta.env.VITE_GOOGLE_APS_SCRIPT_URL || import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL

  // Prioridade 1: Google Apps Script (se configurado)
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro)
      })
      if (res.ok) return { ok: true }
    } catch (err) {
      console.warn('Erro ao tentar sincronizar via Google Apps Script:', err)
    }
  }

  // Prioridade 2: Edge Function via SDK
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('sync-registro-google-sheets', { 
        body: registro 
      })
      if (!error && data?.ok) {
        return { ok: true }
      }
      if (error) {
        console.warn('Erro ao invocar Edge Function via cliente:', error)
      }
    }
  } catch (err) {
    console.warn('Erro ao tentar sincronizar via cliente Supabase:', err)
  }

  // Prioridade 3: Edge Function via fetch
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    if (url && key) {
      const res = await fetch(`${url}/functions/v1/sync-registro-google-sheets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(registro)
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.ok) {
          return { ok: true }
        }
        return { ok: false, reason: data.error || 'unknown_error', details: data }
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.warn('Erro ao sincronizar com Google Sheets:', errorData)
        return { ok: false, reason: 'sync_failed', details: errorData }
      }
    }
  } catch (err) {
    console.warn('Erro ao tentar sincronizar via fetch:', err)
  }

  return { ok: false, reason: 'no_sync_method_available' }
}
