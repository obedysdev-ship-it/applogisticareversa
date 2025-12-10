import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function MonthlyChart({ data }) {
  if (!data || data.length === 0) return null

  const formatCurrency = (value) => `R$ ${value.toFixed(2)}`

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Evolução do Valor Total Mensal (com Histórico)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 30, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
              <Tooltip formatter={(value, name) => [formatCurrency(value), name]} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }} labelStyle={{ fontWeight: 'bold' }} />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={3} name="Valor Atual" dot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }}>
                <LabelList dataKey="valor" position="top" offset={10} formatter={(value) => `R$ ${value.toFixed(0)}`} style={{ fill: '#14532d', fontWeight: 'bold' }} />
              </Line>
              <Line type="monotone" dataKey="valorAnterior" stroke="#60a5fa" strokeWidth={2} name="Valor Anterior" strokeDasharray="3 3" dot={{ r: 4, fill: '#60a5fa', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

