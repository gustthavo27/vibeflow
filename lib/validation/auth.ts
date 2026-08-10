const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Informe seu e-mail.";
  if (!EMAIL_REGEX.test(value)) return "Informe um e-mail válido.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Informe sua senha.";
  if (value.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Informe seu nome.";
  if (value.trim().length < 2) return "Informe um nome válido.";
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return "Confirme sua senha.";
  if (password !== confirmPassword) return "As senhas não coincidem.";
  return undefined;
}

export function validateWorkspaceName(value: string): string | undefined {
  if (!value.trim()) return "Informe o nome do workspace.";
  if (value.trim().length < 3) return "O nome deve ter pelo menos 3 caracteres.";
  return undefined;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
