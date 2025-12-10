import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, BarChart3, CheckSquare } from 'lucide-react'

export default function SummaryCards({ stats }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex items-center gap-2"><Package className="w-5 h-5 text-green-600" /><CardTitle>Total de Registros</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">{stats.totalRegistros}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-600" /><CardTitle>Total Caixas</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">{stats.totalCaixas}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-600" /><CardTitle>Registros Revisados</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">{stats.revisados}</div></CardContent>
      </Card>
    </div>
  )
}
