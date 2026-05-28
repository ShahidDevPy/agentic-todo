const MIN_PASSWORD_LENGTH = 6;

export function validatePasswordPair(
  password: string,
  confirm: string,
): "tooShort" | "mismatch" | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "tooShort";
  }
  if (password !== confirm) {
    return "mismatch";
  }
  return null;
}

/** Whitelist this exact URL in Supabase → Authentication → Redirect URLs. */
export function buildPasswordResetRedirectUrl(origin: string): string {
  return `${origin}/auth/reset-password`;
}
