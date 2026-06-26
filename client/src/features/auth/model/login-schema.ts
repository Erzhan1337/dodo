import { z } from "zod";

const regexPhone = /^\+77\d{9}$/;

const normalizeKzPhone = (phone: string) => {
  const value = phone.trim();
  const hasPlus = value.startsWith("+");
  const digits = value.replace(/\D/g, "");

  if (!digits) return value;

  if (hasPlus && digits.startsWith("7") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith("8") && digits.length === 11) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.startsWith("7") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("7")) {
    return `+7${digits}`;
  }

  return value;
};

export const loginSchema = z.object({
  phone: z
    .string()
    .transform(normalizeKzPhone)
    .refine((val) => val.length > 0, { message: "Введите номер телефона" })
    .refine((val) => regexPhone.test(val), {
      message: "Некорректный номер телефона",
    }),
  password: z
    .string({ message: "Введите пароль" })
    .min(8, { message: "Минимальная длина пароля 8 символов" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
