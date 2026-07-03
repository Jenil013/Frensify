export const MIN_PASSWORD_LENGTH = 10;

/** Client-side check aligned with Supabase `lower_upper_letters_digits`. */
export function passwordStrengthError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  return null;
}

export const PASSWORD_REQUIREMENTS_HINT =
  "At least 10 characters with uppercase, lowercase, and a number.";
