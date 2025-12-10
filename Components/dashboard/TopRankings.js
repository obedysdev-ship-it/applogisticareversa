
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Package, DollarSign, Medal, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TopRankings({ resumos }) {
  const { clientes, promotores, fretistas } = resumos;

  const topClientesCaixas = Object.entries(clientes)
    .sort(([,a], [,b]) => b.caixas - a.caixas)
    .slice(0, 10);

  const topPromotoresTotal = Object.entries(promotores)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10);

  const topFretistasTotal = Object.entries(fretistas)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
  };

  const getBadgeColor = (index) => {
    if (index === 0) return "bg-yellow-400 text-yellow-900 font-bold";
    if (index === 1) return "bg-gray-300 text-gray-800 font-bold";
    if (index === 2) return "bg-amber-500 text-white font-bold";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Clientes por Caixas */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardTitle className="flex items-center gap-3">
            <Package className="w-6 h-6 text-emerald-600" />
            Top 10 Clientes (Caixas)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {topClientesCaixas.length > 0 ? (
            <div className="space-y-4">
              {topClientesCaixas.map(([nome, dados], index) => (
                <div key={nome} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div>
                      <p className="font-semibold text-gray-900">{nome}</p>
                      <p className="text-sm text-gray-500">R$ {dados.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge className={getBadgeColor(index)}>
                    {dados.caixas} caixas
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg font-medium py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      {/* Top Promotores por Total */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            Top 10 Promotores (Total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {topPromotoresTotal.length > 0 ? (
            <div className="space-y-4">
              {topPromotoresTotal.map(([nome, dados], index) => (
                <div key={nome} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div>
                      <p className="font-semibold text-gray-900">{nome}</p>
                      <p className="text-sm text-gray-500">{dados.caixas} caixas</p>
                    </div>
                  </div>
                  <Badge className={getBadgeColor(index)}>
                    R$ {dados.total.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg font-medium py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      {/* Top Fretistas por Total */}
      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-teal-100">
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-teal-600" />
            Top 10 Fretistas (Total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {topFretistasTotal.length > 0 ? (
            <div className="space-y-4">
              {topFretistasTotal.map(([nome, dados], index) => (
                <div key={nome} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <div>
                      <p className="font-semibold text-gray-900">{nome}</p>
                      <p className="text-sm text-gray-500">{dados.caixas} caixas</p>
                    </div>
                  </div>
                  <Badge className={getBadgeColor(index)}>
                    R$ {dados.total.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg font-medium py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
