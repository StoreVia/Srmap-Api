export interface PasswordStrength {
  text: string;
  strength: number;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { strength: 0, text: "" };
  if (password.length < 8) return { strength: 1, text: "Too short" };
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 2) return { strength: 2, text: "Weak" };
  if (score <= 3) return { strength: 3, text: "Medium" };
  return { strength: 4, text: "Strong" };
};