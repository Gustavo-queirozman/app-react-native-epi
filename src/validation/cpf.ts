export function isValidCpf(value: string): boolean {
  const trimmed = value.trim();
  if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(digits)) return false;

  for (let position = 9; position <= 10; position++) {
    let sum = 0;
    for (let index = 0; index < position; index++) {
      sum += Number(digits[index]) * (position + 1 - index);
    }
    const remainder = sum % 11;
    const expected = remainder < 2 ? 0 : 11 - remainder;
    if (Number(digits[position]) !== expected) return false;
  }

  return true;
}
