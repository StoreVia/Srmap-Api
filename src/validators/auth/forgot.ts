const RULES: [RegExp, string][] = [
  [/.{8,16}/, 'Password must be between 8 and 16 characters.'],
  [/[A-Z]/, 'Must contain at least one uppercase letter.'],
  [/[a-z]/, 'Must contain at least one lowercase letter.'],
  [/[0-9]/, 'Must contain at least one number.'],
  [/[@$!%*?&]/, 'Must include one special character (@$!%*?&).']
];

export const isValidPassword = (password: string): [boolean, string | null] => {
  for (const [pattern, message] of RULES) {
    if (!pattern.test(password)) {
      return [false, message];
    }
  }
  return [true, null];
};

export const getPasswordValidation = (password: string) => {
  return RULES.map(([regex, message]) => ({
    message,
    isValid: regex.test(password),
  }));
};