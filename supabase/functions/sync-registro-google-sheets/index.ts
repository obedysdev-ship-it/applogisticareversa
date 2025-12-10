// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { JWT } from 'https://esm.sh/google-auth-library@9.6.3'

function safeString(v: unknown) { return (typeof v === 'string' ? v : (v ?? '')).toString() }
function safeNumber(v: unknown) { const n = Number(v ?? 0); return Number.isFinite(n) ? n : 0 }

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }
  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      })
    }

    const body = await req.json()

    // Validar variáveis de ambiente
    const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
    const key = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
    const spreadsheetId = Deno.env.get('GOOGLE_SPREADSHEET_ID')
    
    if (!email || !key || !spreadsheetId) {
      const missing = []
      if (!email) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL')
      if (!key) missing.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
      if (!spreadsheetId) missing.push('GOOGLE_SPREADSHEET_ID')
      
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'missing_google_env',
        missing_vars: missing
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      })
    }

    // Autenticar com Google
    const client = new JWT({ 
      email, 
      key: key.replace(/\\n/g, '\n'), // Garantir que as quebras de linha estão corretas
      scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
    })
    
    const token = await client.getAccessToken()
    if (!token?.token) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'no_token',
        message: 'Falha ao obter token de acesso do Google'
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      })
    }

    // Preparar dados para inserção
    const nowISO = new Date().toISOString()
    const values = [[
      safeString(body.id),
      safeString(body.data),
      safeString(body.cliente),
      safeString(body.promotor),
      safeString(body.fretista),
      safeString(body.rede || ''),
      safeString(body.uf || ''),
      safeString(body.vendedor || ''),
      safeNumber(body.qtd_caixas),
      safeNumber(body.total),
      body.status_revisado ? 'true' : 'false',
      nowISO,
      nowISO
    ]]

    // Inserir na planilha
    const range = 'Registros!A1'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token.token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ values })
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      let errorDetails = errText
      try {
        const errJson = JSON.parse(errText)
        errorDetails = errJson.error?.message || errText
      } catch {}
      
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'sheets_append_failed', 
        details: errorDetails,
        status: res.status
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      })
    }

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    })
  } catch (e) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'unexpected', 
      details: String(e),
      message: e instanceof Error ? e.message : 'Erro inesperado'
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    })
  }
})

