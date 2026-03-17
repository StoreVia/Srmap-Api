export const isValidComment = (value: string): [boolean, string | null] => {
  const length = value.trim().length;

  if (length <= 10) {
    return [false, "Comment must be more than 10 characters"];
  }

  if (length > 500) {
    return [false, "Comment must be less than 500 characters"];
  }

  return [true, null];
};