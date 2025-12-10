import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Registro } from "@/entities/Registro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserCheck,
  Package,
  Filter,
  Calendar,
  Landmark,
  Truck, // Truck icon for Fretista summary
  Search, // Added Search icon for dynamic filter
  Download // Added Download icon for CSV export
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, subMonths, startOfQuarter, endOfQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FRETISTAS, PROMOTORES, CLIENTES, CLIENTES_DATA } from "../components/shared/constants";

import StatsCard from "../components/dashboard/StatsCard";
import DetailedSummaryList from "../components/dashboard/DetailedSummaryList";
import TopRankings from "../components/dashboard/TopRankings";
import DailyEvolutionChart from "../components/dashboard/DailyEvolutionChart";
import UFPieChart from "../components/dashboard/UFPieChart";
// VendedorPieChart was removed as per instructions
import RedePieChart from "../components/dashboard/RedePieChart"; // RedePieChart added as per instructions
import RedeColumnChart from "../components/dashboard/RedeColumnChart";
import MediaPorRedeChart from "../components/dashboard/MediaPorRedeChart";
import { useTheme } from "../components/shared/ThemeContext";

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros existentes
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPromotor, setFiltroPromotor] = useState("");
  const [filtroFretista, setFiltroFretista] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Novos filtros
  const [filtroRede, setFiltroRede] = useState("");
  const [filtroUF, setFiltroUF] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");

  // Novo estado para busca dinâmica
  const [searchTerm, setSearchTerm] = useState("");

  const { isDarkMode } = useTheme();

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
        // Format date for search, so user can search 'dd/MM/yyyy'
        (r.data && format(parseISO(r.data), "dd/MM/yyyy").includes(searchLower)) ||
        r.qtd_caixas?.toString().includes(searchLower) ||
        r.total?.toString().includes(searchLower)
      );
    }

    if (filtroDataInicio && filtroDataFim) {
      const inicio = new Date(filtroDataInicio + "T00:00:00");
      const fim = new Date(filtroDataFim + "T00:00:00");
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

    if (filtroStatus !== 'all') {
      filtered = filtered.filter(r => filtroStatus === 'revisado' ? r.status_revisado : !r.status_revisado);
    }

    setFilteredRegistros(filtered);
  }, [registros, searchTerm, filtroDataInicio, filtroDataFim, filtroCliente, filtroPromotor, filtroFretista, filtroStatus, filtroRede, filtroUF, filtroVendedor]);

  useEffect(() => {
    // The `applyFilters` function is a useCallback, so it's stable as long as its dependencies don't change.
    // Adding it to useEffect's dependency array ensures the effect re-runs if applyFilters itself changes (due to its own dependencies changing).
    applyFilters();
  }, [registros, filtroDataInicio, filtroDataFim, filtroCliente, filtroPromotor, filtroFretista, filtroStatus, filtroRede, filtroUF, filtroVendedor, searchTerm, applyFilters]);

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
    setFiltroStatus("all");
    setSelectedMonth("");
    setFiltroRede("");
    setFiltroUF("");
    setFiltroVendedor("");
    setSearchTerm(""); // Clear search term as well
  };

  const setDateRange = (range) => {
    const today = new Date();
    let start, end;
    if (range === 'semana') {
      start = startOfWeek(today);
      end = endOfWeek(today);
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
      // Ensure r.data exists and is a valid date string before parsing
      if (r.data) {
        months.add(format(parseISO(r.data + 'T00:00:00'), 'yyyy-MM'));
      }
    });
    return Array.from(months).sort().reverse();
  }, [registros]);

  const handleMonthSelect = (value) => {
    setSelectedMonth(value);
    if (!value || value === "all") {
      setFiltroDataInicio("");
      setFiltroDataFim("");
    } else {
      const [year, month] = value.split('-').map(Number);
      const start = startOfMonth(new Date(year, month - 1));
      const end = endOfMonth(new Date(year, month - 1));
      setFiltroDataInicio(format(start, 'yyyy-MM-dd'));
      setFiltroDataFim(format(end, 'yyyy-MM-dd'));
    }
  };

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

  const valorTotalGeral = useMemo(() => {
    return filteredRegistros.reduce((sum, r) => sum + r.total, 0) * 2;
  }, [filteredRegistros]);

  const resumos = useMemo(() => {
    const clientes = {};
    const promotores = {};
    const fretistas = {}; // Added fretistas summary

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
    });

    return { clientes, promotores, fretistas };
  }, [filteredRegistros]);

  const resumoPromotoresData = useMemo(() => Object.entries(resumos.promotores)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total), [resumos.promotores]);

  const resumoClientesData = useMemo(() => Object.entries(resumos.clientes)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total), [resumos.clientes]);

  const resumoFretistasData = useMemo(() => Object.entries(resumos.fretistas) // Added fretistas data
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total), [resumos.fretistas]);


  const dailyEvolutionData = useMemo(() => {
    if (!filtroDataInicio || !filtroDataFim) return [];

    const start = parseISO(filtroDataInicio);
    const end = parseISO(filtroDataFim);
    const dateRange = eachDayOfInterval({ start, end });

    const dailyData = dateRange.map(date => ({
      date: format(date, 'dd/MM'),
      caixas: 0,
    }));

    filteredRegistros.forEach(r => {
      const recordDateStr = format(parseISO(r.data), 'dd/MM');
      const dayData = dailyData.find(d => d.date === recordDateStr);
      if (dayData) {
        dayData.caixas += r.qtd_caixas;
      }
    });

    return dailyData;
  }, [filteredRegistros, filtroDataInicio, filtroDataFim]);

  const handleDownloadCSV = () => {
    if (filteredRegistros.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ID", "Data", "Cliente", "Promotor", "Fretista", "Rede", "UF", "Vendedor",
      "Qtd Caixas", "Total", "Status Revisado"
    ];
    const csvRows = [headers.join(',')];

    filteredRegistros.forEach(r => {
      const row = [
        r.id,
        format(parseISO(r.data), 'dd/MM/yyyy'),
        r.cliente,
        r.promotor,
        r.fretista,
        r.rede,
        r.uf,
        r.vendedor,
        r.qtd_caixas,
        r.total,
        r.status_revisado ? "Sim" : "Não"
      ];
      csvRows.push(row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Generate personalized filename
    let filename = "registros";
    if (filtroCliente) filename += `_${filtroCliente.replace(/\s/g, '_')}`;
    if (filtroPromotor) filename += `_${filtroPromotor.replace(/\s/g, '_')}`;
    if (filtroFretista) filename += `_${filtroFretista.replace(/\s/g, '_')}`;
    if (filtroRede) filename += `_rede_${filtroRede.replace(/\s/g, '_')}`;
    if (filtroUF) filename += `_uf_${filtroUF}`;
    if (filtroVendedor) filename += `_vendedor_${filtroVendedor.replace(/\s/g, '_')}`;
    if (filtroDataInicio && filtroDataFim) {
      filename += `_${format(parseISO(filtroDataInicio), 'yyyyMMdd')}_${format(parseISO(filtroDataFim), 'yyyyMMdd')}`;
    } else if (searchTerm) {
      // Sanitize searchTerm for filename
      const safeSearchTerm = searchTerm.replace(/[^a-zA-Z0-9_ -]/g, '').replace(/\s+/g, '_');
      if (safeSearchTerm) filename += `_busca_${safeSearchTerm}`;
    }
    filename += `_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="w-full mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/880b195d5_bannercaixas.png"
            alt="Banner Grupo Docemel Logística Reversa"
            className="w-full h-20 object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visão geral da logística reversa</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <StatsCard
              title="VALOR TOTAL GERAL"
              value={`R$ ${valorTotalGeral.toFixed(2)}`}
              icon={Landmark}
              color="green"
              trend="Valor total dos registros (x2)"
            />
          </div>
          <StatsCard
            title="Total de Registros"
            value={filteredRegistros.length}
            icon={Package}
            color="blue"
            trend={`${registros.length} no total`}
          />
          <StatsCard
            title="Total Caixas"
            value={filteredRegistros.reduce((sum, r) => sum + r.qtd_caixas, 0)}
            icon={Package}
            color="purple"
            trend="no período filtrado"
          />
          <StatsCard
            title="Registros Revisados"
            value={filteredRegistros.filter(r => r.status_revisado).length}
            icon={UserCheck}
            color="orange"
            trend={`${((filteredRegistros.filter(r => r.status_revisado).length / (filteredRegistros.length || 1)) * 100).toFixed(1)}%`}
          />
        </div>

        {/* Filtros */}
        <Card className={`shadow-lg border-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              <CardTitle className={`text-lg transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Campo de busca dinâmica */}
            <div className="mb-6">
              <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Busca Dinâmica</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por qualquer informação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Período</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="bg-white border-gray-200"
                  />
                  <Input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setDateRange('semana')}>Esta Semana</Button>
                  <Button size="sm" variant="outline" onClick={() => setDateRange('mes')}>Este Mês</Button>
                  <Button size="sm" variant="outline" onClick={() => setDateRange('ano')}>Este Ano</Button>
                  <Button size="sm" variant="outline" onClick={() => setDateRange('mes_anterior')}>Mês Anterior</Button>
                  <Button size="sm" variant="outline" onClick={() => setDateRange('trimestre')}>Trimestre</Button>
                  <Button size="sm" variant="outline" onClick={() => setDateRange('semestre')}>Semestre</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mês</Label>
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

              {/* Cliente Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Cliente</Label>
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

              {/* Promotor Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Promotor</Label>
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

              {/* Fretista Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Fretista</Label>
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

              {/* Rede Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Rede</Label>
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

              {/* UF Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>UF</Label>
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

              {/* Vendedor Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Vendedor</Label>
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

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="revisado">Revisado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-white hover:bg-gray-50"
              >
                Limpar Filtros
              </Button>
              <Button
                onClick={handleDownloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <DailyEvolutionChart data={dailyEvolutionData} />

        {/* Novos Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UFPieChart data={filteredRegistros} />
          {/* VendedorPieChart replaced by RedePieChart as per instructions */}
          <RedePieChart data={filteredRegistros} />
        </div>

        <RedeColumnChart data={filteredRegistros} />

        <MediaPorRedeChart data={filteredRegistros} />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <DetailedSummaryList
            title="Resumo por Promotor"
            data={resumoPromotoresData}
            icon={UserCheck}
            color="green"
          />
          <DetailedSummaryList
            title="Resumo por Cliente"
            data={resumoClientesData}
            icon={Users}
            color="teal"
          />
          {/* DetailedSummaryList for Fretistas added as per instructions */}
          <DetailedSummaryList
            title="Resumo por Fretista"
            data={resumoFretistasData}
            icon={Truck}
            color="purple"
          />
        </div>

        <TopRankings resumos={resumos} />

      </div>
    </div>
  );
}
