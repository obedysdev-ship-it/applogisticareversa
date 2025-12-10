
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Registro } from "@/entities/Registro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  MessageCircle, 
  Filter,
  FileSpreadsheet,
  Calendar,
  Users,
  Package,
  Printer,
  Landmark,
  Search
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfQuarter, endOfQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FRETISTAS, PROMOTORES, CLIENTES } from "../components/shared/constants";
import { createPageUrl } from "@/utils";
import { useTheme } from "../components/shared/ThemeContext";

export default function Resumo() {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme(); // Updated to use useTheme hook

  // Filtros existentes
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPromotor, setFiltroPromotor] = useState("");
  const [filtroFretista, setFiltroFretista] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Novos filtros
  const [filtroRede, setFiltroRede] = useState("");
  const [filtroUF, setFiltroUF] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");

  // Novo estado para busca dinâmica
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRegistros();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...registros];

    // Filtro de busca dinâmica
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.cliente?.toLowerCase().includes(searchLower) ||
        r.promotor?.toLowerCase().includes(searchLower) ||
        r.fretista?.toLowerCase().includes(searchLower) ||
        r.rede?.toLowerCase().includes(searchLower) ||
        r.uf?.toLowerCase().includes(searchLower) ||
        r.vendedor?.toLowerCase().includes(searchLower) ||
        r.data?.includes(searchTerm) ||
        r.qtd_caixas?.toString().includes(searchTerm) ||
        r.total?.toString().includes(searchTerm)
      );
    }

    if (filtroDataInicio && filtroDataFim) {
      const inicio = new Date(filtroDataInicio);
      const fim = new Date(filtroDataFim);
      fim.setHours(23, 59, 59, 999);

      filtered = filtered.filter(r => {
        const dataRegistro = new Date(r.data + "T00:00:00");
        return dataRegistro >= inicio && dataRegistro <= fim;
      });
    }
    if (filtroCliente) {
      filtered = filtered.filter(r => r.cliente === filtroCliente);
    }
    if (filtroPromotor) {
      filtered = filtered.filter(r => r.promotor === filtroPromotor);
    }
    if (filtroFretista) {
      filtered = filtered.filter(r => r.fretista === filtroFretista);
    }
    // Novos filtros
    if (filtroRede) {
      filtered = filtered.filter(r => r.rede === filtroRede);
    }
    if (filtroUF) {
      filtered = filtered.filter(r => r.uf === filtroUF);
    }
    if (filtroVendedor) {
      filtered = filtered.filter(r => r.vendedor === filtroVendedor);
    }

    setFilteredRegistros(filtered);
  }, [registros, searchTerm, filtroDataInicio, filtroDataFim, filtroCliente, filtroPromotor, filtroFretista, filtroRede, filtroUF, filtroVendedor]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadRegistros = async () => {
    setLoading(true);
    try {
      const data = await Registro.list("-data");
      setRegistros(data);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroCliente("");
    setFiltroPromotor("");
    setFiltroFretista("");
    setSelectedMonth("");
    setFiltroRede("");
    setFiltroUF("");
    setFiltroVendedor("");
    setSearchTerm("");
  };

  const setDateRange = (range) => {
    const today = new Date();
    let start, end;
    if (range === 'semana') {
        start = startOfWeek(today, { locale: ptBR });
        end = endOfWeek(today, { locale: ptBR });
    } else if (range === 'mes') {
        start = startOfMonth(today);
        end = endOfMonth(today);
    } else if (range === 'ano') {
        start = startOfYear(today);
        end = endOfYear(today);
    } else if (range === 'mes_anterior') {
        const prevMonth = subMonths(today, 1);
        start = startOfMonth(prevMonth);
        end = endOfMonth(prevMonth);
    } else if (range === 'trimestre') {
        start = startOfQuarter(today);
        end = endOfQuarter(today);
    } else if (range === 'semestre') {
        const currentMonth = today.getMonth();
        if (currentMonth < 6) {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 5, 30);
        } else {
            start = new Date(today.getFullYear(), 6, 1);
            end = new Date(today.getFullYear(), 11, 31);
        }
    }
    setFiltroDataInicio(format(start, 'yyyy-MM-dd'));
    setFiltroDataFim(format(end, 'yyyy-MM-dd'));
  };

  const uniqueMonths = useMemo(() => {
    const months = new Set();
    registros.forEach(r => {
      months.add(format(parseISO(r.data + 'T00:00:00'), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [registros]);

  // Listas únicas para os novos filtros
  const uniqueRedes = useMemo(() => {
    const redes = new Set();
    registros.forEach(r => {
      if (r.rede) redes.add(r.rede);
    });
    return Array.from(redes).sort();
  }, [registros]);

  const uniqueUFs = useMemo(() => {
    const ufs = new Set();
    registros.forEach(r => {
      if (r.uf) ufs.add(r.uf);
    });
    return Array.from(ufs).sort();
  }, [registros]);

  const uniqueVendedores = useMemo(() => {
    const vendedores = new Set();
    registros.forEach(r => {
      if (r.vendedor) vendedores.add(r.vendedor);
    });
    return Array.from(vendedores).sort();
  }, [registros]);

  const handleMonthSelect = (value) => {
    setSelectedMonth(value);
    if (!value || value === "all") {
        setFiltroDataInicio(""); 
        setFiltroDataFim("");
    } else {
        const [year, month] = value.split('-').map(Number);
        const start = startOfMonth(parseISO(`${year}-${String(month).padStart(2, '0')}-02T00:00:00`));
        const end = endOfMonth(parseISO(`${year}-${String(month).padStart(2, '0')}-02T00:00:00`));
        setFiltroDataInicio(format(start, 'yyyy-MM-dd'));
        setFiltroDataFim(format(end, 'yyyy-MM-dd'));
    }
  };

  const calcularTotais = () => {
    const totalCaixas = filteredRegistros.reduce((sum, r) => sum + r.qtd_caixas, 0);
    const totalValor = filteredRegistros.reduce((sum, r) => sum + r.total, 0);

    // To calculate totalGeral as "Fretista + Promotor" contribution,
    // sum total values associated with records having a promotor and records having a fretista.
    // Records with both will have their total counted in both sums.
    let promotorTotalSum = 0;
    let fretistaTotalSum = 0;

    filteredRegistros.forEach(r => {
      if (r.promotor) {
        promotorTotalSum += r.total;
      }
      if (r.fretista) {
        fretistaTotalSum += r.total;
      }
    });

    const totalGeral = promotorTotalSum + fretistaTotalSum;

    return { totalCaixas, totalValor, totalGeral };
  };

  const resumos = useMemo(() => {
    const clientes = {};
    const promotores = {};
    const fretistas = {};
    const redes = {};
    const ufs = {};
    const vendedores = {};

    filteredRegistros.forEach(r => {
      // Clientes
      if (!clientes[r.cliente]) clientes[r.cliente] = { caixas: 0, total: 0 };
      clientes[r.cliente].caixas += r.qtd_caixas;
      clientes[r.cliente].total += r.total;
      // Promotores
      if (!promotores[r.promotor]) promotores[r.promotor] = { caixas: 0, total: 0 };
      promotores[r.promotor].caixas += r.qtd_caixas;
      promotores[r.promotor].total += r.total;
      // Fretistas
      if (!fretistas[r.fretista]) fretistas[r.fretista] = { caixas: 0, total: 0 };
      fretistas[r.fretista].caixas += r.qtd_caixas;
      fretistas[r.fretista].total += r.total;
      // Redes
      if (r.rede) {
        if (!redes[r.rede]) redes[r.rede] = { caixas: 0, total: 0 };
        redes[r.rede].caixas += r.qtd_caixas;
        redes[r.rede].total += r.total;
      }
      // UFs
      if (r.uf) {
        if (!ufs[r.uf]) ufs[r.uf] = { caixas: 0, total: 0 };
        ufs[r.uf].caixas += r.qtd_caixas;
        ufs[r.uf].total += r.total;
      }
      // Vendedores
      if (r.vendedor) {
        if (!vendedores[r.vendedor]) vendedores[r.vendedor] = { caixas: 0, total: 0 };
        vendedores[r.vendedor].caixas += r.qtd_caixas;
        vendedores[r.vendedor].total += r.total;
      }
    });

    return { clientes, promotores, fretistas, redes, ufs, vendedores };
  }, [filteredRegistros]);

  const gerarNomeArquivo = () => {
    let nomeArquivo = "Logística Reversa GDM";
    
    // Adicionar UF se houver
    if (filtroUF) {
      nomeArquivo += ` ${filtroUF}`;
    } else {
      nomeArquivo += " BA"; // padrão se nenhum UF for filtrado
    }
    
    // Adicionar promotor se houver
    if (filtroPromotor) {
      const promotorLimpo = filtroPromotor.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (promotorLimpo) nomeArquivo += ` - ${promotorLimpo}`;
    }
    
    // Adicionar fretista se houver
    if (filtroFretista) {
      const fretistaLimpo = filtroFretista.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (fretistaLimpo) nomeArquivo += ` - ${fretistaLimpo}`;
    }
    
    // Adicionar cliente se houver
    if (filtroCliente) {
      const clienteLimpo = filtroCliente.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (clienteLimpo) nomeArquivo += ` - ${clienteLimpo}`;
    }

    // Adicionar rede se houver
    if (filtroRede) {
      const redeLimpa = filtroRede.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (redeLimpa) nomeArquivo += ` - ${redeLimpa}`;
    }

    // Adicionar vendedor se houver
    if (filtroVendedor) {
      const vendedorLimpo = filtroVendedor.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (vendedorLimpo) nomeArquivo += ` - ${vendedorLimpo}`;
    }
    
    // Adicionar período se houver
    if (filtroDataInicio && filtroDataFim) {
      const dataInicioFormatada = format(parseISO(filtroDataInicio + 'T00:00:00'), 'dd-MM-yyyy', { locale: ptBR });
      const dataFimFormatada = format(parseISO(filtroDataFim + 'T00:00:00'), 'dd-MM-yyyy', { locale: ptBR });
      nomeArquivo += ` - ${dataInicioFormatada} a ${dataFimFormatada}`;
    }
    
    return nomeArquivo; // Remove .pdf extension here, it will be added by browser
  };

  // Original function to generate PDF for viewing in a new tab
  const gerarPDF = () => {
    const { totalCaixas, totalValor, totalGeral } = calcularTotais();

    const reportData = {
        filteredRegistros,
        totalCaixas,
        totalValor,
        totalGeral,
        nomeArquivo: gerarNomeArquivo(),
        resumoClientes: Object.entries(resumos.clientes).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        resumoPromotores: Object.entries(resumos.promotores).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        resumoFretistas: Object.entries(resumos.fretistas).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        resumoRedes: Object.entries(resumos.redes).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        resumoUFs: Object.entries(resumos.ufs).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        resumoVendedores: Object.entries(resumos.vendedores).map(([name, data]) => ({name, ...data})).sort((a,b) => b.total - a.total),
        filtros: {
            dataInicio: filtroDataInicio ? format(parseISO(filtroDataInicio + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : null,
            dataFim: filtroDataFim ? format(parseISO(filtroDataFim + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : null,
            promotor: filtroPromotor,
            fretista: filtroFretista,
            cliente: filtroCliente,
            rede: filtroRede,
            uf: filtroUF,
            vendedor: filtroVendedor,
        }
    };
    sessionStorage.setItem('reportData', JSON.stringify(reportData));
    window.open(createPageUrl('ResumoPDF'), '_blank');
  };

  // The 'baixarPDF' function was removed as per the instructions.

  const exportarCSV = () => {
    if (filteredRegistros.length === 0) return;

    const headers = ['Data', 'Cliente', 'Promotor', 'Fretista', 'Rede', 'UF', 'Vendedor', 'Qtd Caixas', 'Total', 'Status Revisado'];
    const csvContent = [
      headers.join(','),
      ...filteredRegistros.map(registro => [
        format(parseISO(registro.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }),
        registro.cliente,
        registro.promotor,
        registro.fretista,
        registro.rede || '',
        registro.uf || '',
        registro.vendedor || '',
        registro.qtd_caixas,
        `R$ ${registro.total.toFixed(2)}`,
        registro.status_revisado ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    let csvFilename = gerarNomeArquivo() + '.csv'; // Append .csv here
    link.setAttribute('download', csvFilename); // Use dynamic filename for CSV
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gerarTextoResumo = () => {
    const { totalCaixas, totalValor, totalGeral } = calcularTotais(); // Added totalGeral
    
    let texto = `📊 *RELATÓRIO LOGÍSTICA REVERSA GDM*\n\n`;
    
    if (filtroDataInicio || filtroCliente || filtroPromotor || filtroFretista || filtroRede || filtroUF || filtroVendedor || searchTerm) {
      texto += `🔍 *Filtros Aplicados:*\n`;
      if (filtroDataInicio && filtroDataFim) texto += `• Período: ${format(parseISO(filtroDataInicio + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })} a ${format(parseISO(filtroDataFim + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}\n`;
      if (filtroCliente) texto += `• Cliente: ${filtroCliente}\n`;
      if (filtroPromotor) texto += `• Promotor: ${filtroPromotor}\n`;
      if (filtroFretista) texto += `• Fretista: ${filtroFretista}\n`;
      if (filtroRede) texto += `• Rede: ${filtroRede}\n`;
      if (filtroUF) texto += `• UF: ${filtroUF}\n`;
      if (filtroVendedor) texto += `• Vendedor: ${filtroVendedor}\n`;
      if (searchTerm) texto += `• Busca Dinâmica: "${searchTerm}"\n`;
      texto += `\n`;
    }
    
    texto += `📈 *RESUMO GERAL:*\n`;
    texto += `• Total de registros: ${filteredRegistros.length}\n`;
    texto += `• Total de caixas: ${totalCaixas}\n`;
    texto += `• Valor total: R$ ${totalValor.toFixed(2)}\n`;
    texto += `• Total Geral (Fretista + Promotor): R$ ${totalGeral.toFixed(2)}\n\n`; // Added totalGeral
    
    texto += `📋 *DETALHES DOS REGISTROS:*\n\n`;
    
    filteredRegistros.forEach((registro, index) => {
      texto += `${index + 1}. ${format(parseISO(registro.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}\n`;
      texto += `   👤 Cliente: ${registro.cliente}\n`;
      texto += `   🎯 Promotor: ${registro.promotor}\n`;
      texto += `   🚛 Fretista: ${registro.fretista}\n`;
      if (registro.rede) texto += `   🏢 Rede: ${registro.rede}\n`;
      if (registro.uf) texto += `   📍 UF: ${registro.uf}\n`;
      if (registro.vendedor) texto += `   👨‍💼 Vendedor: ${registro.vendedor}\n`;
      texto += `   📦 Caixas: ${registro.qtd_caixas} | 💰 Total: R$ ${registro.total.toFixed(2)}\n`;
      texto += `   ✅ Status: ${registro.status_revisado ? 'Revisado' : 'Pendente'}\n\n`;
    });
    
    texto += `---\n`;
    texto += `📊 *TOTAIS FINAIS:*\n`;
    texto += `📦 Total Caixas: ${totalCaixas}\n`;
    texto += `💰 Valor Total: R$ ${totalValor.toFixed(2)}\n`;
    texto += `💰 Total Geral (Fretista + Promotor): R$ ${totalGeral.toFixed(2)}\n\n`; // Added totalGeral
    texto += `Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
    
    return texto;
  };

  const enviarWhatsApp = () => {
    const texto = gerarTextoResumo();
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const { totalCaixas, totalValor, totalGeral } = calcularTotais();

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="w-full mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/880b195d5_bannercaixas.png" 
            alt="Banner Grupo Docemel Logística Reversa" 
            className="w-full h-24 object-cover rounded-xl shadow-lg"
          />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumo e Relatórios</h1>
            <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visualize, filtre e exporte dados de logística reversa</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={gerarPDF}
              disabled={filteredRegistros.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
            {/* The 'Baixar PDF' button was removed as per the instructions */}
            <Button
              onClick={exportarCSV}
              disabled={filteredRegistros.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={enviarWhatsApp}
              disabled={filteredRegistros.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros de Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Campo de busca dinâmica */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700">Busca Dinâmica</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, promotor, fretista, rede, UF, vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 px-3 py-2 border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-gray-700">Período</label>
                 <div className="grid grid-cols-2 gap-2">
                   <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => {
                      setFiltroDataInicio(e.target.value);
                      setSelectedMonth("");
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => {
                      setFiltroDataFim(e.target.value);
                      setSelectedMonth("");
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                 <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('semana'); setSelectedMonth(""); }}>Esta Semana</Button>
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('mes'); setSelectedMonth(""); }}>Este Mês</Button>
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('mes_anterior'); setSelectedMonth(""); }}>Mês Anterior</Button>
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('trimestre'); setSelectedMonth(""); }}>Trimestre</Button>
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('semestre'); setSelectedMonth(""); }}>Semestre</Button>
                    <Button size="sm" variant="outline" onClick={() => { setDateRange('ano'); setSelectedMonth(""); }}>Este Ano</Button>
                </div>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mês</label>
                <Select value={selectedMonth} onValueChange={handleMonthSelect}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Selecione o Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {uniqueMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {format(parseISO(month + '-02T00:00:00'), "MMMM yyyy", { locale: ptBR })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cliente</label>
                <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os clientes</SelectItem>
                    {CLIENTES.filter(c => c !== "Outro (Digitar Manual)").map(cliente => (
                      <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Promotor</label>
                <Select value={filtroPromotor} onValueChange={setFiltroPromotor}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os promotores</SelectItem>
                    {PROMOTORES.filter(p => p !== "Outro (Digitar Manual)").map(promotor => (
                      <SelectItem key={promotor} value={promotor}>{promotor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fretista</label>
                <Select value={filtroFretista} onValueChange={setFiltroFretista}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os fretistas</SelectItem>
                    {FRETISTAS.filter(f => f !== "Outro (Digitar Manual)").map(fretista => (
                      <SelectItem key={fretista} value={fretista}>{fretista}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Novos Filtros */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rede</label>
                <Select value={filtroRede} onValueChange={setFiltroRede}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas as redes</SelectItem>
                    {uniqueRedes.map(rede => (
                      <SelectItem key={rede} value={rede}>{rede}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">UF</label>
                <Select value={filtroUF} onValueChange={setFiltroUF}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas as UFs</SelectItem>
                    {uniqueUFs.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vendedor</label>
                <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os vendedores</SelectItem>
                    {uniqueVendedores.map(vendedor => (
                      <SelectItem key={vendedor} value={vendedor}>{vendedor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="bg-white hover:bg-gray-50"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className={`shadow-lg border-0 border-l-4 border-l-green-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 bg-green-900/20' : 'bg-green-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total de Registros</p>
                  <p className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredRegistros.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-lg border-0 border-l-4 border-l-emerald-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 bg-emerald-900/20' : 'bg-emerald-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total de Caixas</p>
                  <p className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalCaixas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-lg border-0 border-l-4 border-l-teal-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 bg-teal-900/20' : 'bg-teal-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-600 rounded-lg">
                  <span className="text-white font-bold text-xl">R$</span>
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Valor Total</p>
                  <p className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>R$ {totalValor.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Novo Card: Total Geral */}
          <Card className={`shadow-lg border-0 border-l-4 border-l-blue-500 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 bg-blue-900/20' : 'bg-blue-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Geral</p>
                  <p className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>R$ {totalGeral.toFixed(2)}</p>
                  <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fretista + Promotor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Registros */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Registros Filtrados ({filteredRegistros.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">Carregando registros...</p>
              </div>
            ) : filteredRegistros.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum registro encontrado com os filtros aplicados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-green-50">
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Promotor</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Fretista</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Rede</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">UF</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-800">Vendedor</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-800">Caixas</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-800">Total</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistros.map((registro, index) => (
                      <tr key={registro.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-4 font-medium">
                          {format(parseISO(registro.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4">{registro.cliente}</td>
                        <td className="py-3 px-4">{registro.promotor}</td>
                        <td className="py-3 px-4">{registro.fretista}</td>
                        <td className="py-3 px-4">{registro.rede || '-'}</td>
                        <td className="py-3 px-4">{registro.uf || '-'}</td>
                        <td className="py-3 px-4">{registro.vendedor || '-'}</td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600">
                          {registro.qtd_caixas}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-green-600">
                          R$ {registro.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            className={`${registro.status_revisado 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-orange-100 text-orange-800 border-orange-200'}`}
                          >
                            {registro.status_revisado ? 'Revisado' : 'Pendente'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
