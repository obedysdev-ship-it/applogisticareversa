import React, { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'
import { subDays, parseISO, isAfter, isBefore } from 'date-fns'

export default function MediaPorRedeChart({ data }) {
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const chartData = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, selectedPeriod)
    const filteredData = data.filter(registro => {
      const recordDate = parseISO(registro.data + 'T00:00:00')
      return isAfter(recordDate, startDate) && isBefore(recordDate, today)
    })
    const redeData = {}
    filteredData.forEach(registro => {
      if (registro.rede) {
        if (!redeData[registro.rede]) redeData[registro.rede] = []
        redeData[registro.rede].push(Number(registro.qtd_caixas || 0))
      }
    })
    return Object.entries(redeData)
      .map(([rede, caixasArray]) => ({ name: rede, media: Number((caixasArray.reduce((sum, val) => sum + val, 0) / caixasArray.length).toFixed(2)), total: caixasArray.reduce((sum, val) => sum + val, 0), registros: caixasArray.length }))
      .sort((a, b) => b.media - a.media)
  }, [data, selectedPeriod])

  const periodButtons = [
    { days: 7, label: '7 dias' },
    { days: 15, label: '15 dias' },
    { days: 30, label: '30 dias' },
    { days: 90, label: '90 dias' },
    { days: 180, label: '180 dias' },
    { days: 360, label: '360 dias' }
  ]

  if (chartData.length === 0) return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Média de Caixas por Rede
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {periodButtons.map(({ days, label }) => (
              <Button key={days} size="sm" variant={selectedPeriod === days ? 'default' : 'ghost'} onClick={() => setSelectedPeriod(days)} className={selectedPeriod === days ? 'bg-orange-600 hover:bg-orange-700' : ''}>{label}</Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-gray-500">Nenhum dado disponível para o período selecionado</div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Média de Caixas por Rede ({selectedPeriod} dias)
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {periodButtons.map(({ days, label }) => (
              <Button key={days} size="sm" variant={selectedPeriod === days ? 'default' : 'ghost'} onClick={() => setSelectedPeriod(days)} className={selectedPeriod === days ? 'bg-orange-600 hover:bg-orange-700' : ''}>{label}</Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis label={{ value: 'Média de Caixas', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} caixas/registro`, 'Média']} labelFormatter={(label) => `Rede: ${label}`} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
              <Legend />
              <Line type="monotone" dataKey="media" stroke="#ea580c" strokeWidth={3} name="Média de Caixas" dot={{ r: 6, fill: '#ea580c' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

