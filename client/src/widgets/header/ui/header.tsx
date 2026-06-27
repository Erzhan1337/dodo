import { Container } from "@/shared/ui";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/features/search";
import { HeaderActions } from "@/widgets/header/ui/header-actions";
import { Pizza } from "lucide-react";

export const Header = () => {
  return (
    <header className="py-3 md:py-5 border-b border-zinc-200">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex gap-1 md:gap-2 lg:gap-3 items-center">
          <div className="relative w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11">
            <Image
              src="https://res.cloudinary.com/dgtya5crt/image/upload/v1763979378/logo_xkghxv.png"
              fill
              alt="logo"
              priority
              sizes="(max-width: 768px) 32px, (max-width: 1024px) 36px, 44px"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="uppercase font-semibold text-sm md:text-base lg:text-xl">
              404 Pizza
            </h1>
            <p className="text-zinc-500 text-[10px] text-xs lg:text-sm leading-2 md:leading-2.5 lg:leading-3.5 tracking-wider">
              вкусней уже некуда
            </p>
          </div>
        </Link>
        <div className="hidden md:flex md:flex-1 mx-8">
          <SearchBar />
        </div>
        <Link
          href="/pizza-constructor"
          className="mr-3 hidden min-h-10 items-center gap-2 rounded-xl bg-orange-50 px-4 text-sm font-bold text-primary transition-transform hover:scale-95 lg:flex"
        >
          <Pizza className="size-4" />
          Конструктор
        </Link>
        <HeaderActions />
      </Container>
    </header>
  );
};
