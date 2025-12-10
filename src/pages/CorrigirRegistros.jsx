import React, { useEffect, useState } from 'react'
import { Registro } from '@/entities/Registro'
import { CLIENTES_DATA } from '@/components/shared/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTheme } from '@/components/shared/ThemeContext'

export default function CorrigirRegistros() {
  const { isDarkMode } = useTheme()
  const [registros, setRegistros] = useState([])
  const [pendentes, setPendentes] = useState([])
  const [corrigindo, setCorrigindo] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { (async () => { const data = await Registro.list('-data'); setRegistros(data) })() }, [])
  useEffect(() => {
    const p = registros.filter(r => !r.rede || !r.uf || !r.vendedor)
    setPendentes(p)
  }, [registros])

  const corrigir = async () => {
    setCorrigindo(true)
    let done = 0
    for (const r of pendentes) {
      const found = CLIENTES_DATA.find(c => c.nome_fantasia === r.cliente)
      if (found) {
        await Registro.update(r.id, { rede: found.rede || r.rede, uf: found.uf || r.uf, vendedor: found.vendedor || r.vendedor })
      }
      done++
      setProgress(Math.round(done / pendentes.length * 100))
    }
    const data = await Registro.list('-data'); setRegistros(data)
    setCorrigindo(false)
    setProgress(0)
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
      <Card className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-0`}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : ''}>Correção de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`mb-3 ${isDarkMode ? 'text-white' : ''}`}>Registros com campos ausentes: {pendentes.length}</p>
          {corrigindo && <Progress value={progress} />}
          <div className="mt-4">
            <Button 
              onClick={corrigir} 
              disabled={corrigindo || pendentes.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {corrigindo ? 'Corrigindo...' : `Corrigir ${pendentes.length}`}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
