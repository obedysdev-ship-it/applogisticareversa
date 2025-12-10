import { supabase } from '@/lib/supabaseClient'

export async function syncRegistroToGoogleSheets(registro) {
  // Método 1: Tentar usar o cliente Supabase diretamente
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

  // Método 2: Tentar usar fetch direto para a Edge Function
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    if (url && key) {
      const res = await fetch(`${url}/functions/v1/sync-registro-google-sheets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${key}`, 
          'apikey': key 
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

  // Método 3: Fallback para Google Apps Script (se configurado)
  const hook = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro)
      })
      return { ok: res.ok }
    } catch (err) {
      console.warn('Erro ao tentar sincronizar via Google Apps Script:', err)
    }
  }

  // Se nenhum método funcionou
  return { 
    ok: false, 
    reason: 'no_sync_method_available',
    message: 'Nenhum método de sincronização disponível. Verifique a configuração do Supabase e Google Sheets.'
  }
}
