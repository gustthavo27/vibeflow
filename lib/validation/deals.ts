export function validateDealTitle(value: string): string | undefined {
  if (!value.trim()) return "Informe o título do negócio.";
  if (value.trim().length < 2) return "Informe um título válido.";
  return undefined;
}

export function validateDealEstimatedValue(value: number): string | undefined {
  if (Number.isNaN(value)) return "Informe um valor válido.";
  if (value < 0) return "O valor estimado não pode ser negativo.";
  return undefined;
}

export function validateDealDueDate(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Informe uma data válida.";
  return undefined;
}
