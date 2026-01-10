import { Container } from "@/shared/ui";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/features/search";
import { AuthButton } from "@/features/auth";
import { CartButton } from "@/features/cart";

export const Header = () => {
  return (
    <header className="py-3 md:py-5 border-b border-gray-200">
      <Container className="flex items-center justify-between">
        {/*Left Side*/}
        <Link href="/" className="flex gap-1 md:gap-2 lg:gap-3 items-center">
          <div className="relative w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11">
            <Image
              src="https://res.cloudinary.com/dgtya5crt/image/upload/v1763979378/logo_xkghxv.png"
              fill
              alt="logo"
              priority
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="uppercase font-black text-sm md:text-base lg:text-xl">
              додо пицца
            </h1>
            <p className="text-gray-500 text-[10px] text-xs lg:text-sm leading-2 md:leading-2.5 lg:leading-3.5 tracking-wider">
              вкусней уже некуда
            </p>
          </div>
        </Link>
        {/*Search Bar*/}
        <div className="hidden md:flex md:flex-1 mx-8">
          <SearchBar />
        </div>
        {/*Login & Cart*/}
        <div className="flex items-center gap-2 md:gap-3">
          <AuthButton />
          <CartButton />
        </div>
      </Container>
    </header>
  );
};
