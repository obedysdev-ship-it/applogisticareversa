export let CLIENTES = []
export let PROMOTORES = []
export let FRETISTAS = []
export let REDES = []
export let UFS = []
export let VENDEDORES = []
export let CLIENTES_DATA = []
export let CLIENTE_PROMOTOR_MAP = {}
import { supabase } from '@/lib/supabaseClient'
import React, { useEffect, useState } from 'react'

const listeners = new Set()
const notify = () => { 
  const payload = getConstants()
  console.log('🔔 Notificando listeners:', { 
    listeners: listeners.size, 
    clientes: payload.CLIENTES.length,
    promotores: payload.PROMOTORES.length,
    fretistas: payload.FRETISTAS.length
  })
  listeners.forEach(fn => { 
    try { 
      fn(payload) 
    } catch (err) {
      console.error('Erro ao notificar listener:', err)
    }
  }) 
}
export const getConstants = () => ({ CLIENTES, PROMOTORES, FRETISTAS, REDES, UFS, VENDEDORES, CLIENTES_DATA, CLIENTE_PROMOTOR_MAP })
export function subscribeConstants(fn) { 
  listeners.add(fn)
  // Notificar imediatamente ao se inscrever com os dados atuais
  try {
    const current = getConstants()
    console.log('📥 Novo listener inscrito, enviando dados atuais:', {
      clientes: current.CLIENTES?.length || 0,
      promotores: current.PROMOTORES?.length || 0,
      fretistas: current.FRETISTAS?.length || 0
    })
    fn(current)
  } catch (err) {
    console.error('Erro ao notificar ao inscrever:', err)
  }
  return () => listeners.delete(fn) 
}
export function useConstants() {
  const [state, setState] = useState(getConstants())
  useEffect(() => {
    // Forçar atualização inicial
    setState(getConstants())
    const unsubscribe = subscribeConstants((newState) => {
      console.log('🔄 useConstants: Estado atualizado', {
        clientes: newState.CLIENTES?.length || 0,
        promotores: newState.PROMOTORES?.length || 0,
        fretistas: newState.FRETISTAS?.length || 0
      })
      setState(newState)
    })
    return unsubscribe
  }, [])
  return state
}

function parsePromptText(text) {
  const trim = (s) => s.trim()
  const lines = text.split(/\r?\n/)
  const data = {}

  const tryJSON = () => {
    try { return JSON.parse(text) } catch { return null }
  }
  const json = tryJSON()
  if (json && typeof json === 'object') return json

  lines.forEach((l) => {
    const m = l.match(/^([A-Z_]+)\s*:\s*(.*)$/)
    if (m) {
      const key = m[1]
      const values = m[2].split(',').map(v => trim(v)).filter(Boolean)
      data[key] = values
    }
  })
  return data
}

const isHTML = (s) => /^\s*<!doctype html/i.test(s) || /<html/i.test(s)

export async function initConstantsFromPrompt() {
  try {
    if (supabase) {
      console.log('🔄 Carregando dados do Supabase...')
      
      const { data: clientesRows, error: clientesError } = await supabase
        .from('clientes')
        .select('cliente, rede, uf, vendedor')
        .order('cliente', { ascending: true })
      
      if (clientesError) {
        console.error('❌ Erro ao carregar clientes:', clientesError)
      } else if (Array.isArray(clientesRows) && clientesRows.length) {
        // Criar novos arrays para garantir que React detecte mudanças
        const novosClientes = clientesRows.map(r => r.cliente).filter(Boolean)
        if (!novosClientes.includes('Cliente do Ceasa')) novosClientes.push('Cliente do Ceasa')
        if (!novosClientes.includes('Outro (Digitar Manual)')) novosClientes.push('Outro (Digitar Manual)')
        
        CLIENTES_DATA = clientesRows.map(r => ({ 
          nome_fantasia: r.cliente, 
          rede: r.rede, 
          uf: r.uf, 
          vendedor: r.vendedor 
        }))
        CLIENTES = novosClientes
        const setUnique = (arr) => Array.from(new Set(arr.filter(Boolean)))
        REDES = setUnique(clientesRows.map(r => r.rede))
        UFS = setUnique(clientesRows.map(r => r.uf))
        VENDEDORES = setUnique(clientesRows.map(r => r.vendedor))
        console.log(`✅ ${CLIENTES.length} clientes carregados`)
        notify()
      }

      const { data: fretistasRows, error: fretistasError } = await supabase
        .from('fretistas')
        .select('nome')
        .order('nome', { ascending: true })
      
      if (fretistasError) {
        console.error('❌ Erro ao carregar fretistas:', fretistasError)
      } else if (Array.isArray(fretistasRows) && fretistasRows.length) {
        // Criar novo array para garantir que React detecte mudanças
        const novosFretistas = fretistasRows.map(r => r.nome).filter(Boolean)
        if (!novosFretistas.includes('Outro (Digitar Manual)')) novosFretistas.push('Outro (Digitar Manual)')
        FRETISTAS = novosFretistas
        console.log(`✅ ${FRETISTAS.length} fretistas carregados`)
        notify()
      }

      const { data: promotoresRows, error: promotoresError } = await supabase
        .from('promotores')
        .select('nome')
        .order('nome', { ascending: true })
      
      if (promotoresError) {
        console.error('❌ Erro ao carregar promotores:', promotoresError)
      } else if (Array.isArray(promotoresRows) && promotoresRows.length) {
        // Criar novo array para garantir que React detecte mudanças
        const novosPromotores = promotoresRows.map(r => r.nome).filter(Boolean)
        if (!novosPromotores.includes('Outro (Digitar Manual)')) novosPromotores.push('Outro (Digitar Manual)')
        PROMOTORES = novosPromotores
        console.log(`✅ ${PROMOTORES.length} promotores carregados`)
        notify()
      }
    } else {
      console.warn('⚠️ Supabase não está configurado')
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar constantes:', err)
  }

  try {
    const res = await fetch('/PROMPT.txt')
    if (!res.ok) return
    const txt = await res.text()
    if (isHTML(txt)) return
    if (!txt || !txt.trim()) return
    const parsed = parsePromptText(txt)
    const arr = (v) => Array.isArray(v) ? v : []
    // Só sobrescrever se ainda não tiver dados do Supabase
    if (CLIENTES.length === 0) CLIENTES = arr(parsed.CLIENTES)
    if (PROMOTORES.length === 0) PROMOTORES = arr(parsed.PROMOTORES)
    if (FRETISTAS.length === 0) FRETISTAS = arr(parsed.FRETISTAS)
    REDES = arr(parsed.REDES)
    UFS = arr(parsed.UFS)
    VENDEDORES = arr(parsed.VENDEDORES)
    if (CLIENTES_DATA.length === 0) CLIENTES_DATA = Array.isArray(parsed.CLIENTES_DATA) ? parsed.CLIENTES_DATA : []
    CLIENTE_PROMOTOR_MAP = typeof parsed.CLIENTE_PROMOTOR_MAP === 'object' && parsed.CLIENTE_PROMOTOR_MAP ? parsed.CLIENTE_PROMOTOR_MAP : {}
    notify()
  } catch {}

  try {
    const res2 = await fetch('/clientesnovo.txt')
    if (res2.ok) {
      const txt2 = await res2.text()
      if (isHTML(txt2)) return
      const lines = txt2.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      // Só sobrescrever se ainda não tiver dados do Supabase
      if (lines.length && CLIENTES.length === 0) {
        CLIENTES = lines
        if (!CLIENTES.includes('Cliente do Ceasa')) CLIENTES.push('Cliente do Ceasa')
        notify()
      }
    }
  } catch {}

  try {
    const res3 = await fetch('/Components/shared/constants.json')
    if (res3.ok) {
      const ct = res3.headers.get('content-type') || ''
      if (/application\/json/i.test(ct)) {
        try {
          const obj = await res3.json()
          // Só sobrescrever se ainda não tiver dados do Supabase
          if (Array.isArray(obj.FRETISTAS) && FRETISTAS.length === 0) FRETISTAS = obj.FRETISTAS
          if (Array.isArray(obj.PROMOTORES) && PROMOTORES.length === 0) PROMOTORES = obj.PROMOTORES
          if (Array.isArray(obj.CLIENTES_DATA) && CLIENTES_DATA.length === 0) CLIENTES_DATA = obj.CLIENTES_DATA
          if (obj.CLIENTE_PROMOTOR_MAP && typeof obj.CLIENTE_PROMOTOR_MAP === 'object') CLIENTE_PROMOTOR_MAP = obj.CLIENTE_PROMOTOR_MAP
          notify()
        } catch {}
      } else {
        const txt3 = await res3.text()
        if (isHTML(txt3)) return
        const pick = (name) => {
          const m = txt3.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*([\\s\\S]*?);`))
          if (!m) return null
          try { return JSON.parse(m[1]) } catch { return null }
        }
        const f = pick('FRETISTAS'); if (Array.isArray(f) && FRETISTAS.length === 0) FRETISTAS = f
        const p = pick('PROMOTORES'); if (Array.isArray(p) && PROMOTORES.length === 0) PROMOTORES = p
        const cd = pick('CLIENTES_DATA'); if (Array.isArray(cd) && CLIENTES_DATA.length === 0) CLIENTES_DATA = cd
        const cpm = pick('CLIENTE_PROMOTOR_MAP'); if (cpm && typeof cpm === 'object') CLIENTE_PROMOTOR_MAP = cpm
        notify()
      }
    }
  } catch {}

  if (!FRETISTAS.length) {
    FRETISTAS = ['Anderson','Andre','Danilo','Eden','Ednilson','Elvis','Gildasio','Jancleiton','Josenilson','Natal','Paulo Noel','Roque','Tiago','Trielo Ceasa BA','Outro (Digitar Manual)']
  }
  if (!PROMOTORES.length) {
    PROMOTORES = [
      'Alessandro Bastos de Almeida','Alex Santos Nascimento','Anderson Nunes da Silva','Antonio Carlos Santos Sales','Antonio de jesus cerqueira','Aquila Vieira de Jesus Silva','Bianca da Silva Varjao','Caio Wenner Santos Rudnicki','Carlos Henrique Barros de Oliveira','Claudio Jose De Almeida Santos','Crislaine Machado dos Santos','Danilo Regis Santos','Douglas de Jesus Reis','Eder Alves de Jesus','Fernando Pereira da Silva Junior','Filipe Carvalho Costa','Geocacio Pereira da Silva','Gilmario da Conceicao Silva','Hugo de Jesus Conceicao','Islen Bergson De Jesus Cruz','Jadison de Andrade Santos','Joabe dos Santos Silva','Joao Ivan Santos Moreira','Jobson Emanuel Dos Santos','Jose Marcio Santos Rocha','Lucas Macedo Imbirussu','Luis Alberto Santos Borges','Manoel Messias Gois Junior','Mateus Lima Oliveira','Nixon de Jesus Araujo','Ramon Borges Santos da Paixao','Renato Almeida Barreto','Richard Dos Santos Reis','Robson da Silva Domiciano','Rogesson Geyson Lima da Silva','Ronald Souza Dos Santos','Ronalde Bispo Santos','Tiago Saleh Rodrigues','Diego Bruno','Alysson Ramos','Trielo Ceasa BA','Outro (Digitar Manual)'
    ]
  }
  if (!CLIENTES.length) CLIENTES = ['Cliente do Ceasa','Outro (Digitar Manual)']
  if (!CLIENTE_PROMOTOR_MAP['Cliente do Ceasa']) CLIENTE_PROMOTOR_MAP['Cliente do Ceasa'] = ['Trielo Ceasa BA']

  const STATIC_CLIENTE_PROMOTOR_MAP = {
    'Assai Paralela': ['Alessandro Bastos de Almeida','Diego Bruno Melo dos santos'],
    'Atakarejo Boca Do Rio': ['Alysson Ramos de Sousa'],
    'Atakarejo Pinto De Aguiar': ['Alysson Ramos de Sousa'],
    'Assai Petrolina': ['Anderson nunes da silva'],
    'Assai Camacari': ['Aquila vieira de jesus da silva'],
    'Atakarejo Lauro': ['Arnold da silva dos santos'],
    'Assai Sr Do Bonfim': ['Bianca da Silva Varjao','Geocacio Pereira da Silva'],
    'G Barbosa Farolandia': ['Carlos Henrique barros de oliveira'],
    'GBarbosa - Rio Mar': ['Carlos Henrique barros de oliveira'],
    'GBarbosa Francisco Porto': ['Carlos Henrique barros de oliveira'],
    'Assai Calcada': ['Claudio Jose De Almeida Santos'],
    'Assai Vasco Da Gama': ['Crislaine Machado dos Santos','Danilo Regis Santos'],
    'Assai Cabula': ['Hugo de Jesus Conceicao'],
    'Atakarejo Aracaju': ['Islen Bergson de Jesus Cruz'],
    'Rmix Horto': ['Joabe dos Santos Silva'],
    'Rmix Vitoria': ['Joabe dos Santos Silva'],
    'Sams Aracaju': ['Jose Marcio Santos Rocha'],
    'Sams Pituba': ['Luis Alberto Santos Borges']
  }

  CLIENTE_PROMOTOR_MAP = { ...STATIC_CLIENTE_PROMOTOR_MAP, ...CLIENTE_PROMOTOR_MAP }
  
  // Notificar todos os listeners após todas as inicializações
  // Usar setTimeout para garantir que os componentes já estejam montados
  setTimeout(() => {
    const final = getConstants()
    console.log('📋 Constantes finais após inicialização:', {
      clientes: final.CLIENTES.length,
      promotores: final.PROMOTORES.length,
      fretistas: final.FRETISTAS.length,
      listeners: listeners.size
    })
    notify()
  }, 100)
  
  // Também notificar imediatamente para componentes já montados
  notify()
}
