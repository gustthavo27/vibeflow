export function validateLeadName(value: string): string | undefined {
  if (!value.trim()) return "Informe o nome do lead.";
  if (value.trim().length < 2) return "Informe um nome válido.";
  return undefined;
}

export function validateLeadEmail(value: string): string | undefined {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value.trim()) return "Informe o e-mail do lead.";
  if (!EMAIL_REGEX.test(value)) return "Informe um e-mail válido.";
  return undefined;
}

export function validateLeadPhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Informe o telefone do lead.";
  if (digits.length < 10) return "Informe um telefone válido com DDD.";
  return undefined;
}

export function validateLeadCompany(value: string): string | undefined {
  if (!value.trim()) return "Informe a empresa do lead.";
  return undefined;
}
