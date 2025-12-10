
import React, { useState, useEffect } from "react";
import { Registro } from "@/entities/Registro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, RefreshCw, Database } from "lucide-react";
import { CLIENTES_DATA } from "../components/shared/constants";
import { Progress } from "@/components/ui/progress"; // Added Progress import

export default function CorrigirRegistros() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [corrigindo, setCorrigindo] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [registrosParaCorrigir, setRegistrosParaCorrigir] = useState([]);
  const [progress, setProgress] = useState(0); // New state for progress

  useEffect(() => {
    loadRegistros();
  }, []);

  const loadRegistros = async () => {
    setLoading(true);
    try {
      const data = await Registro.list();
      setRegistros(data);
      
      // Identificar registros que precisam de correção
      const paraCorrigir = data.filter(registro => 
        !registro.rede || !registro.uf || !registro.vendedor
      );
      setRegistrosParaCorrigir(paraCorrigir);
    } catch (err) {
      setError("Erro ao carregar registros");
    }
    setLoading(false);
  };

  const corrigirRegistros = async () => {
    setCorrigindo(true);
    setError("");
    setSuccess("");
    setProgress(0); // Reset progress

    let corrigidos = 0;
    let naoEncontrados = 0;
    const totalParaCorrigir = registrosParaCorrigir.length; // Total records to correct

    const DELAY_MS = 200; // Pausa de 200ms entre cada requisição para evitar rate limit

    try {
      for (let i = 0; i < totalParaCorrigir; i++) {
        const registro = registrosParaCorrigir[i]; // Get current registro
        // Buscar dados do cliente na base atualizada
        const clienteData = CLIENTES_DATA.find(c => c.nome_fantasia === registro.cliente);
        
        if (clienteData) {
          // Envia apenas os campos que precisam ser atualizados
          await Registro.update(registro.id, {
            rede: clienteData.rede,
            uf: clienteData.uf,
            vendedor: clienteData.vendedor
          });
          corrigidos++;
        } else {
          naoEncontrados++;
        }

        // Atualiza o progresso para a UI
        setProgress(((i + 1) / totalParaCorrigir) * 100);

        // Pausa após cada requisição para evitar o limite de taxa
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }

      setSuccess(`Correção concluída! ${corrigidos} registros foram atualizados. ${naoEncontrados} clientes não foram encontrados na base de dados.`);
      
      // Recarregar os dados
      await loadRegistros();
      
    } catch (err) {
      let errorMessage = "Erro durante a correção dos registros.";
      if (err.message && err.message.includes("Rate limit exceeded")) {
        errorMessage = "O limite de requisições foi atingido. O processo foi pausado. Por favor, aguarde um momento e tente novamente. Alguns registros podem já ter sido atualizados.";
      } else if (err.message) {
        errorMessage += ` Detalhes: ${err.message}`;
      }
      setError(errorMessage);
    }
    
    setCorrigindo(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="w-full mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/880b195d5_bannercaixas.png" 
            alt="Banner Grupo Docemel Logística Reversa" 
            className="w-full h-24 object-cover rounded-xl shadow-lg"
          />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Correção Automática de Registros</h1>
          <p className="text-gray-600 mt-2">Preencha automaticamente os campos Rede, UF e Vendedor baseando-se no cliente</p>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                  <p className="text-3xl font-bold text-gray-900">{registros.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Precisam Correção</p>
                  <p className="text-3xl font-bold text-gray-900">{registrosParaCorrigir.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Já Corrigidos</p>
                  <p className="text-3xl font-bold text-gray-900">{registros.length - registrosParaCorrigir.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Ação de Correção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Como funciona a correção:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Identifica registros sem os campos Rede, UF ou Vendedor preenchidos</li>
                  <li>• Busca as informações na base atualizada de clientes</li>
                  <li>• Preenche automaticamente os campos encontrados</li>
                  <li>• Mantém o histórico original dos registros</li>
                </ul>
              </div>

              {registrosParaCorrigir.length > 0 ? (
                <div className="text-center">
                  <Button
                    onClick={corrigirRegistros}
                    disabled={corrigindo || loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {corrigindo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Corrigindo... {/* Updated text */}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Corrigir {registrosParaCorrigir.length} Registros
                      </div>
                    )}
                  </Button>
                  {corrigindo && ( // Display progress bar if correcting
                    <div className="mt-4 max-w-md mx-auto">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-2">
                        {Math.round((progress / 100) * registrosParaCorrigir.length)} de {registrosParaCorrigir.length} registros processados.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Todos os registros estão corretos!</h3>
                  <p className="text-gray-600">Não há registros que precisem de correção no momento.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {registrosParaCorrigir.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Registros que serão corrigidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Cliente</th>
                      <th className="text-left p-3">Rede Atual</th>
                      <th className="text-left p-3">UF Atual</th>
                      <th className="text-left p-3">Vendedor Atual</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosParaCorrigir.slice(0, 10).map((registro) => {
                      const clienteData = CLIENTES_DATA.find(c => c.nome_fantasia === registro.cliente);
                      return (
                        <tr key={registro.id} className="border-b">
                          <td className="p-3">{new Date(registro.data).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3 font-medium">{registro.cliente}</td>
                          <td className="p-3">{registro.rede || <span className="text-red-500">Vazio</span>}</td>
                          <td className="p-3">{registro.uf || <span className="text-red-500">Vazio</span>}</td>
                          <td className="p-3">{registro.vendedor || <span className="text-red-500">Vazio</span>}</td>
                          <td className="p-3">
                            {clienteData ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Pode ser corrigido
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                Cliente não encontrado
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {registrosParaCorrigir.length > 10 && (
                  <p className="text-center text-gray-500 mt-4">
                    ... e mais {registrosParaCorrigir.length - 10} registros
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
