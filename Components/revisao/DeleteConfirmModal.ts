
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DeleteConfirmModal({ registro, onConfirm, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ação não pode ser desfeita. O registro será permanentemente removido.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Detalhes do registro:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Data:</span> {format(parseISO(registro.data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}</p>
              <p><span className="font-medium">Cliente:</span> {registro.cliente}</p>
              <p><span className="font-medium">Promotor:</span> {registro.promotor}</p>
              <p><span className="font-medium">Fretista:</span> {registro.fretista}</p>
              <p><span className="font-medium">Caixas:</span> {registro.qtd_caixas}</p>
              <p><span className="font-medium">Total:</span> R$ {registro.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Registro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
