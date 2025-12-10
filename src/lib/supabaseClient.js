import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar configuração
if (!url || !key) {
  console.warn('⚠️ Supabase não configurado. Verifique o arquivo .env.local')
  console.warn('Variáveis necessárias:')
  console.warn('  - VITE_SUPABASE_URL')
  console.warn('  - VITE_SUPABASE_ANON_KEY')
}

export const supabase = url && key ? createClient(url, key) : null

// Testar conexão ao inicializar (opcional, apenas em desenvolvimento)
if (import.meta.env.DEV && supabase) {
  supabase.from('registros').select('count').limit(1)
    .then(() => console.log('✅ Conexão com Supabase estabelecida'))
    .catch((err) => console.error('❌ Erro ao conectar com Supabase:', err.message))
}
