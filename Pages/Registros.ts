
import React, { useState } from "react";
import { Registro } from "@/entities/Registro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Save, AlertCircle, CheckCircle, Network, MapPin, UserSquare } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FRETISTAS, PROMOTORES, CLIENTES, CLIENTES_DATA, CLIENTE_PROMOTOR_MAP } from "../components/shared/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/shared/ThemeContext";

export default function Registros() {
  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    cliente: "",
    promotor: "",
    fretista: "",
    qtd_caixas: "",
    total: 0,
    status_revisado: false,
    rede: "",
    uf: "",
    vendedor: ""
  });

  const [clienteManual, setClienteManual] = useState("");
  const [promotorManual, setPromotorManual] = useState("");
  const [fretistaManual, setFretistaManual] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Changed to string for custom messages
  const [error, setError] = useState("");

  const { isDarkMode } = useTheme();

  const handleInputChange = (field, value) => {
    let newData = { ...formData, [field]: value };
    
    if (field === 'qtd_caixas') {
      const quantidade = parseFloat(value) || 0;
      newData.total = quantidade * 0.50;
    }

    if (field === 'cliente') {
      if (value === 'Outro (Digitar Manual)') {
        newData.rede = '';
        newData.uf = '';
        newData.vendedor = '';
        newData.promotor = ''; // Reset promotor when client is manual
      } else {
        const clienteData = CLIENTES_DATA.find(c => c.nome_fantasia === value);
        if (clienteData) {
          newData.rede = clienteData.rede;
          newData.uf = clienteData.uf;
          newData.vendedor = clienteData.vendedor;
        } else {
          // If a client is selected but not found in CLIENTES_DATA (e.g., if CLIENTES array contains items not yet in CLIENTES_DATA)
          // or if the select is cleared, reset these fields.
          newData.rede = '';
          newData.uf = '';
          newData.vendedor = '';
        }
        
        // Auto-fill promotor based on CLIENTE_PROMOTOR_MAP
        const promotoresDoCliente = CLIENTE_PROMOTOR_MAP[value];
        if (promotoresDoCliente && promotoresDoCliente.length === 1) {
          newData.promotor = promotoresDoCliente[0];
          setPromotorManual(""); // Clear manual input as it's now auto-filled
        } else {
           // If client has 2 promotors or none, clear the field for manual selection
           // This ensures existing selection is cleared if client changes to one with 2 promotors
           newData.promotor = '';
        }
      }
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const finalCliente = formData.cliente === 'Outro (Digitar Manual)' ? clienteManual : formData.cliente;
      const finalFretista = formData.fretista === 'Outro (Digitar Manual)' ? fretistaManual : formData.fretista;
      
      // --- Pre-submission validations ---
      if (!finalCliente) {
        throw new Error("O campo Cliente deve ser preenchido.");
      }
      if (!finalFretista) {
        throw new Error("O campo Fretista deve ser preenchido.");
      }
      if (!formData.qtd_caixas || parseFloat(formData.qtd_caixas) <= 0) {
        throw new Error("Quantidade de caixas deve ser maior que zero.");
      }

      const promotoresDoCliente = CLIENTE_PROMOTOR_MAP[formData.cliente] || [];
      const isMultiPromotor = promotoresDoCliente.length === 2;

      // --- Logic for multiple promotors vs single/manual ---
      if (isMultiPromotor) {
        // Lógica para 2 promotores (dividir o registro)
        const quantidadeCaixas = parseFloat(formData.qtd_caixas);
        const qtdDividida = quantidadeCaixas / 2;

        if (!Number.isInteger(qtdDividida)) {
          throw new Error("A quantidade de caixas deve ser um número par para clientes com dois promotores.");
        }

        const totalDividido = qtdDividida * 0.50;

        const registroBase = {
          data: formData.data,
          cliente: finalCliente,
          fretista: finalFretista,
          qtd_caixas: qtdDividida,
          total: totalDividido,
          status_revisado: formData.status_revisado,
          rede: formData.rede,
          uf: formData.uf,
          vendedor: formData.vendedor
        };

        const registro1 = { ...registroBase, promotor: promotoresDoCliente[0] };
        const registro2 = { ...registroBase, promotor: promotoresDoCliente[1] };
        
        // Assuming Registro.bulkCreate handles inserting multiple records
        await Registro.bulkCreate([registro1, registro2]); 
        setSuccess("Dois registros foram criados e divididos entre os promotores!");

      } else {
        // Lógica para 1 promotor (auto-filled) ou promotor selecionado manualmente
        const finalPromotor = formData.promotor === 'Outro (Digitar Manual)' ? promotorManual : formData.promotor;
        if (!finalPromotor) {
            throw new Error("O campo Promotor deve ser preenchido.");
        }
        
        const registroData = {
          ...formData,
          cliente: finalCliente,
          promotor: finalPromotor,
          fretista: finalFretista,
          qtd_caixas: parseFloat(formData.qtd_caixas),
          total: parseFloat(formData.qtd_caixas) * 0.50,
          rede: formData.rede,
          uf: formData.uf,
          vendedor: formData.vendedor
        };

        await Registro.create(registroData);
        setSuccess("Registro criado com sucesso!");
      }
      
      // --- Reset form after successful submission ---
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        cliente: "",
        promotor: "",
        fretista: "",
        qtd_caixas: "",
        total: 0,
        status_revisado: false,
        rede: "",
        uf: "",
        vendedor: ""
      });
      setClienteManual("");
      setPromotorManual("");
      setFretistaManual("");

      setTimeout(() => setSuccess(false), 5000); // Clear success message after 5 seconds
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 5000); // Clear error message after 5 seconds
    }
    
    setLoading(false);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="w-full mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/880b195d5_bannercaixas.png" 
            alt="Banner Grupo Docemel Logística Reversa" 
            className="w-full h-20 object-cover rounded-xl shadow-lg"
          />
        </div>

        <div className="text-center">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Novo Registro</h1>
          <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cadastre uma nova operação de logística reversa</p>
        </div>

        {success && (
          <Alert className={`transition-colors duration-300 ${isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className={`transition-colors duration-300 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
              {success} {/* Display the success message string */}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className={`shadow-xl border-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className="bg-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              Informações do Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Data *
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    required
                    className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtd_caixas" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Quantidade de Caixas *
                  </Label>
                  <Input
                    id="qtd_caixas"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 10"
                    value={formData.qtd_caixas}
                    onChange={(e) => handleInputChange('qtd_caixas', e.target.value)}
                    required
                    className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cliente" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Cliente *
                  </Label>
                   <Select onValueChange={(value) => handleInputChange('cliente', value)} value={formData.cliente}>
                        <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}>
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}`}>
                            {CLIENTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <AnimatePresence>
                    {formData.cliente === 'Outro (Digitar Manual)' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Input 
                              type="text"
                              placeholder="Digite o nome do cliente"
                              value={clienteManual}
                              onChange={(e) => setClienteManual(e.target.value)}
                              className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}
                          />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2 p-4 rounded-lg border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="rede" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><Network className="w-4 h-4"/>Rede</Label>
                      <Input id="rede" type="text" value={formData.rede} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uf" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><MapPin className="w-4 h-4"/>UF</Label>
                      <Input id="uf" type="text" value={formData.uf} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendedor" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}><UserSquare className="w-4 h-4"/>Vendedor</Label>
                      <Input id="vendedor" type="text" value={formData.vendedor} disabled className={`${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100'} cursor-not-allowed`}/>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotor" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Promotor *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('promotor', value)} value={formData.promotor}>
                        <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}>
                            <SelectValue placeholder="Selecione um promotor" />
                        </SelectTrigger>
                        <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}`}>
                            {PROMOTORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <AnimatePresence>
                     {formData.promotor === 'Outro (Digitar Manual)' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Input 
                              type="text"
                              placeholder="Digite o nome do promotor"
                              value={promotorManual}
                              onChange={(e) => setPromotorManual(e.target.value)}
                              className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}
                          />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fretista" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Fretista *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('fretista', value)} value={formData.fretista}>
                        <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}>
                            <SelectValue placeholder="Selecione um fretista" />
                        </SelectTrigger>
                        <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}`}>
                            {FRETISTAS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <AnimatePresence>
                     {formData.fretista === 'Outro (Digitar Manual)' && (
                         <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Input 
                              type="text"
                              placeholder="Digite o nome do fretista"
                              value={fretistaManual}
                              onChange={(e) => setFretistaManual(e.target.value)}
                              className={`mt-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'} focus:border-green-500 focus:ring-green-500`}
                          />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
              </div>

              <div className={`p-6 rounded-lg md:col-span-2 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-green-700' : 'bg-gray-50 border-green-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <Label className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Valor Total (Calculado Automaticamente)
                  </Label>
                  <div className="text-3xl font-bold text-green-600">
                    R$ {formData.total.toFixed(2)}
                  </div>
                </div>
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Cálculo: {formData.qtd_caixas || 0} caixas × R$ 0,50 = R$ {formData.total.toFixed(2)}
                </p>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg md:col-span-2 transition-colors duration-300 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <div>
                  <Label htmlFor="status_revisado" className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Status Revisado
                  </Label>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Marque se este registro já foi revisado</p>
                </div>
                <Switch
                  id="status_revisado"
                  checked={formData.status_revisado}
                  onCheckedChange={(value) => handleInputChange('status_revisado', value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-1 md:col-span-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Salvar Registro
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
