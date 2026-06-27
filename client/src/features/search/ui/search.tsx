"use client";
import { Search } from "lucide-react";
import { useSearch } from "@/features/search/model/use-search";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { QueryErrorState, Skeleton } from "@/shared/ui";
import { useSearchProducts } from "@/features/search/api/use-search-products";
import { formatPrice } from "@/shared/lib/format-price";

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
  const { data: products, isError, isFetching, isLoading, refetch } =
    useSearchProducts(debouncedQuery);

  return (
    <>
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
              : "bg-zinc-100",
          )}
        >
          <Search className="md:size-4 lg:size-5 text-zinc-500" />
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
        <div
          className={cn(
            "absolute z-60 mt-3 w-full bg-white shadow-2xl rounded-2xl py-3 max-h-73 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-500",
            focused
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 translate-y-5 invisible pointer-events-none",
          )}
        >
          {isLoading ? (
            <div className="w-full flex flex-col gap-2 mt-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton className="size-9 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState
              compact
              title="Не удалось выполнить поиск"
              description="Проверьте подключение и попробуйте ещё раз."
              actionLabel={isFetching ? "Загрузка..." : "Повторить"}
              actionDisabled={isFetching}
              onAction={() => void refetch()}
            />
          ) : products && products.length > 0 ? (
            products.map((product) => {
              const minPrice = product.items[0]?.price;

              return (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  scroll={false}
                >
                  <div className="px-5 py-2 hover:bg-orange-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative size-9 shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <span>{product.name}</span>
                    </div>
                    <div>
                      <span className="font-bold">
                        {minPrice != null
                          ? formatPrice(minPrice)
                          : "Нет в наличии"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
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
