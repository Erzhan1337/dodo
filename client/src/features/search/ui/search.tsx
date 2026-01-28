"use client";
import { Search } from "lucide-react";
import { useSearch } from "@/features/search/model/use-search";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { useSearchProducts } from "@/features/search/api/use-search-products";

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
  const { data: products, isLoading } = useSearchProducts(debouncedQuery);

  return (
    <>
      {/*Overlay*/}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 transition-all duration-500",
          focused
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
      />
      <div ref={ref} className="relative z-60 flex-1">
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
            "absolute z-60 mt-3 w-full bg-white shadow-2xl rounded-2xl py-3 max-h-73 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-500",
            focused
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 translate-y-5 invisible pointer-events-none",
          )}
        >
          {isLoading ? (
            <div className="w-full flex items-center justify-center mt-3">
              Ищем пиццу
            </div>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
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
                    <span className="font-bold">
                      {product.items[0].price} ₸
                    </span>
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
