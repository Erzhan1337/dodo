import type { Metadata } from "next";
import { PizzaBuilderPage } from "@/features/pizza-builder";

export const metadata: Metadata = {
  title: "404 Pizza | Конструктор пиццы",
};

export default function PizzaConstructorPage() {
  return <PizzaBuilderPage />;
}
