import React, { useEffect, useState } from 'react'
import { Registro } from '@/entities/Registro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { formatDateBR } from '@/utils'
import { Select, SelectItem } from '@/components/ui/select'
import { useConstants } from '@/components/shared/constants'
import { CheckCircle, AlertCircle, Network, MapPin, UserSquare, Plus, Save } from 'lucide-react'
import { useTheme } from '@/components/shared/ThemeContext'

export default function Registros() {
  const { isDarkMode } = useTheme()
  const constants = useConstants()
  const { CLIENTES = [], PROMOTORES = [], FRETISTAS = [], CLIENTES_DATA = [], CLIENTE_PROMOTOR_MAP = {} } = constants
  
  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    cliente: '',
    promotor: '',
    fretista: '',
    qtd_caixas: '',
    total: 0,
    status_revisado: false,
    rede: '',
    uf: '',
    vendedor: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [clienteManual, setClienteManual] = useState('')
  const [promotorManual, setPromotorManual] = useState('')
  const [fretistaManual, setFretistaManual] = useState('')

  const clientesOptions = Array.isArray(CLIENTES) ? CLIENTES : []
  const promotoresOptions = Array.isArray(PROMOTORES) ? PROMOTORES : []
  const fretistasOptions = Array.isArray(FRETISTAS) ? FRETISTAS : []
  
  // Debug: verificar se os dados estão sendo carregados
  useEffect(() => {
    console.log('📊 Estado atual no componente Registros:', {
      CLIENTES_length: CLIENTES?.length || 0,
      PROMOTORES_length: PROMOTORES?.length || 0,
      FRETISTAS_length: FRETISTAS?.length || 0,
      clientesOptions_length: clientesOptions.length,
      promotoresOptions_length: promotoresOptions.length,
      fretistasOptions_length: fretistasOptions.length,
      primeiroCliente: clientesOptions[0],
      primeiroPromotor: promotoresOptions[0],
      primeiroFretista: fretistasOptions[0],
      CLIENTES_isArray: Array.isArray(CLIENTES),
      PROMOTORES_isArray: Array.isArray(PROMOTORES),
      FRETISTAS_isArray: Array.isArray(FRETISTAS),
      constants: constants
    })
  }, [CLIENTES, PROMOTORES, FRETISTAS, constants])

  useEffect(() => {
    const found = CLIENTES_DATA.find(c => c.nome_fantasia === formData.cliente)
    if (found) {
      setFormData(prev => ({ ...prev, rede: found.rede || '', uf: found.uf || '', vendedor: found.vendedor || '' }))
      const pmap = CLIENTE_PROMOTOR_MAP[found.nome_fantasia]
      if (pmap && Array.isArray(pmap) && pmap.length === 1) {
        setFormData(prev => ({ ...prev, promotor: pmap[0] }))
      }
    }
  }, [formData.cliente])

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      // total sempre recalculado a partir de qtd_caixas
      next.total = Number(next.qtd_caixas || 0) * 0.5
      // limpar rede/uf/vendedor e promotor quando cliente for manual
      if (field === 'cliente') {
        if (value === 'Outro (Digitar Manual)') {
          next.rede = ''
          next.uf = ''
          next.vendedor = ''
          next.promotor = ''
        }
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const finalCliente = formData.cliente === 'Outro (Digitar Manual)' ? clienteManual : formData.cliente
      const finalPromotor = formData.promotor === 'Outro (Digitar Manual)' ? promotorManual : formData.promotor
      const finalFretista = formData.fretista === 'Outro (Digitar Manual)' ? fretistaManual : formData.fretista
      if (!finalCliente) throw new Error('O campo Cliente deve ser preenchido.')
      if (!finalPromotor) {
        const pmap = CLIENTE_PROMOTOR_MAP[finalCliente]
        if (!(pmap && pmap.length === 1)) throw new Error('O campo Promotor deve ser preenchido.')
      }
      if (!finalFretista) throw new Error('O campo Fretista deve ser preenchido.')

      const qtd = Number(formData.qtd_caixas || 0)
      if (!qtd || qtd <= 0) throw new Error('Quantidade de caixas deve ser maior que zero.')

      const promotoresDoCliente = CLIENTE_PROMOTOR_MAP[finalCliente] || []
      if (promotoresDoCliente.length === 2 && qtd % 2 !== 0) {
        throw new Error('A quantidade de caixas deve ser um número par para clientes com dois promotores.')
      }

      const payload = {
        ...formData,
        cliente: finalCliente,
        promotor: finalPromotor,
        fretista: finalFretista,
        qtd_caixas: qtd,
        total: qtd * 0.5
      }
      const res = await Registro.create(payload)
      const createdCount = Array.isArray(res) ? res.length : 1
      setSuccess(`Registro${createdCount>1?'s':''} salvo${createdCount>1?'s':''} com sucesso`)
      setFormData(prev => ({ ...prev, cliente: '', promotor: '', fretista: '', qtd_caixas: '', rede: '', uf: '', vendedor: '' }))
    } catch {
      setError('Erro ao salvar registro')
    }
    setLoading(false)
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
      <Card className={`shadow-xl border-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-3 ${isDarkMode ? 'text-white' : ''}`}>
            <Plus className="w-6 h-6" />Novo Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Data</Label>
              <Input type="date" value={formData.data} onChange={e => handleChange('data', e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Cliente</Label>
              <Select value={formData.cliente || ''} onValueChange={(v) => handleChange('cliente', v)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                <SelectItem value="">{clientesOptions.length > 0 ? 'Selecione um cliente' : 'Carregando...'}</SelectItem>
                {clientesOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </Select>
              <div className={`overflow-hidden transition-all duration-300 ${formData.cliente === 'Outro (Digitar Manual)' ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <Input placeholder="Cliente" value={clienteManual} onChange={e => setClienteManual(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>Promotor</Label>
                <Select value={formData.promotor || ''} onValueChange={(v) => handleChange('promotor', v)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                  <SelectItem value="">{promotoresOptions.length > 0 ? 'Selecione um promotor' : 'Carregando...'}</SelectItem>
                  {promotoresOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </Select>
                <div className={`overflow-hidden transition-all duration-300 ${formData.promotor === 'Outro (Digitar Manual)' ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <Input placeholder="Promotor" value={promotorManual} onChange={e => setPromotorManual(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
                </div>
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>Fretista</Label>
                <Select value={formData.fretista || ''} onValueChange={(v) => handleChange('fretista', v)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}>
                  <SelectItem value="">{fretistasOptions.length > 0 ? 'Selecione um fretista' : 'Carregando...'}</SelectItem>
                  {fretistasOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </Select>
                <div className={`overflow-hidden transition-all duration-300 ${formData.fretista === 'Outro (Digitar Manual)' ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <Input placeholder="Fretista" value={fretistaManual} onChange={e => setFretistaManual(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
                </div>
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>Qtd Caixas</Label>
                <Input type="number" value={formData.qtd_caixas} onChange={e => handleChange('qtd_caixas', e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}>
              <div>
                <Label className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><Network className="w-4 h-4"/>Rede</Label>
                <Input value={formData.rede} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`} />
              </div>
              <div>
                <Label className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><MapPin className="w-4 h-4"/>UF</Label>
                <Input value={formData.uf} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`} />
              </div>
              <div>
                <Label className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><UserSquare className="w-4 h-4"/>Vendedor</Label>
                <Input value={formData.vendedor} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`} />
              </div>
            </div>
            {/* Cálculo em tempo real */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <Label className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  Valor Total (Calculado Automaticamente)
                </Label>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  R$ {formData.total.toFixed(2)}
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                Cálculo: {formData.qtd_caixas || 0} caixas × R$ 0,50 = R$ {formData.total.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.status_revisado} onChange={v => handleChange('status_revisado', v)} />
              <span className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>Revisado</span>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-1">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Salvar Registro
                </div>
              )}
            </Button>
          </form>
          {success && (
            <Alert className={`mt-4 ${isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className={`${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
