import React, { useEffect, useMemo, useState } from 'react'
import { Registro } from '@/entities/Registro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { useConstants } from '@/components/shared/constants'
import { Package, Landmark, Printer, FileSpreadsheet, MessageCircle, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeContext'
import { formatDateBR } from '@/utils'

export default function Resumo() {
  const { isDarkMode } = useTheme()
  const { CLIENTES = [], PROMOTORES = [], FRETISTAS = [] } = useConstants()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 200

  useEffect(() => { (async () => { const data = await Registro.list('-data'); setRegistros(data); setLoading(false) })() }, [])
  
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
    }).sort((a,b) => b.data.localeCompare(a.data)) // Mais recente primeiro
  }, [registros, cliente, promotor, fretista, rede, uf, vendedor, status, from, to, periodo, q])
  
  // Paginação
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRegistros = filtered.slice(startIndex, endIndex)
  
  useEffect(() => {
    setCurrentPage(1) // Reset para primeira página quando filtros mudarem
  }, [cliente, promotor, fretista, rede, uf, vendedor, status, from, to, periodo, q])

  const totais = useMemo(() => filtered.reduce((acc, r) => { acc.caixas += Number(r.qtd_caixas||0); acc.total += Number(r.total||0); return acc }, { caixas:0, total:0 }), [filtered])

  const exportarCSV = () => {
    const headers = ['data','cliente','promotor','fretista','rede','uf','vendedor','qtd_caixas','total']
    const rows = filtered.map(r => headers.map(h => r[h] ?? '').join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Resumo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportarXLSX = async () => {
    try {
      const { default: XLSX } = await import('xlsx-js-style')
      const headers = ['Data','Cliente','Promotor','Fretista','Rede','UF','Vendedor','Qtd Caixas','Total (R$)']
      const rows = filtered.map(r => [r.data, r.cliente, r.promotor, r.fretista, r.rede || '', r.uf || '', r.vendedor || '', Number(r.qtd_caixas||0), Number(r.total||0)])
      const aoa = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      // Estilos do cabeçalho
      headers.forEach((_, i) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i })
        const cell = ws[cellAddress] || {}
        cell.s = {
          fill: { fgColor: { rgb: '10B981' } },
          font: { bold: true, color: { rgb: 'FFFFFF' } }
        }
        ws[cellAddress] = cell
      })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Resumo')
      XLSX.writeFile(wb, 'Resumo.xlsx')
    } catch {}
  }

  const enviarWhatsApp = () => {
    const header = [
      '♻️ Resumo Logística Reversa ♻️',
      '============================'
    ]
    const periodoLine = `📆 Período: ${from || '-'} a ${to || '-'}`
    const linhas = filtered.map(r => `📌 ${r.data} • ${r.cliente} • ${r.promotor} • ${r.fretista} • ${Number(r.qtd_caixas||0)} • R$ ${(Number(r.total||0)).toFixed(2)}`)
    const footer = [
      '============================',
      `📦 Total Caixas: ${totais.caixas}`,
      `💲 Total R$: ${totais.total.toFixed(2)}`
    ]
    const txt = [...header, periodoLine, ...linhas, ...footer].join('\n')
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`
    window.open(url, '_blank')
  }

  const gerarNomeArquivo = () => {
    const hoje = new Date().toISOString().slice(0,10)
    let periodoLabel = ''
    if (periodo === 'mes_anterior') periodoLabel = 'mes_anterior'
    else if (periodo === 'trimestre') periodoLabel = 'trimestre'
    else if (periodo === 'semestre') periodoLabel = 'semestre'
    else periodoLabel = `${from||'-'}_a_${to||'-'}`
    return `Resumo_GDM_${periodoLabel}_${hoje}`
  }

  if (loading) {
    return (
      <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-7xl mx-auto ${isDarkMode ? 'text-white' : ''}`}>Carregando...</div>
      </div>
    )
  }

  const gerarPDF = () => {
    const nomeArquivo = gerarNomeArquivo()
    const totalCaixas = filtered.reduce((s,r)=> s + Number(r.qtd_caixas||0), 0)
    const totalValor = filtered.reduce((s,r)=> s + Number(r.total||0), 0)
    let promotorTotalSum = 0; let fretistaTotalSum = 0
    filtered.forEach(r => { if (r.promotor) promotorTotalSum += Number(r.total||0); if (r.fretista) fretistaTotalSum += Number(r.total||0) })
    const totalGeral = promotorTotalSum + fretistaTotalSum

    const by = (key) => {
      const o = {}
      filtered.forEach(r => { const k = r[key]; if (!k) return; o[k] = o[k] || { caixas:0, total:0 }; o[k].caixas += Number(r.qtd_caixas||0); o[k].total += Number(r.total||0) })
      return Object.entries(o).map(([name,data]) => ({ name, ...data })).sort((a,b)=> b.total - a.total)
    }
    const reportData = {
      filteredRegistros: filtered,
      totalCaixas,
      totalValor,
      totalGeral,
      nomeArquivo,
      resumoClientes: by('cliente'),
      resumoPromotores: by('promotor'),
      resumoFretistas: by('fretista'),
      resumoRedes: by('rede'),
      resumoUFs: by('uf'),
      resumoVendedores: by('vendedor'),
      filtros: {
        dataInicio: from || null,
        dataFim: to || null,
        promotor,
        fretista,
        cliente,
        rede: null,
        uf: null,
        vendedor: null
      }
    }
    sessionStorage.setItem('reportData', JSON.stringify(reportData))
    window.open('/ResumoPDF', '_blank')
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto grid gap-6">
        <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
              <Filter className="w-5 h-5 text-blue-600" />Filtros de Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Busca Dinâmica</label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input placeholder="Buscar por qualquer informação..." value={q} onChange={e => setQ(e.target.value)} className={`pl-10 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex gap-2">
                <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
                <Input type="date" value={to} onChange={e=>setTo(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
              <Select value={selectedMonth} onValueChange={(value)=>{ setSelectedMonth(value); if (!value || value === 'all') { setFrom(''); setTo('') } else { const [y,m] = value.split('-').map(Number); const start = new Date(y, m-1, 1); const end = new Date(y, m, 0); setFrom(start.toISOString().slice(0,10)); setTo(end.toISOString().slice(0,10)) } }} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                <SelectItem value="all">Todos os meses</SelectItem>
                {uniqueMonths.map(m=> <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </Select>
              <Select value={periodo} onValueChange={setPeriodo} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                <SelectItem value="">Período</SelectItem>
                <SelectItem value="mes_anterior">Mês anterior</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
              </Select>
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
                <SelectItem value="revisado">Revisados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className={`shadow-lg border-0 border-l-4 border-l-green-500 ${isDarkMode ? 'bg-gray-800 bg-green-900/20' : 'bg-green-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg"><Package className="w-6 h-6 text-white" /></div>
                <div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Total de Registros</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>{filtered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`shadow-lg border-0 border-l-4 border-l-emerald-500 ${isDarkMode ? 'bg-gray-800 bg-emerald-900/20' : 'bg-emerald-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 rounded-lg"><Package className="w-6 h-6 text-white" /></div>
                <div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Total de Caixas</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>{totais.caixas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`shadow-lg border-0 border-l-4 border-l-teal-500 ${isDarkMode ? 'bg-gray-800 bg-teal-900/20' : 'bg-teal-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-600 rounded-lg"><span className="text-white font-bold text-xl">R$</span></div>
                <div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Valor Total</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>R$ {totais.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`shadow-lg border-0 border-l-4 border-l-blue-500 ${isDarkMode ? 'bg-gray-800 bg-blue-900/20' : 'bg-blue-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg"><Landmark className="w-6 h-6 text-white" /></div>
                <div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>Total Geral</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>R$ {(filtered.reduce((s,r)=>s + Number(r.qtd_caixas||0) * 1.00,0)).toFixed(2)}</p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Fretista + Promotor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={gerarPDF} disabled={filtered.length===0} className="bg-red-600 hover:bg-red-700 text-white"><Printer className="w-4 h-4 mr-2" />Gerar PDF</Button>
          <Button onClick={exportarCSV} disabled={filtered.length===0} className="bg-emerald-600 hover:bg-emerald-700 text-white"><FileSpreadsheet className="w-4 h-4 mr-2" />Exportar CSV</Button>
          <Button onClick={exportarXLSX} disabled={filtered.length===0} className="bg-green-600 hover:bg-green-700 text-white"><FileSpreadsheet className="w-4 h-4 mr-2" />Relatório Xlsx</Button>
          <Button onClick={enviarWhatsApp} disabled={filtered.length===0} className="bg-green-500 hover:bg-green-600 text-white"><MessageCircle className="w-4 h-4 mr-2" />Enviar WhatsApp</Button>
        </div>

      

        <div className="grid gap-6">
          <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>
                Registros ({filtered.length} total{filtered.length !== 1 ? 's' : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={`w-full min-w-[800px] ${isDarkMode ? 'text-white' : ''}`}>
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : ''}`}>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Data</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Cliente</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Promotor</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Fretista</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Rede</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>UF</th>
                      <th className={`text-left p-2 ${isDarkMode ? 'text-white' : ''}`}>Vendedor</th>
                      <th className={`text-right p-2 ${isDarkMode ? 'text-white' : ''}`}>Caixas</th>
                      <th className={`text-right p-2 ${isDarkMode ? 'text-white' : ''}`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegistros.map(r => (
                      <tr key={r.id} className={`border-b ${isDarkMode ? 'border-gray-700' : ''}`}>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{formatDateBR(r.data)}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.cliente}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.promotor}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.fretista}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.rede || '-'}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.uf || '-'}</td>
                        <td className={`p-2 ${isDarkMode ? 'text-white' : ''}`}>{r.vendedor || '-'}</td>
                        <td className={`p-2 text-right ${isDarkMode ? 'text-white' : ''}`}>{Number(r.qtd_caixas||0)}</td>
                        <td className={`p-2 text-right ${isDarkMode ? 'text-white' : ''}`}>R$ {Number(r.total||0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginação */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : ''}`}>
                  <div className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filtered.length)} de {filtered.length} registros
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className={`px-3 ${isDarkMode ? 'text-white' : ''}`}>
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={isDarkMode ? 'text-white border-gray-600 hover:bg-gray-700' : ''}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
    </div>
  )
}
