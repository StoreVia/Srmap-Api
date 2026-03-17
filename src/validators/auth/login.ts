const REG_RULES: [RegExp, string][] = [
  [/^AP/, 'Registration number must start with "AP".'],
];

export const isValidRegNumber = (value: string): [boolean, string | null] => {
  for (const [pattern, message] of REG_RULES) {
    if (!pattern.test(value)) {
      return [false, message];
    }
  }
  return [true, null];
};