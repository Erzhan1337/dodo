import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Имя должно быть больше 2 символов" })
    .max(40, { message: "Имя слишком длинное" }),
  address: z
    .string()
    .max(300, { message: "Адрес слишком длинный" })
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
