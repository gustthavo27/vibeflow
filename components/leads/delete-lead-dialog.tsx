"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Lead } from "@/lib/mock-data";

function DeleteLeadDialog({
  lead,
  onOpenChange,
  onConfirm,
}: {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lead: Lead) => void;
}) {
  return (
    <AlertDialog open={!!lead} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir lead</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {lead?.nome}? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => lead && onConfirm(lead)}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteLeadDialog };
