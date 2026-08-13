const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  "User already registered": "Já existe uma conta com esse e-mail.",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
};

export function translateAuthError(message: string): string {
  return MESSAGES[message] ?? "Não foi possível concluir. Tente novamente em instantes.";
}
