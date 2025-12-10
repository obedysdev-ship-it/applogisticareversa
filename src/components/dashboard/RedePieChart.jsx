import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Network } from 'lucide-react'

const COLORS = ['#0d9488', '#2dd4bf', '#5eead4', '#99f6e4', '#10b981', '#34d399']

export default function RedePieChart({ data }) {
  const chartData = useMemo(() => {
    const redeCount = {}
    data.forEach(r => { if (r.rede) { redeCount[r.rede] = (redeCount[r.rede]||0) + Number(r.qtd_caixas||0) } })
    const arr = Object.entries(redeCount).map(([name, value]) => ({ name, value }))
    const total = arr.reduce((s, x) => s + x.value, 0) || 1
    return arr.map(x => ({ ...x, percent: ((x.value/total)*100).toFixed(1)+'%' })).sort((a,b)=>b.value-a.value)
  }, [data])
  if (chartData.length === 0) return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Network className="w-6 h-6 text-teal-600" />
          Quantidade de Caixas por Rede
        </CardTitle>
      </CardHeader>
      <CardContent><div className="text-center py-16 text-gray-500">Nenhum dado disponível para exibir o gráfico</div></CardContent>
    </Card>
  )
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0]
      const total = chartData.reduce((s, x) => s + x.value, 0) || 1
      const pct = ((d.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${d.name}: ${d.value} caixas`}</p>
          <p className="text-sm text-gray-600">{`${pct}%`}</p>
        </div>
      )
    }
    return null
  }
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Network className="w-6 h-6 text-teal-600" />
          Quantidade de Caixas por Rede
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} (${percent})`}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} formatter={(value, entry) => `${value} (${entry.payload.value} caixas)`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
