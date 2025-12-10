import React, { useEffect, useMemo, useState } from 'react'
import { Registro } from '@/entities/Registro'
import SummaryCards from '@/components/dashboard/SummaryCards'
// Removidos gráficos não desejados
import MonthlyChart from '@/components/dashboard/MonthlyChart'
import MediaPorRedeChart from '@/components/dashboard/MediaPorRedeChart'
import TopRankings from '@/components/dashboard/TopRankings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'
import { CLIENTES, PROMOTORES, FRETISTAS } from '@/components/shared/constants'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Filter, Download } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeContext'

export default function Dashboard() {
  const { isDarkMode } = useTheme()
  const [registros, setRegistros] = useState([])
  const [cliente, setCliente] = useState('')
  const [promotor, setPromotor] = useState('')
  const [fretista, setFretista] = useState('')
  const [rede, setRede] = useState('')
  const [uf, setUF] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => { (async () => { const data = await Registro.list('data'); setRegistros(data) })() }, [])

  const filtered = useMemo(() => {
    let pf = from
    let pt = to
    if (periodo === 'mes_anterior') {
      const d = new Date()
      const prev = new Date(d.getFullYear(), d.getMonth()-1, 1)
      const end = new Date(d.getFullYear(), d.getMonth(), 0)
      pf = prev.toISOString().slice(0,10)
      pt = end.toISOString().slice(0,10)
    }
    if (periodo === 'trimestre') {
      const d = new Date()
      const start = new Date(d.getFullYear(), d.getMonth()-3, 1)
      pf = start.toISOString().slice(0,10)
      pt = new Date().toISOString().slice(0,10)
    }
    if (periodo === 'semestre') {
      const d = new Date()
      const start = new Date(d.getFullYear(), d.getMonth()-6, 1)
      pf = start.toISOString().slice(0,10)
      pt = new Date().toISOString().slice(0,10)
    }
    return registros.filter(r => {
      const okCliente = !cliente || r.cliente === cliente
      const okPromotor = !promotor || r.promotor === promotor
      const okFretista = !fretista || r.fretista === fretista
      const okRede = !rede || r.rede === rede
      const okUF = !uf || r.uf === uf
      const okVendedor = !vendedor || r.vendedor === vendedor
      const okStatus = status === 'all' ? true : status === 'revisado' ? r.status_revisado : !r.status_revisado
      const okDate = (!pf || r.data >= pf) && (!pt || r.data <= pt)
      const okText = !q || [r.cliente, r.promotor, r.fretista, r.rede, r.uf, r.vendedor].some(x => (x||'').toLowerCase().includes(q.toLowerCase()))
      return okCliente && okPromotor && okFretista && okRede && okUF && okVendedor && okStatus && okDate && okText
    })
  }, [registros, cliente, promotor, fretista, rede, uf, vendedor, status, from, to, q, periodo])

  const resumos = useMemo(() => {
    const agg = { clientes: {}, promotores: {}, fretistas: {}, redes: {}, ufs: {}, vendedores: {} }
    filtered.forEach(r => {
      const inc = (obj, key, qtd, total) => { obj[key] = obj[key] || { caixas: 0, total: 0 }; obj[key].caixas += qtd; obj[key].total += total }
      const caixas = Number(r.qtd_caixas || 0); const valor = Number(r.total || 0)
      if (r.cliente) inc(agg.clientes, r.cliente, caixas, valor)
      if (r.promotor) inc(agg.promotores, r.promotor, caixas, valor)
      if (r.fretista) inc(agg.fretistas, r.fretista, caixas, valor)
      if (r.rede) inc(agg.redes, r.rede, caixas, valor)
      if (r.uf) inc(agg.ufs, r.uf, caixas, valor)
      if (r.vendedor) inc(agg.vendedores, r.vendedor, caixas, valor)
    })
    return agg
  }, [filtered])

  const stats = useMemo(() => {
    const totalRegistros = filtered.length
    const totalCaixas = filtered.reduce((s, r) => s + Number(r.qtd_caixas || 0), 0)
    const revisados = filtered.filter(r => r.status_revisado).length
    return { totalRegistros, totalCaixas, revisados }
  }, [filtered])

  const valorTotalGeral = useMemo(() => filtered.reduce((sum, r) => sum + Number(r.total || 0), 0) * 2, [filtered])

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

  const clearFilters = () => {
    setCliente(''); setPromotor(''); setFretista(''); setRede(''); setUF(''); setVendedor(''); setStatus('all'); setFrom(''); setTo(''); setPeriodo(''); setSelectedMonth(''); setQ('')
  }

  const setDateRange = (range) => {
    const today = new Date()
    let start, end
    if (range === 'semana') {
      const day = today.getDay()
      start = new Date(today); start.setDate(today.getDate() - day + (day === 0 ? -6 : 1))
      end = new Date(start); end.setDate(start.getDate() + 6)
    } else if (range === 'mes') {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    } else if (range === 'ano') {
      start = new Date(today.getFullYear(), 0, 1)
      end = new Date(today.getFullYear(), 11, 31)
    } else if (range === 'mes_anterior') {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      start = prev
      end = new Date(prev.getFullYear(), prev.getMonth() + 1, 0)
    } else if (range === 'trimestre') {
      const m = today.getMonth()
      const startMonth = m - (m % 3)
      start = new Date(today.getFullYear(), startMonth, 1)
      end = new Date(today.getFullYear(), startMonth + 3, 0)
    } else if (range === 'semestre') {
      const m = today.getMonth()
      const startMonth = m < 6 ? 0 : 6
      start = new Date(today.getFullYear(), startMonth, 1)
      end = new Date(today.getFullYear(), startMonth + 6, 0)
    }
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
  }

  const uniqueMonths = useMemo(() => {
    const months = new Set()
    registros.forEach(r => { if (r.data) { const d = new Date(r.data + 'T00:00:00'); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; months.add(k) } })
    return Array.from(months).sort().reverse()
  }, [registros])

  const handleMonthSelect = (value) => {
    setSelectedMonth(value)
    if (!value || value === 'all') { setFrom(''); setTo('') } else {
      const [y,m] = value.split('-').map(Number)
      const start = new Date(y, m-1, 1)
      const end = new Date(y, m, 0)
      setFrom(start.toISOString().slice(0,10))
      setTo(end.toISOString().slice(0,10))
    }
  }

  const handleDownloadCSV = () => {
    if (!filtered.length) { window.alert('Nenhum registro para exportar.'); return }
    const headers = ['ID','Data','Cliente','Promotor','Fretista','Rede','UF','Vendedor','Qtd Caixas','Total','Status Revisado']
    const rows = filtered.map(r => [r.id, r.data, r.cliente, r.promotor, r.fretista, r.rede||'', r.uf||'', r.vendedor||'', r.qtd_caixas, r.total, r.status_revisado ? 'Sim' : 'Não'])
    const csv = [headers.join(','), ...rows.map(row => row.map(f => `"${String(f??'').replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    let filename = 'registros'
    if (cliente) filename += `_${cliente.replace(/\s/g,'_')}`
    if (promotor) filename += `_${promotor.replace(/\s/g,'_')}`
    if (fretista) filename += `_${fretista.replace(/\s/g,'_')}`
    if (rede) filename += `_rede_${rede.replace(/\s/g,'_')}`
    if (uf) filename += `_uf_${uf}`
    if (vendedor) filename += `_vendedor_${vendedor.replace(/\s/g,'_')}`
    if (from && to) filename += `_${from.replace(/-/g,'')}_${to.replace(/-/g,'')}`
    a.href = url
    a.download = `${filename}_${new Date().toISOString().slice(0,19).replace(/[:T-]/g,'')}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const lineData = useMemo(() => {
    const byDay = {}
    filtered.forEach(r => { byDay[r.data] = (byDay[r.data] || 0) + Number(r.qtd_caixas || 0) })
    return Object.entries(byDay).sort(([a],[b]) => a.localeCompare(b)).map(([date, qtd]) => ({ date, qtd }))
  }, [filtered])

  const monthlyData = useMemo(() => {
    const mk = (s) => {
      const d = new Date(s + 'T00:00:00')
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      return `${y}-${m}`
    }
    const prevKey = (key) => {
      const [y, m] = key.split('-').map(Number)
      const d = new Date(y, m - 1, 1)
      const p = new Date(d.getFullYear(), d.getMonth() - 1, 1)
      const py = p.getFullYear()
      const pm = String(p.getMonth() + 1).padStart(2, '0')
      return `${py}-${pm}`
    }
    const byMonth = {}
    filtered.forEach(r => {
      const k = mk(r.data)
      byMonth[k] = (byMonth[k] || 0) + (Number(r.total || 0) * 2)
    })
    const keys = Object.keys(byMonth).sort()
    return keys.map(k => ({ name: k, valor: byMonth[k], valorAnterior: byMonth[prevKey(k)] || 0 }))
  }, [filtered])

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto grid gap-6">
        <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
              <Filter className="w-5 h-5 text-green-600" />Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input 
                placeholder="Buscar" 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
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
              <Select value={status} onValueChange={setStatus} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="revisado">Revisado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </Select>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  value={from} 
                  onChange={e=>{setFrom(e.target.value); setSelectedMonth('')}} 
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
                />
                <Input 
                  type="date" 
                  value={to} 
                  onChange={e=>{setTo(e.target.value); setSelectedMonth('')}} 
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
                />
              </div>
              <Select value={selectedMonth} onValueChange={handleMonthSelect} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                <SelectItem value="all">Todos os meses</SelectItem>
                {uniqueMonths.map(m=> <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('semana'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Esta Semana
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('mes'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Este Mês
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('mes_anterior'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Mês Anterior
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('trimestre'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Trimestre
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('semestre'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Semestre
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => { setDateRange('ano'); setSelectedMonth('') }}
                className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
              >
                Este Ano
              </Button>
              <div className="ml-auto flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
                >
                  Limpar Filtros
                </Button>
                <Button 
                  onClick={handleDownloadCSV} 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />Download CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>VALOR TOTAL GERAL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-3 text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
              <span>R$ {valorTotalGeral.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

      <SummaryCards resumos={resumos} stats={stats} />

        <MonthlyChart data={monthlyData} />

        <Card className={`${isDarkMode ? 'bg-gray-800' : ''}`}>
          <CardHeader><CardTitle>Evolução Temporal (Quantidade)</CardTitle></CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="qtd" stroke="#10b981" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <MediaPorRedeChart data={filtered} />

        <TopRankings resumos={resumos} />
      </div>
    </div>
  )
}
