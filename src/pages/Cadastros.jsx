import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTheme } from '@/components/shared/ThemeContext'
import { supabase } from '@/lib/supabaseClient'
import { initConstantsFromPrompt } from '@/components/shared/constants'

export default function Cadastros() {
  const { isDarkMode } = useTheme()

  const [clienteForm, setClienteForm] = useState({ cliente: '', rede: '', uf: '', vendedor: '' })
  const [fretistaNome, setFretistaNome] = useState('')
  const [fretistaPlaca, setFretistaPlaca] = useState('')
  const [promotorNome, setPromotorNome] = useState('')

  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const resetFeedback = () => { setSuccessMsg(''); setErrorMsg('') }

  const salvarCliente = async () => {
    resetFeedback()
    try {
      if (!clienteForm.cliente || !clienteForm.rede || !clienteForm.uf || !clienteForm.vendedor) {
        throw new Error('Preencha cliente, rede, uf e vendedor')
      }
      const { error } = await supabase.from('clientes').insert({
        cliente: clienteForm.cliente,
        rede: clienteForm.rede,
        uf: clienteForm.uf,
        vendedor: clienteForm.vendedor
      })
      if (error) throw error
      setSuccessMsg('Cliente cadastrado com sucesso')
      setClienteForm({ cliente: '', rede: '', uf: '', vendedor: '' })
      await initConstantsFromPrompt()
    } catch (e) {
      setErrorMsg(e?.message || 'Erro ao cadastrar cliente')
    }
  }

  const salvarFretista = async () => {
    resetFeedback()
    try {
      if (!fretistaNome) throw new Error('Preencha o nome do fretista')
      if (!fretistaPlaca) throw new Error('Preencha a placa do fretista')
      const { error } = await supabase.from('fretistas').insert({ nome: fretistaNome, placa: fretistaPlaca })
      if (error) throw error
      setSuccessMsg('Fretista cadastrado com sucesso')
      setFretistaNome('')
      setFretistaPlaca('')
      await initConstantsFromPrompt()
    } catch (e) {
      setErrorMsg(e?.message || 'Erro ao cadastrar fretista')
    }
  }

  const salvarPromotor = async () => {
    resetFeedback()
    try {
      if (!promotorNome) throw new Error('Preencha o nome do promotor')
      const { error } = await supabase.from('promotores').insert({ nome: promotorNome })
      if (error) throw error
      setSuccessMsg('Promotor cadastrado com sucesso')
      setPromotorNome('')
      await initConstantsFromPrompt()
    } catch (e) {
      setErrorMsg(e?.message || 'Erro ao cadastrar promotor')
    }
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-xl`}>
          <CardHeader>
            <CardTitle>Cadastro de Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Cliente</Label>
              <Input value={clienteForm.cliente} onChange={e => setClienteForm(v => ({ ...v, cliente: e.target.value }))} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>Rede</Label>
                <Input value={clienteForm.rede} onChange={e => setClienteForm(v => ({ ...v, rede: e.target.value }))} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>UF</Label>
                <Input value={clienteForm.uf} onChange={e => setClienteForm(v => ({ ...v, uf: e.target.value }))} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : ''}>Vendedor</Label>
                <Input value={clienteForm.vendedor} onChange={e => setClienteForm(v => ({ ...v, vendedor: e.target.value }))} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
              </div>
            </div>
            <Button onClick={salvarCliente} className="w-full bg-green-600 hover:bg-green-700 text-white">Salvar Cliente</Button>
          </CardContent>
        </Card>

        <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-xl`}>
        <CardHeader>
          <CardTitle>Cadastro de Fretista</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className={isDarkMode ? 'text-white' : ''}>Nome</Label>
            <Input value={fretistaNome} onChange={e => setFretistaNome(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
          </div>
          <div>
            <Label className={isDarkMode ? 'text-white' : ''}>Placa</Label>
            <Input value={fretistaPlaca} onChange={e => setFretistaPlaca(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
          </div>
          <Button onClick={salvarFretista} className="w-full bg-green-600 hover:bg-green-700 text-white">Salvar Fretista</Button>
        </CardContent>
      </Card>

        <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-xl`}>
          <CardHeader>
            <CardTitle>Cadastro de Promotor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={isDarkMode ? 'text-white' : ''}>Nome</Label>
              <Input value={promotorNome} onChange={e => setPromotorNome(e.target.value)} className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''} />
            </div>
            <Button onClick={salvarPromotor} className="w-full bg-green-600 hover:bg-green-700 text-white">Salvar Promotor</Button>
          </CardContent>
        </Card>

        {successMsg && (
          <Alert className={`mt-2 ${isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={isDarkMode ? 'text-green-300' : 'text-green-800'}>{successMsg}</AlertDescription>
          </Alert>
        )}
        {errorMsg && (
          <Alert className="mt-2 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{errorMsg}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
