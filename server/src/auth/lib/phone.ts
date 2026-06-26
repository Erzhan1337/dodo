export const normalizeKzPhone = (phone: string) => {
  const value = phone.trim();
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');

  if (!digits) return value;

  if (hasPlus && digits.startsWith('7') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith('8') && digits.length === 11) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.startsWith('7') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith('7')) {
    return `+7${digits}`;
  }

  return value;
};

export const KZ_PHONE_REGEX = /^\+77\d{9}$/;
