
import React, { useState, useEffect, useCallback } from "react";
import { Registro } from "@/entities/Registro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  History,
  Download, // Added Download icon for CSV export
  CheckCheck // Added CheckCheck icon
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfQuarter, endOfQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FRETISTAS, PROMOTORES, CLIENTES } from "../components/shared/constants";
import { useTheme } from "../components/shared/ThemeContext";
import { Progress } from "@/components/ui/progress"; // Added Progress component

import EditRegistroModal from "../components/revisao/EditRegistroModal";
import DeleteConfirmModal from "../components/revisao/DeleteConfirmModal";

export default function Revisao() {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPromotor, setFiltroPromotor] = useState("");
  const [filtroFretista, setFiltroFretista] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Novos filtros
  const [filtroRede, setFiltroRede] = useState("");
  const [filtroUF, setFiltroUF] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");

  // Novo estado para busca dinâmica
  const [searchTerm, setSearchTerm] = useState("");

  const [editingRegistro, setEditingRegistro] = useState(null);
  const [deletingRegistro, setDeletingRegistro] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isRevisandoTodos, setIsRevisandoTodos] = useState(false); // New state for batch review
  const [progressoRevisao, setProgressoRevisao] = useState(0); // New state for progress bar

  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadRegistros();
  }, []);

  // Memoize applyFilters with useCallback
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
        r.data?.includes(searchTerm) || // Date string 'YYYY-MM-DD'
        r.qtd_caixas?.toString().includes(searchTerm) ||
        r.total?.toString().includes(searchTerm) ||
        format(parseISO(r.data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }).includes(searchTerm)
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

    if (filterStatus !== "all") {
      filtered = filtered.filter(r =>
        filterStatus === "revisado" ? r.status_revisado : !r.status_revisado
      );
    }

    setFilteredRegistros(filtered);
  }, [registros, searchTerm, filtroDataInicio, filtroDataFim, filtroCliente, filtroPromotor, filtroFretista, filterStatus, filtroRede, filtroUF, filtroVendedor, setFilteredRegistros]);

  useEffect(() => {
    applyFilters();
  }, [registros, filtroDataInicio, filtroDataFim, filtroCliente, filtroPromotor, filtroFretista, filterStatus, selectedMonth, filtroRede, filtroUF, filtroVendedor, searchTerm, applyFilters]); // Added searchTerm to dependencies

  const loadRegistros = async () => {
    setLoading(true);
    try {
      const data = await Registro.list("-data");
      setRegistros(data);
    } catch (err) {
      setError("Erro ao carregar registros");
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroCliente("");
    setFiltroPromotor("");
    setFiltroFretista("");
    setFilterStatus("all");
    setSelectedMonth("");
    setFiltroRede("");
    setFiltroUF("");
    setFiltroVendedor("");
    setSearchTerm(""); // Clear search term
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

  const uniqueMonths = React.useMemo(() => {
    const months = new Set();
    registros.forEach(r => {
      months.add(format(parseISO(r.data + 'T00:00:00'), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [registros]);

  // Listas únicas para os novos filtros
  const uniqueRedes = React.useMemo(() => {
    const redes = new Set();
    registros.forEach(r => {
      if (r.rede) redes.add(r.rede);
    });
    return Array.from(redes).sort();
  }, [registros]);

  const uniqueUFs = React.useMemo(() => {
    const ufs = new Set();
    registros.forEach(r => {
      if (r.uf) ufs.add(r.uf);
    });
    return Array.from(ufs).sort();
  }, [registros]);

  const uniqueVendedores = React.useMemo(() => {
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
        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));
        setFiltroDataInicio(format(start, 'yyyy-MM-dd'));
        setFiltroDataFim(format(end, 'yyyy-MM-dd'));
    }
  };

  const handleEdit = async (registroData) => {
    try {
      await Registro.update(editingRegistro.id, registroData);
      setSuccess("Registro atualizado com sucesso!");
      setEditingRegistro(null);
      loadRegistros();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erro ao atualizar registro");
    }
  };

  const handleDelete = async (registroId) => {
    try {
      await Registro.delete(registroId);
      setSuccess("Registro excluído com sucesso!");
      setDeletingRegistro(null);
      loadRegistros();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erro ao excluir registro");
    }
  };

  const toggleStatus = async (registro) => {
    try {
      await Registro.update(registro.id, {
        ...registro,
        status_revisado: !registro.status_revisado
      });
      loadRegistros();
    } catch (err) {
      setError("Erro ao alterar status");
    }
  };

  const handleRevisarTodos = async () => {
    const registrosParaRevisar = filteredRegistros.filter(r => !r.status_revisado);
    const totalParaRevisar = registrosParaRevisar.length;

    if (totalParaRevisar === 0) {
      setSuccess("Nenhum registro pendente para revisar na seleção atual.");
      setTimeout(() => setSuccess(""), 3000);
      return;
    }

    setIsRevisandoTodos(true);
    setProgressoRevisao(0);
    setError("");
    setSuccess("");

    try {
      for (let i = 0; i < totalParaRevisar; i++) {
        const registro = registrosParaRevisar[i];
        await Registro.update(registro.id, {
          status_revisado: true
        });
        setProgressoRevisao(((i + 1) / totalParaRevisar) * 100);
        // Delay de 1 segundo entre cada atualização. Removed for faster execution, typically not ideal for batch updates in UI.
        // For production, consider doing this in batches on the backend or with a faster UI update.
        // await new Promise(resolve => setTimeout(resolve, 100)); // Shortened delay for practical use
      }
      setSuccess(`${totalParaRevisar} registros foram revisados com sucesso!`);
      loadRegistros(); // Recarrega a lista
    } catch (err) {
      setError("Ocorreu um erro ao revisar os registros. Tente novamente.");
    } finally {
      setIsRevisandoTodos(false);
    }
  };

  const handleDownloadCSV = () => {
    if (filteredRegistros.length === 0) {
      setError("Nenhum registro para exportar.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const headers = [
      "ID", "Data", "Cliente", "Promotor", "Fretista", "Quantidade Caixas", "Total",
      "Rede", "UF", "Vendedor", "Status Revisado", "Historico"
    ];

    const csvContent = filteredRegistros.map(r => {
      const row = [
        `"${r.id}"`, // Ensure ID is treated as string in CSV
        `"${format(parseISO(r.data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}"`,
        `"${r.cliente}"`,
        `"${r.promotor}"`,
        `"${r.fretista}"`,
        r.qtd_caixas,
        r.total.toFixed(2),
        `"${r.rede || ''}"`,
        `"${r.uf || ''}"`,
        `"${r.vendedor || ''}"`,
        r.status_revisado ? "Sim" : "Nao",
        `"${(r.historico || []).map(log => log.replace(/"/g, '""')).join('; ')}"` // Escape double quotes within history entries
      ];
      return row.join(",");
    }).join("\n");

    const csv = `${headers.join(",")}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const filename = `registros_revisao_${format(now, "dd-MM-yyyy_HH-mm-ss")}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess("Registros exportados com sucesso!");
    setTimeout(() => setSuccess(""), 3000);
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
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revisão de Registros</h1>
            <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revise, edite ou exclua registros existentes</p>
          </div>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros e Busca */}
        <Card className={`shadow-lg border-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Campo de busca dinâmica */}
            <div className="mb-6">
              <Label htmlFor="search-term" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Busca Dinâmica</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-term"
                  type="text"
                  placeholder="Buscar por qualquer informação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                    <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Período</Label>
                    <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}
                    />
                    <Input
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}
                    />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => setDateRange('semana')}>Esta Semana</Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('mes')}>Este Mês</Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('mes_anterior')}>Mês Anterior</Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('trimestre')}>Trimestre</Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('semestre')}>Semestre</Button>
                        <Button size="sm" variant="outline" onClick={() => setDateRange('ano')}>Este Ano</Button>
                    </div>
              </div>

               <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Mês</Label>
                <Select value={selectedMonth} onValueChange={handleMonthSelect}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Selecione o Mês" /></SelectTrigger>
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
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Cliente</Label>
                <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os clientes</SelectItem> {/* Changed null to "" for consistency with select value handling */}
                    {CLIENTES.filter(c => c !== "Outro (Digitar Manual)").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Promotor</Label>
                <Select value={filtroPromotor} onValueChange={setFiltroPromotor}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os promotores</SelectItem> {/* Changed null to "" */}
                    {PROMOTORES.filter(p => p !== "Outro (Digitar Manual)").map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Fretista</Label>
                <Select value={filtroFretista} onValueChange={setFiltroFretista}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os fretistas</SelectItem> {/* Changed null to "" */}
                    {FRETISTAS.filter(f => f !== "Outro (Digitar Manual)").map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Novos Filtros */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Rede</Label>
                <Select value={filtroRede} onValueChange={setFiltroRede}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas as redes</SelectItem> {/* Changed null to "" */}
                    {uniqueRedes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>UF</Label>
                <Select value={filtroUF} onValueChange={setFiltroUF}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas as UFs</SelectItem> {/* Changed null to "" */}
                    {uniqueUFs.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Vendedor</Label>
                <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os vendedores</SelectItem> {/* Changed null to "" */}
                    {uniqueVendedores.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white border-gray-200'}`}><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="revisado">Revisado</SelectItem>
                    <SelectItem value="nao_revisado">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2"> {/* Adjusted for Download button */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600' : 'bg-white hover:bg-gray-50'}`}
                >
                    Limpar Filtros
                </Button>
                <Button
                  onClick={handleDownloadCSV}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={filteredRegistros.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Registros */}
        <Card className={`shadow-lg border-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Registros ({filteredRegistros.length})
              </CardTitle>
              <Button
                onClick={handleRevisarTodos}
                disabled={isRevisandoTodos || filteredRegistros.filter(r => !r.status_revisado).length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isRevisandoTodos ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Revisando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" />
                    Revisar Todos os Pendentes
                  </div>
                )}
              </Button>
            </div>

            {isRevisandoTodos && (
              <div className="mt-4">
                <Progress value={progressoRevisao} className="w-full" />
                <p className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {Math.round((progressoRevisao / 100) * filteredRegistros.filter(r => !r.status_revisado).length)} de {filteredRegistros.filter(r => !r.status_revisado).length} registros revisados.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Carregando registros...</p>
              </div>
            ) : filteredRegistros.length === 0 ? (
              <p className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum registro encontrado</p>
            ) : (
              <div className="space-y-4">
                {filteredRegistros.map((registro) => (
                  <div
                    key={registro.id}
                    className={`border rounded-lg p-6 hover:shadow-md transition-shadow border-l-4 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border'
                    } ${
                      registro.status_revisado ? 'border-l-green-500' : 'border-l-orange-500'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{format(parseISO(registro.data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cliente</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.cliente}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Promotor</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.promotor}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fretista</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.fretista}</p>
                          </div>
                          {/* Novos campos */}
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rede</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.rede || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>UF</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.uf || '-'}</p>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vendedor</p>
                            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{registro.vendedor || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="space-y-2">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantidade</p>
                            <p className="text-2xl font-bold text-blue-600">{registro.qtd_caixas}</p>
                            <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>caixas</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">Total</p>
                            <p className="text-xl font-bold text-green-600">R$ {registro.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => toggleStatus(registro)}
                          className={`w-full text-white font-semibold transition-all duration-200 hover:scale-105 ${
                            registro.status_revisado
                              ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                              : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                          } shadow-lg`}
                        >
                          {registro.status_revisado ? 'Revisado' : 'Pendente'}
                        </Button>

                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRegistro(registro)}
                            className="flex-1"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingRegistro(registro)}
                            className={`text-red-600 hover:text-red-700 transition-colors duration-300 ${isDarkMode ? 'border-red-700 hover:border-red-600' : 'border-red-200 hover:border-red-300'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {registro.historico && registro.historico.length > 0 && (
                      <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className={`text-sm hover:no-underline py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="flex items-center gap-2">
                              <History className="w-4 h-4" />
                              Ver Histórico de Alterações
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className={`list-disc pl-5 text-xs space-y-1 mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {registro.historico.map((log, index) => (
                                <li key={index}>{log}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {editingRegistro && (
          <EditRegistroModal
            registro={editingRegistro}
            onSave={handleEdit}
            onClose={() => setEditingRegistro(null)}
          />
        )}

        {deletingRegistro && (
          <DeleteConfirmModal
            registro={deletingRegistro}
            onConfirm={() => handleDelete(deletingRegistro.id)}
            onClose={() => setDeletingRegistro(null)}
          />
        )}
      </div>
    </div>
  );
}
