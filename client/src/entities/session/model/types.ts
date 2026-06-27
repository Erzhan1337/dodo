export type User = {
  id: string;
  email?: string | null;
  phone: string;
  name: string;
  address?: string | null;
  role: "CUSTOMER" | "ADMIN";
};
