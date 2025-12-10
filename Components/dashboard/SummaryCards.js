
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Truck, Package, DollarSign } from "lucide-react";

export default function SummaryCards({ resumos }) {
  const { clientes, promotores, fretistas } = resumos;

  const totalPorCliente = Object.values(clientes).reduce((sum, c) => sum + c.total, 0);
  const totalPorPromotor = Object.values(promotores).reduce((sum, p) => sum + p.total, 0);
  const totalPorFretista = Object.values(fretistas).reduce((sum, f) => sum + f.total, 0);

  const caixasPorCliente = Object.values(clientes).reduce((sum, c) => sum + c.caixas, 0);
  const caixasPorPromotor = Object.values(promotores).reduce((sum, p) => sum + p.caixas, 0);
  const caixasPorFretista = Object.values(fretistas).reduce((sum, f) => sum + f.caixas, 0);

  const summaryData = [
    {
      category: "Clientes",
      icon: Users,
      color: "blue",
      total: totalPorCliente,
      caixas: caixasPorCliente,
      count: Object.keys(clientes).length
    },
    {
      category: "Promotores", 
      icon: UserCheck,
      color: "green",
      total: totalPorPromotor,
      caixas: caixasPorPromotor,
      count: Object.keys(promotores).length
    },
    {
      category: "Fretistas",
      icon: Truck,
      color: "purple", 
      total: totalPorFretista,
      caixas: caixasPorFretista,
      count: Object.keys(fretistas).length
    }
  ];

  const colorVariants = {
    blue: "border-l-blue-500 bg-blue-50",
    green: "border-l-green-500 bg-green-50",
    purple: "border-l-purple-500 bg-purple-50"
  };

  // New: Define color variants for icons within the summary boxes to match card themes
  const iconColorVariants = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {summaryData.map((item) => (
        <Card 
          key={item.category} 
          // UI Improvement: Add a subtle transition and hover effect for interactivity
          className={`shadow-lg border-0 border-l-4 ${colorVariants[item.color]} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              {/* Main heading icon remains neutral gray for readability */}
              <item.icon className="w-6 h-6 text-gray-700" /> 
              Resumo por {item.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Color Improvement: Apply category-specific color to DollarSign icon */}
                  <DollarSign className={`w-4 h-4 ${iconColorVariants[item.color]}`} />
                  <span className="text-sm font-medium text-gray-600">Soma Total</span>
                </div>
                <span className="font-bold text-gray-900">R$ {item.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Color Improvement: Apply category-specific color to Package icon */}
                  <Package className={`w-4 h-4 ${iconColorVariants[item.color]}`} />
                  <span className="text-sm font-medium text-gray-600">Total Caixas</span>
                </div>
                <span className="font-bold text-gray-900">{item.caixas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Color Improvement: Apply category-specific color to the count icon */}
                  <item.icon className={`w-4 h-4 ${iconColorVariants[item.color]}`} />
                  <span className="text-sm font-medium text-gray-600">Quantidade</span>
                </div>
                <span className="font-bold text-gray-900">{item.count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
