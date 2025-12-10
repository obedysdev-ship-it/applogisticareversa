
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

export default function RedeColumnChart({ data }) {
  const chartData = useMemo(() => {
    const redeCount = {};
    
    data.forEach(registro => {
      if (registro.rede) {
        if (!redeCount[registro.rede]) {
          redeCount[registro.rede] = 0;
        }
        redeCount[registro.rede] += registro.qtd_caixas;
      }
    });

    return Object.entries(redeCount)
      .map(([rede, caixas]) => ({ name: rede, caixas }))
      .sort((a, b) => b.caixas - a.caixas);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Network className="w-6 h-6 text-green-600" />
            Quantidade de Caixas por Rede
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-gray-500">
            Nenhum dado disponível para exibir o gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Network className="w-6 h-6 text-green-600" />
          Quantidade de Caixas por Rede
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} caixas`, 'Quantidade']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Bar 
                dataKey="caixas" 
                name="Quantidade de Caixas"
                fill="#16a34a" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
