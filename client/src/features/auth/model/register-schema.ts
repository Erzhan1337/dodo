import { z } from "zod";
import { loginSchema } from "@/features/auth/model/login-schema";

export const registerSchema = loginSchema.extend({
  email: z
    .email({ message: "Email не корректный" })
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .min(2, { message: "Имя должен быть больше 2 символов" })
    .max(20, { message: "Имя слишком длинное" }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
