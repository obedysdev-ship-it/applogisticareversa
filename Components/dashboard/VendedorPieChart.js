
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSquare } from 'lucide-react';

const COLORS = ['#0d9488', '#2dd4bf', '#5eead4', '#99f6e4', '#10b981', '#34d399'];

export default function VendedorPieChart({ data }) {
  const chartData = useMemo(() => {
    const vendedorCount = {};
    
    data.forEach(registro => {
      if (registro.vendedor) {
        if (!vendedorCount[registro.vendedor]) {
          vendedorCount[registro.vendedor] = 0;
        }
        vendedorCount[registro.vendedor] += registro.qtd_caixas;
      }
    });

    return Object.entries(vendedorCount)
      .map(([vendedor, caixas]) => ({ name: vendedor, value: caixas }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserSquare className="w-6 h-6 text-teal-600" />
            Quantidade de Caixas por Vendedor
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${data.name}: ${data.value} caixas`}</p>
          <p className="text-sm text-gray-600">{`${((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <UserSquare className="w-6 h-6 text-teal-600" />
          Quantidade de Caixas por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value} (${entry.payload.value} caixas)`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
