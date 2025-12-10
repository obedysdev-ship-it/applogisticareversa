
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function DailyEvolutionChart({ data }) {
  if (!data || data.length === 0) {
    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-green-600" />
                    Evolução Diária (Caixas)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-gray-500">
                    Nenhum dado no período selecionado para exibir o gráfico.
                </div>
            </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-green-600" />
          Evolução Diária (Caixas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="caixas" 
                name="Quantidade de Caixas"
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#16a34a' }}
                activeDot={{ r: 8, stroke: '#16a34a', fill: '#dcfce7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
