import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MapPin } from 'lucide-react'

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#0d9488', '#0f766e']

export default function UFPieChart({ data }) {
  const chartData = useMemo(() => {
    const ufCount = {}
    data.forEach(r => { if (r.uf) { ufCount[r.uf] = (ufCount[r.uf]||0) + Number(r.qtd_caixas||0) } })
    return Object.entries(ufCount).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value)
  }, [data])
  if (chartData.length === 0) return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-emerald-600" />
          Quantidade de Caixas por UF
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
          <MapPin className="w-6 h-6 text-emerald-600" />
          Quantidade de Caixas por UF
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={120} fill="#8884d8" dataKey="value">
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
