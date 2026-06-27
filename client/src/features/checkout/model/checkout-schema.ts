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

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Введите имя получателя" })
    .max(40, { message: "Имя слишком длинное" }),
  phone: z
    .string()
    .transform(normalizeKzPhone)
    .refine((val) => val.length > 0, { message: "Введите номер телефона" })
    .refine((val) => regexPhone.test(val), {
      message: "Некорректный номер телефона",
    }),
  address: z
    .string()
    .min(5, { message: "Введите адрес доставки" })
    .max(300, { message: "Адрес слишком длинный" }),
  email: z
    .email({ message: "Email не корректный" })
    .optional()
    .or(z.literal("")),
  comment: z
    .string()
    .max(500, { message: "Комментарий слишком длинный" })
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
