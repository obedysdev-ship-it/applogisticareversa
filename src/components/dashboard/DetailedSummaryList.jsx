import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DetailedSummaryList({ title, data, icon: Icon, color }) {
  const colorClasses = {
    green: 'text-green-600',
    teal: 'text-teal-600',
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${colorClasses[color] || 'text-gray-600'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {data.length > 0 ? (
            <div className="space-y-3">
              {data.map(item => (
                <div key={item.name} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">R$ {item.total.toFixed(2)}</p>
                  </div>
                  <Badge className="ml-4 bg-green-100 text-green-800">{item.caixas} caixas</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-16">Nenhum dado para exibir</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

