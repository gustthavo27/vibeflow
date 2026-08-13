export function validateActivityDescription(value: string): string | undefined {
  if (!value.trim()) return "Descreva a atividade.";
  if (value.trim().length < 3) return "Informe uma descrição válida.";
  return undefined;
}
