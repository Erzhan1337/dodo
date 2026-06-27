import type { Metadata } from "next";
import { Suspense } from "react";
import { PizzaBuilderPage } from "@/features/pizza-builder";
import { Container, Skeleton } from "@/shared/ui";

export const metadata: Metadata = {
  title: "404 Pizza | Конструктор пиццы",
};

export default function PizzaConstructorPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#F7F4F0] pb-24 pt-6 lg:pb-16">
          <Container>
            <Skeleton className="mb-5 h-5 w-52" />
            <div className="grid gap-8 lg:grid-cols-[minmax(320px,440px)_1fr]">
              <Skeleton className="h-[560px] rounded-[28px]" />
              <Skeleton className="h-[620px] rounded-[28px]" />
            </div>
          </Container>
        </main>
      }
    >
      <PizzaBuilderPage />
    </Suspense>
  );
}
