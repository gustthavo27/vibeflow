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
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

function DeleteLeadDialog({
  lead,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lead: Lead) => void;
  isDeleting?: boolean;
}) {
  return (
    <AlertDialog open={!!lead} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir lead</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {lead?.name}? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={() => lead && onConfirm(lead)}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteLeadDialog };
