import React, { useEffect, useMemo, useState } from 'react'
import { Registro } from '@/entities/Registro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import EditRegistroModal from '@/components/revisao/EditRegistroModal'
import DeleteConfirmModal from '@/components/revisao/DeleteConfirmModal'
import { useConstants } from '@/components/shared/constants'
import { useTheme } from '@/components/shared/ThemeContext'
import { formatDateBR } from '@/utils'

export default function Revisao() {
  const { isDarkMode } = useTheme()
  const { CLIENTES = [], PROMOTORES = [], FRETISTAS = [] } = useConstants()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [cliente, setCliente] = useState('')
  const [promotor, setPromotor] = useState('')
  const [fretista, setFretista] = useState('')
  const [rede, setRede] = useState('')
  const [uf, setUF] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  
  // Obter valores únicos para filtros
  const uniqueRedes = useMemo(() => {
    const s = new Set()
    registros.forEach(r => { if (r.rede) s.add(r.rede) })
    return Array.from(s).sort()
  }, [registros])
  const uniqueUFs = useMemo(() => {
    const s = new Set()
    registros.forEach(r => { if (r.uf) s.add(r.uf) })
    return Array.from(s).sort()
  }, [registros])
  const uniqueVendedores = useMemo(() => {
    const s = new Set()
    registros.forEach(r => { if (r.vendedor) s.add(r.vendedor) })
    return Array.from(s).sort()
  }, [registros])

  const uniqueMonths = useMemo(() => {
    const months = new Set()
    registros.forEach(r => { if (r.data) { const d = new Date(r.data + 'T00:00:00'); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; months.add(k) } })
    return Array.from(months).sort().reverse()
  }, [registros])

  useEffect(() => { (async () => { const data = await Registro.list('-data'); setRegistros(data); setLoading(false) })() }, [])

  useEffect(() => {
    const pendentesAntigos = registros.filter(r => !r.status_revisado && r.data && (new Date().toISOString().slice(0,10) > r.data)).filter(r => {
      const d = new Date(r.data)
      const diff = (Date.now() - d.getTime()) / (1000*60*60*24)
      return diff > 5
    })
    if (pendentesAntigos.length) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') new Notification('Registros pendentes há mais de 5 dias', { body: `${pendentesAntigos.length} registros` })
        else Notification.requestPermission()
      }
    }
  }, [registros])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return registros.filter(r => {
      const okStatus = status === 'all' ? true : status === 'revisado' ? r.status_revisado : !r.status_revisado
      const okText = !q || [r.cliente, r.promotor, r.fretista, r.rede, r.uf, r.vendedor].some(x => (x||'').toLowerCase().includes(q))
      const okCliente = !cliente || r.cliente === cliente
      const okPromotor = !promotor || r.promotor === promotor
      const okFretista = !fretista || r.fretista === fretista
      const okRede = !rede || r.rede === rede
      const okUF = !uf || r.uf === uf
      const okVendedor = !vendedor || r.vendedor === vendedor
      const okDate = (!from || r.data >= from) && (!to || r.data <= to)
      return okStatus && okText && okCliente && okPromotor && okFretista && okRede && okUF && okVendedor && okDate
    })
  }, [registros, search, status, cliente, promotor, fretista, rede, uf, vendedor, from, to])

  const handleDelete = async () => {
    await Registro.remove(deleting.id)
    setDeleting(null)
    const data = await Registro.list('-data'); setRegistros(data)
  }

  const markAllRevisado = async () => {
    for (const r of filtered.filter(x => !x.status_revisado)) {
      await Registro.update(r.id, { status_revisado: true })
      await new Promise(res => setTimeout(res, 1000))
    }
    const data = await Registro.list('-data'); setRegistros(data)
  }

  const duplicar = async (registro) => {
    const ok = window.confirm('Você confirma essa duplicidade?')
    if (!ok) return
    try {
      const { id, ...payload } = registro
      await Registro.create(payload)
      const data = await Registro.list('-data')
      setRegistros(data)
    } catch (err) {
      console.error('Erro ao duplicar:', err)
      alert('Erro ao duplicar registro')
    }
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
      <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-0`}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : ''}>Revisão de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input 
              placeholder="Buscar" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
            />
            <Select value={status} onValueChange={setStatus} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="revisado">Revisados</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
            </Select>
            <Button onClick={markAllRevisado} className={isDarkMode ? 'bg-green-600 hover:bg-green-700' : ''}>Marcar Todos como Revisados</Button>
            <Select value={cliente} onValueChange={setCliente} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">Cliente</SelectItem>
              {CLIENTES.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </Select>
            <Select value={promotor} onValueChange={setPromotor} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">Promotor</SelectItem>
              {PROMOTORES.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </Select>
            <Select value={fretista} onValueChange={setFretista} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">Fretista</SelectItem>
              {FRETISTAS.map(f=> <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </Select>
            <Select value={rede} onValueChange={setRede} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">Rede</SelectItem>
              {uniqueRedes.map(r=> <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </Select>
            <Select value={uf} onValueChange={setUF} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">UF</SelectItem>
              {uniqueUFs.map(u=> <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </Select>
            <Select value={vendedor} onValueChange={setVendedor} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="">Vendedor</SelectItem>
              {uniqueVendedores.map(v=> <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </Select>
            <div className="flex gap-2">
              <Input 
                type="date" 
                value={from} 
                onChange={e=>{ setFrom(e.target.value); setSelectedMonth('') }} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
              <Input 
                type="date" 
                value={to} 
                onChange={e=>{ setTo(e.target.value); setSelectedMonth('') }} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
            </div>
            <Select value={selectedMonth} onValueChange={(value)=>{ setSelectedMonth(value); if (!value || value === 'all') { setFrom(''); setTo('') } else { const [y,m] = value.split('-').map(Number); const start = new Date(y, m-1, 1); const end = new Date(y, m, 0); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)) } }} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
              <SelectItem value="all">Todos os meses</SelectItem>
              {uniqueMonths.map(m=> <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const day = today.getDay(); const start = new Date(today); start.setDate(today.getDate() - day + (day === 0 ? -6 : 1)); const end = new Date(start); end.setDate(start.getDate() + 6); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Esta Semana</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const start = new Date(today.getFullYear(), today.getMonth(), 1); const end = new Date(today.getFullYear(), today.getMonth()+1, 0); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Este Mês</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const prev = new Date(today.getFullYear(), today.getMonth()-1, 1); const end = new Date(prev.getFullYear(), prev.getMonth()+1, 0); setFrom(prev.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Mês Anterior</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const m = today.getMonth(); const startMonth = m - (m%3); const start = new Date(today.getFullYear(), startMonth, 1); const end = new Date(today.getFullYear(), startMonth+3, 0); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Trimestre</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const m = today.getMonth(); const startMonth = m < 6 ? 0 : 6; const start = new Date(today.getFullYear(), startMonth, 1); const end = new Date(today.getFullYear(), startMonth+6, 0); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Semestre</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const start = new Date(today.getFullYear(), 0, 1); const end = new Date(today.getFullYear(), 11, 31); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)); setSelectedMonth('') }} className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}>Este Ano</Button>
            </div>
          </div>
          {loading ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-white' : ''}`}>Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : ''}`}>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Data</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Cliente</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Promotor</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Fretista</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Rede</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>UF</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Vendedor</th>
                    <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Status</th>
                    <th className={`text-right p-2 ${isDarkMode ? 'text-white' : ''}`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className={`border-b ${isDarkMode ? 'border-gray-700' : ''}`}>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{formatDateBR(r.data)}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.cliente}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.promotor}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.fretista}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.rede || '-'}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.uf || '-'}</td>
                      <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.vendedor || '-'}</td>
                      <td className="p-2">
                        <button className={`px-2 py-1 rounded text-sm ${r.status_revisado ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`} onClick={async ()=>{ await Registro.update(r.id, { status_revisado: !r.status_revisado }); const data = await Registro.list('-data'); setRegistros(data) }}>
                          {r.status_revisado ? 'Revisado' : 'Pendente'}
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(r)} className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Editar</Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicar(r)} className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Duplicar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </CardContent>
      </Card>

      {editing && <EditRegistroModal registro={editing} onClose={() => setEditing(null)} onSaved={async () => { const data = await Registro.list('-data'); setRegistros(data) }} />}
      {deleting && <DeleteConfirmModal registro={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />}
    </div>
    </div>
  )
}
