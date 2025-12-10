import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectItem } from '@/components/ui/select'
import { Registro } from '@/entities/Registro'
import { useConstants } from '@/components/shared/constants'
import { useTheme } from '@/components/shared/ThemeContext'

export default function EditRegistroModal({ registro, onClose, onSaved }) {
  const { isDarkMode } = useTheme()
  const { CLIENTES = [], PROMOTORES = [], FRETISTAS = [] } = useConstants()
  const [form, setForm] = useState({ ...registro })
  const [saving, setSaving] = useState(false)
  const [clienteManual, setClienteManual] = useState(CLIENTES.includes(registro.cliente) ? '' : (registro.cliente || ''))
  const [promotorManual, setPromotorManual] = useState(PROMOTORES.includes(registro.promotor) ? '' : (registro.promotor || ''))
  const [fretistaManual, setFretistaManual] = useState(FRETISTAS.includes(registro.fretista) ? '' : (registro.fretista || ''))

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const finalCliente = form.cliente === 'Outro (Digitar Manual)' ? clienteManual : form.cliente
    const finalPromotor = form.promotor === 'Outro (Digitar Manual)' ? promotorManual : form.promotor
    const finalFretista = form.fretista === 'Outro (Digitar Manual)' ? fretistaManual : form.fretista

    const historico = Array.isArray(registro.historico) ? registro.historico.slice() : []
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const stamp = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} às ${pad(now.getHours())}:${pad(now.getMinutes())}`
    historico.push(`Editado em ${stamp}`)

    const payload = {
      ...form,
      cliente: finalCliente,
      promotor: finalPromotor,
      fretista: finalFretista,
      qtd_caixas: Number(form.qtd_caixas || 0),
      total: Number(form.qtd_caixas || 0) * 0.50,
      historico
    }
    await Registro.update(registro.id, payload)
    setSaving(false)
    onSaved && onSaved()
    onClose && onClose()
  }
  return (
    <Dialog>
      <DialogContent className="max-w-3xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : ''}>Editar Registro</DialogTitle>
        </DialogHeader>
        <div className={`grid gap-3 ${isDarkMode ? 'text-white' : ''}`}>
          <div>
            <Label className={isDarkMode ? 'text-white' : ''}>Data</Label>
            <Input 
              type="date" 
              value={form.data} 
              onChange={e => update('data', e.target.value)} 
              className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Cliente</Label>
              <Select 
                value={form.cliente} 
                onValueChange={(v)=>{ update('cliente', v); if (v !== 'Outro (Digitar Manual)') setClienteManual('') }}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
              >
                <SelectItem value="">Selecione</SelectItem>
                {CLIENTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
              </Select>
              {form.cliente === 'Outro (Digitar Manual)' && (
                <Input 
                  className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`} 
                  placeholder="Digite o cliente" 
                  value={clienteManual} 
                  onChange={e=>setClienteManual(e.target.value)} 
                />
              )}
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Promotor</Label>
              <Select 
                value={form.promotor} 
                onValueChange={(v)=>{ update('promotor', v); if (v !== 'Outro (Digitar Manual)') setPromotorManual('') }}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
              >
                <SelectItem value="">Selecione</SelectItem>
                {PROMOTORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
              </Select>
              {form.promotor === 'Outro (Digitar Manual)' && (
                <Input 
                  className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`} 
                  placeholder="Digite o promotor" 
                  value={promotorManual} 
                  onChange={e=>setPromotorManual(e.target.value)} 
                />
              )}
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Fretista</Label>
              <Select 
                value={form.fretista} 
                onValueChange={(v)=>{ update('fretista', v); if (v !== 'Outro (Digitar Manual)') setFretistaManual('') }}
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}
              >
                <SelectItem value="">Selecione</SelectItem>
                {FRETISTAS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
              </Select>
              {form.fretista === 'Outro (Digitar Manual)' && (
                <Input 
                  className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`} 
                  placeholder="Digite o fretista" 
                  value={fretistaManual} 
                  onChange={e=>setFretistaManual(e.target.value)} 
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Rede</Label>
              <Input 
                value={form.rede || ''} 
                onChange={e => update('rede', e.target.value)} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>UF</Label>
              <Input 
                value={form.uf || ''} 
                onChange={e => update('uf', e.target.value)} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
            </div>
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Vendedor</Label>
              <Input 
                value={form.vendedor || ''} 
                onChange={e => update('vendedor', e.target.value)} 
                className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
              />
            </div>
          </div>
          <div>
            <Label className={isDarkMode ? 'text-white' : ''}>Qtd Caixas</Label>
            <Input 
              type="number" 
              min="0" 
              step="1" 
              value={form.qtd_caixas} 
              onChange={e => { const q = Number(e.target.value || 0); update('qtd_caixas', q); update('total', q * 0.50) }} 
              className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} 
            />
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex justify-between items-center">
              <Label className={`font-semibold ${isDarkMode ? 'text-green-300' : ''}`}>Valor Total</Label>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                R$ {(Number(form.qtd_caixas || 0) * 0.50).toFixed(2)}
              </div>
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
              {Number(form.qtd_caixas || 0)} caixas × R$ 0,50
            </p>
          </div>
          <div className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
            <Switch checked={!!form.status_revisado} onChange={v => update('status_revisado', v)} />
            <span className={isDarkMode ? 'text-white' : ''}>Revisado</span>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose} className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Fechar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
