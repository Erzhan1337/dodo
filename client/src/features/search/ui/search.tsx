"use client";
import { Search } from "lucide-react";
import { useSearch } from "@/features/search/model/use-search";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { useMemo } from "react";

const products = [
  {
    id: 1,
    name: "Пицца Пепперони",
    price: 1900,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%87%D0%B8%D0%BA%D0%B5%D0%BD_%D0%B1%D0%BE%D0%BC%D0%B1%D0%BE%D0%BD%D0%B8_uzisyl.avif",
  },
  {
    id: 2,
    name: "Пицца Маргарита",
    price: 2450,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%82%D0%B5%D1%80%D0%B8%D1%8F%D0%BA%D0%B8_mfiuwj.avif",
  },
  {
    id: 3,
    name: "Пицца 4 сыра",
    price: 3600,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%81%D1%8B%D1%80%D0%BD%D0%B0%D1%8F_fuxdfh.avif",
  },
  {
    id: 4,
    name: "Пицца Пепперони",
    price: 1900,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%87%D0%B8%D0%BA%D0%B5%D0%BD_%D0%B1%D0%BE%D0%BC%D0%B1%D0%BE%D0%BD%D0%B8_uzisyl.avif",
  },
  {
    id: 5,
    name: "Пицца Маргарита",
    price: 2450,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%82%D0%B5%D1%80%D0%B8%D1%8F%D0%BA%D0%B8_mfiuwj.avif",
  },
  {
    id: 6,
    name: "Пицца 4 сыра",
    price: 3600,
    imageUrl:
      "https://res.cloudinary.com/dgtya5crt/image/upload/v1766834798/%D1%81%D1%8B%D1%80%D0%BD%D0%B0%D1%8F_fuxdfh.avif",
  },
];

export const SearchBar = () => {
  const {
    focused,
    setFocused,
    ref,
    inputRef,
    query,
    setQuery,
    debouncedQuery,
  } = useSearch();
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
    );
  }, [debouncedQuery]);
  return (
    <>
      {/*Overlay*/}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-10 transition-all duration-500",
          focused
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
      />
      <div ref={ref} className="relative z-20 flex-1">
        <div
          className={cn(
            "flex items-center px-3 md:h-10 lg:h-12 rounded-2xl shadow-sm transition-all duration-500",
            focused
              ? "bg-white ring-2 ring-orange-500 shadow-lg"
              : "bg-gray-100",
          )}
        >
          <Search className="md:size-4 lg:size-5 text-gray-500" />
          <input
            onFocus={() => setFocused(true)}
            onChange={(event) => setQuery(event.target.value)}
            value={query}
            ref={inputRef}
            type="text"
            placeholder="Поиск пиццы..."
            maxLength={30}
            spellCheck={false}
            className="outline-0 w-full pl-2 bg-transparent lg:text-base md:text-sm"
          />
        </div>
        {/*Dropdown*/}
        <div
          className={cn(
            "absolute z-20 mt-3 w-full bg-white shadow-2xl rounded-2xl py-3 max-h-73 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-500",
            focused
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 translate-y-5 invisible pointer-events-none",
          )}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link href="/product" key={product.id} className="">
                <div className="px-5 py-2 hover:bg-orange-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{product.name}</span>
                  </div>
                  <div>
                    <span className="font-bold">{product.price} ₸</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <span>Ничего не найдено!</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
