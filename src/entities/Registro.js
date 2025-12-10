import { supabase } from '@/lib/supabaseClient'
import { syncRegistroToGoogleSheets } from '@/lib/googleSheets'
import { CLIENTE_PROMOTOR_MAP } from '@/components/shared/constants'

const LS_KEY = 'registros'

function lsGet() {
  const raw = localStorage.getItem(LS_KEY)
  return raw ? JSON.parse(raw) : []
}

function lsSet(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

export const Registro = {
  async list(orderBy = 'data') {
    if (supabase) {
      const field = String(orderBy || 'data')
      const asc = !field.startsWith('-')
      const col = asc ? field : field.slice(1)
      const { data, error } = await supabase.from('registros').select('*').order(col, { ascending: asc })
      if (error) throw error
      return data || []
    }
    return lsGet()
  },

  async create(payload) {
    const baseTotal = Number(payload?.qtd_caixas || 0) * 0.5
    const item = { id: crypto.randomUUID(), ...payload, total: Number(payload?.total ?? baseTotal) }
    const map = CLIENTE_PROMOTOR_MAP[item.cliente]
    if (map && Array.isArray(map) && map.length === 1 && !item.promotor) {
      item.promotor = map[0]
    }
    if (map && Array.isArray(map) && map.length === 2) {
      const qtd = Number(item.qtd_caixas || 0)
      const halfA = Math.floor(qtd / 2)
      const halfB = qtd - halfA
      const mk = (promotor, q) => ({ ...item, id: crypto.randomUUID(), promotor, qtd_caixas: q, total: q * 0.5 })
      const a = mk(map[0], halfA)
      const b = mk(map[1], halfB)
      const createdA = await Registro._insertOne(a)
      const createdB = await Registro._insertOne(b)
      return [createdA, createdB]
    }
    return await Registro._insertOne(item)
  },

  async _insertOne(item) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('registros').insert(item).select().single()
        if (error) {
          console.error('❌ Erro ao inserir registro no Supabase:', error)
          throw error
        }
        console.log('✅ Registro salvo no Supabase:', data.id)
        // Sincronizar com Google Sheets (não bloquear se falhar)
        syncRegistroToGoogleSheets(data).catch(err => {
          console.warn('⚠️ Erro ao sincronizar com Google Sheets:', err)
        })
        return data
      } catch (err) {
        console.error('❌ Erro ao salvar registro:', err)
        throw err
      }
    }
    const list = lsGet()
    list.push(item)
    lsSet(list)
    // Sincronizar com Google Sheets (não bloquear se falhar)
    syncRegistroToGoogleSheets(item).catch(err => {
      console.warn('⚠️ Erro ao sincronizar com Google Sheets:', err)
    })
    return item
  },

  async update(id, changes) {
    const next = { ...changes }
    if (Object.prototype.hasOwnProperty.call(next, 'qtd_caixas') && !Object.prototype.hasOwnProperty.call(next, 'total')) {
      const q = Number(next.qtd_caixas || 0)
      next.total = q * 0.5
    }
    if (supabase) {
      try {
        const allowed = ['data','cliente','promotor','fretista','qtd_caixas','total','status_revisado','rede','uf','vendedor']
        const sanitized = {}
        for (const k of allowed) {
          if (Object.prototype.hasOwnProperty.call(next, k)) sanitized[k] = next[k]
        }
        if (Object.keys(sanitized).length === 0) {
          const { data } = await supabase.from('registros').select('*').eq('id', id).limit(1)
          return Array.isArray(data) ? data[0] : data
        }
        if (Object.prototype.hasOwnProperty.call(sanitized, 'qtd_caixas')) sanitized.qtd_caixas = Number(sanitized.qtd_caixas || 0)
        if (Object.prototype.hasOwnProperty.call(sanitized, 'total')) sanitized.total = Number(sanitized.total || 0)
        if (Object.prototype.hasOwnProperty.call(sanitized, 'status_revisado')) sanitized.status_revisado = !!sanitized.status_revisado
        const { data, error } = await supabase.from('registros').update(sanitized).eq('id', id).select('*')
        if (error) {
          console.error('❌ Erro ao atualizar registro no Supabase:', error)
          throw error
        }
        const updated = Array.isArray(data) ? data[0] : data
        syncRegistroToGoogleSheets(updated).catch(err => {
          console.warn('⚠️ Erro ao sincronizar com Google Sheets:', err)
        })
        return updated
      } catch (err) {
        console.error('❌ Erro ao atualizar registro:', err)
        throw err
      }
    }
    const list = lsGet().map(r => (r.id === id ? { ...r, ...next } : r))
    lsSet(list)
    const updated = list.find(r => r.id === id)
    // Sincronizar com Google Sheets (não bloquear se falhar)
    syncRegistroToGoogleSheets(updated).catch(err => {
      console.warn('⚠️ Erro ao sincronizar com Google Sheets:', err)
    })
    return updated
  },

  async remove(id) {
    if (supabase) {
      const { error } = await supabase.from('registros').delete().eq('id', id)
      if (error) throw error
      return true
    }
    const list = lsGet().filter(r => r.id !== id)
    lsSet(list)
    return true
  }
}
