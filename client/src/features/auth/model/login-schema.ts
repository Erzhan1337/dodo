import { z } from "zod";

const regexPhone = /^(\+?7|8)?7\d{9}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .transform((val) => val.replace(/\s|\(|\)|-/g, ""))
    .refine((val) => val.length > 0, { message: "Введите номер телефона" })
    .refine((val) => regexPhone.test(val), {
      message: "Некорректный номер телефона",
    }),
  password: z
    .string({ message: "Введите пароль" })
    .min(8, { message: "Минимальная длина пароля 8 символов" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
