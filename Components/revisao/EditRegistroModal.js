import React, { useState } from "react";
import { User } from "@/entities/User";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FRETISTAS, PROMOTORES, CLIENTES } from "../shared/constants"; // Adjust path as needed

export default function EditRegistroModal({ registro, onSave, onClose }) {
  const [formData, setFormData] = useState({
    data: registro.data,
    cliente: CLIENTES.includes(registro.cliente) ? registro.cliente : "Outro (Digitar Manual)",
    promotor: PROMOTORES.includes(registro.promotor) ? registro.promotor : "Outro (Digitar Manual)",
    fretista: FRETISTAS.includes(registro.fretista) ? registro.fretista : "Outro (Digitar Manual)",
    qtd_caixas: registro.qtd_caixas,
    total: registro.total,
    status_revisado: registro.status_revisado
  });

  const [clienteManual, setClienteManual] = useState(
    CLIENTES.includes(registro.cliente) ? "" : registro.cliente
  );
  const [promotorManual, setPromotorManual] = useState(
    PROMOTORES.includes(registro.promotor) ? "" : registro.promotor
  );
  const [fretistaManual, setFretistaManual] = useState(
    FRETISTAS.includes(registro.fretista) ? "" : registro.fretista
  );

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    
    if (field === 'qtd_caixas') {
      const quantidade = parseFloat(value) || 0;
      newData.total = quantidade * 0.50;
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const finalCliente = formData.cliente === 'Outro (Digitar Manual)' ? clienteManual : formData.cliente;
      const finalPromotor = formData.promotor === 'Outro (Digitar Manual)' ? promotorManual : formData.promotor;
      const finalFretista = formData.fretista === 'Outro (Digitar Manual)' ? fretistaManual : formData.fretista;
      
      const user = await User.me();
      const logMessage = `Editado por ${user.full_name || user.email} em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`;
      const newHistory = [...(registro.historico || []), logMessage];

      const registroData = {
        ...formData,
        cliente: finalCliente,
        promotor: finalPromotor,
        fretista: finalFretista,
        qtd_caixas: parseFloat(formData.qtd_caixas),
        total: parseFloat(formData.qtd_caixas) * 0.50,
        historico: newHistory,
      };
      
      await onSave(registroData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            Editar Registro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qtd_caixas">Quantidade de Caixas</Label>
              <Input
                id="qtd_caixas"
                type="number"
                min="0"
                step="1"
                value={formData.qtd_caixas}
                onChange={(e) => handleInputChange('qtd_caixas', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select 
                onValueChange={(value) => {
                  handleInputChange('cliente', value);
                  if (value !== 'Outro (Digitar Manual)') {
                    setClienteManual(''); 
                  }
                }} 
                value={formData.cliente}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
                </SelectContent>
              </Select>
              {formData.cliente === 'Outro (Digitar Manual)' && (
                <Input 
                  type="text"
                  placeholder="Digite o nome do cliente"
                  value={clienteManual}
                  onChange={(e) => setClienteManual(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotor">Promotor</Label>
              <Select 
                onValueChange={(value) => {
                  handleInputChange('promotor', value);
                  if (value !== 'Outro (Digitar Manual)') {
                    setPromotorManual('');
                  }
                }} 
                value={formData.promotor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um promotor" />
                </SelectTrigger>
                <SelectContent>
                  {PROMOTORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
                </SelectContent>
              </Select>
              {formData.promotor === 'Outro (Digitar Manual)' && (
                <Input 
                  type="text"
                  placeholder="Digite o nome do promotor"
                  value={promotorManual}
                  onChange={(e) => setPromotorManual(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fretista">Fretista</Label>
               <Select 
                 onValueChange={(value) => {
                   handleInputChange('fretista', value);
                   if (value !== 'Outro (Digitar Manual)') {
                     setFretistaManual('');
                   }
                 }} 
                 value={formData.fretista}
               >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fretista" />
                </SelectTrigger>
                <SelectContent>
                  {FRETISTAS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  <SelectItem value="Outro (Digitar Manual)">Outro (Digitar Manual)</SelectItem>
                </SelectContent>
              </Select>
              {formData.fretista === 'Outro (Digitar Manual)' && (
                <Input 
                  type="text"
                  placeholder="Digite o nome do fretista"
                  value={fretistaManual}
                  onChange={(e) => setFretistaManual(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="font-semibold">Valor Total</Label>
              <div className="text-2xl font-bold text-green-600">
                R$ {formData.total.toFixed(2)}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formData.qtd_caixas} caixas × R$ 0,50
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <Label htmlFor="status_revisado">Status Revisado</Label>
              <p className="text-sm text-gray-500">Marque se este registro já foi revisado</p>
            </div>
            <Switch
              id="status_revisado"
              checked={formData.status_revisado}
              onCheckedChange={(value) => handleInputChange('status_revisado', value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}