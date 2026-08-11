"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { Paperclip, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Anexo } from "@/lib/mock-data";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentsField({
  anexos,
  onChange,
  emptyLabel = "Nenhum arquivo anexado.",
}: {
  anexos: Anexo[];
  onChange: (anexos: Anexo[]) => void;
  emptyLabel?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const novosAnexos: Anexo[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      nome: file.name,
      tamanhoBytes: file.size,
    }));

    onChange([...anexos, ...novosAnexos]);
    event.target.value = "";
  }

  function handleRemove(id: string) {
    onChange(anexos.filter((anexo) => anexo.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Paperclip />
          Anexar arquivo
        </Button>
      </div>

      {anexos.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {anexos.map((anexo) => (
            <li
              key={anexo.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-sm ring-1 ring-foreground/5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{anexo.nome}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(anexo.tamanhoBytes)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remover ${anexo.nome}`}
                onClick={() => handleRemove(anexo.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { FileAttachmentsField, formatFileSize };
