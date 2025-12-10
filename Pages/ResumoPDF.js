import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ResumoPDF() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('reportData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setReportData(parsedData);
        if (parsedData.nomeArquivo) {
          document.title = parsedData.nomeArquivo;
        }
      } catch(e) {
        console.error("Failed to parse report data", e);
      }
    }
    setLoading(false);
  }, []);

  const handleSavePDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do relatório...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-xl">Não foi possível carregar os dados para o relatório.</p>
      </div>
    );
  }

  const { filteredRegistros, totalCaixas, totalValor, totalGeral, resumoClientes, resumoPromotores, resumoFretistas, resumoRedes, resumoUFs, resumoVendedores, filtros } = reportData;
  const totalGeralNovo = totalCaixas * 1; // Total de caixas × R$ 1,00

  return (
    <div className="bg-gray-200">
      <style>{`
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page { 
            size: A4; 
            margin: 1cm;
          }
          .screen-only {
            display: none !important;
          }
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
      
      <div className="screen-only sticky top-0 bg-white shadow-lg p-4 z-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pré-visualização do Relatório</h2>
          <p className="text-sm text-gray-600">Pronto para salvar como PDF.</p>
        </div>
        <Button onClick={handleSavePDF} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="w-5 h-5 mr-2" />
          Salvar como PDF
        </Button>
      </div>

      <div className="print-container max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl border border-gray-200">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/58237d489_logisticareversa.png" 
            alt="Logotipo GDM Logística Reversa" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatório de Logística Reversa</h1>
          <p className="text-gray-600">Gerado em: {format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
          {filtros.dataInicio && filtros.dataFim && (
            <p className="text-gray-600">Período: {filtros.dataInicio} a {filtros.dataFim}</p>
          )}
        </div>

        {/* ... (o resto do conteúdo do PDF permanece o mesmo) ... */}
        {/* Filtros Aplicados */}
        {(filtros.dataInicio || filtros.cliente || filtros.promotor || filtros.fretista || filtros.rede || filtros.uf || filtros.vendedor) && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
            <h3 className="font-semibold text-gray-900 mb-2">Filtros Aplicados</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {filtros.dataInicio && filtros.dataFim && <p>Período: {filtros.dataInicio} a {filtros.dataFim}</p>}
              {filtros.cliente && <p>Cliente: {filtros.cliente}</p>}
              {filtros.promotor && <p>Promotor: {filtros.promotor}</p>}
              {filtros.fretista && <p>Fretista: {filtros.fretista}</p>}
              {filtros.rede && <p>Rede: {filtros.rede}</p>}
              {filtros.uf && <p>UF: {filtros.uf}</p>}
              {filtros.vendedor && <p>Vendedor: {filtros.vendedor}</p>}
            </div>
          </div>
        )}

        {/* Resumo Executivo */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Resumo Executivo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">📊</span>
                <span className="font-medium text-green-800">Total de Registros</span>
              </div>
              <p className="text-3xl font-bold text-green-900">{filteredRegistros.length}</p>
            </div>

            <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">📦</span>
                <span className="font-medium text-blue-800">Total de Caixas</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">{totalCaixas}</p>
            </div>

            <div className="bg-emerald-100 p-4 rounded-lg border-l-4 border-emerald-500" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-600">💰</span>
                <span className="font-medium text-emerald-800">Valor Total</span>
              </div>
              <p className="text-3xl font-bold text-emerald-900">R$ {totalValor.toFixed(2)}</p>
            </div>

            <div className="bg-teal-100 p-4 rounded-lg border-l-4 border-teal-500" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-teal-600">💎</span>
                <span className="font-medium text-teal-800">Total Geral</span>
              </div>
              <p className="text-3xl font-bold text-teal-900">R$ {totalGeral.toFixed(2)}</p>
              <p className="text-xs text-teal-600">Total Caixas x R$ 1,00</p>
            </div>
          </div>
        </div>

        {/* Resumos */}
        <div className="space-y-8">
          {/* Resumo por Cliente */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">👥</span>
              Resumo por Cliente
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoClientes.map((cliente, index) => (
                    <tr key={cliente.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{cliente.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{cliente.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{cliente.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Promotor */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">🎯</span>
              Resumo por Promotor
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPromotores.map((promotor, index) => (
                    <tr key={promotor.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{promotor.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{promotor.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{promotor.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Fretista */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-purple-600">🚛</span>
              Resumo por Fretista
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoFretistas.map((fretista, index) => (
                    <tr key={fretista.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{fretista.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{fretista.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{fretista.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Rede */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-indigo-600">🏢</span>
              Resumo por Rede
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoRedes.map((rede, index) => (
                    <tr key={rede.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{rede.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{rede.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{rede.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por UF */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-600">📍</span>
              Resumo por UF
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoUFs.map((uf, index) => (
                    <tr key={uf.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{uf.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{uf.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{uf.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Vendedor */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-amber-600">👨‍💼</span>
              Resumo por Vendedor
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoVendedores.map((vendedor, index) => (
                    <tr key={vendedor.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-2 px-3 text-gray-800">{vendedor.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{vendedor.caixas}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{vendedor.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registros Detalhados */}
          <div className="print:break-before-page">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-indigo-600">📋</span>
              Registros Detalhados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-100" style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Data</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Promotor</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Fretista</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Rede</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">UF</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Vendedor</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-700">Caixas</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-700">Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistros.map((registro, index) => (
                    <tr key={registro.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ colorAdjust: 'exact', WebkitColorAdjust: 'exact' }}>
                      <td className="py-1 px-2 text-gray-800">{format(new Date(registro.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.cliente}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.promotor}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.fretista}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.rede || '-'}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.uf || '-'}</td>
                      <td className="py-1 px-2 text-gray-800">{registro.vendedor || '-'}</td>
                      <td className="py-1 px-2 text-right font-semibold text-blue-600">{registro.qtd_caixas}</td>
                      <td className="py-1 px-2 text-right font-semibold text-green-600">{registro.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}