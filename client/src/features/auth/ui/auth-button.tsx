"use client";
import { useSessionStore } from "@/entities/session/model/store";
import { Button } from "@/shared/ui";
import { User2 } from "lucide-react";
import Link from "next/link";
import { RefObject, useState } from "react";
import { useClickOutside } from "@/shared/hooks";

const options = [
  { label: "Настройки", href: "/profile" },
  { label: "Заказы", href: "/orders" },
];

export const AuthButton = () => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const logout = useSessionStore((state) => state.logout);
  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Button
          variant="outline"
          className="hover:bg-primary h-7 px-1 md:h-9 md:rounded-xl md:px-2  lg:rounded-2xl lg:px-3 lg:h-11 hover:text-white transition-colors duration-500"
        >
          <Link
            href="/login"
            className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm lg:text-base"
          >
            <User2 className="size-3 md:size-4 lg:size-5 stroke-2" />
            Войти
          </Link>
        </Button>
      ) : (
        <div
          className="relative inline-block"
          ref={ref as RefObject<HTMLDivElement>}
        >
          <Button
            className="gap-0.5 px-1 text-xs h-7 md:h-9 md:rounded-xl md:text-sm lg:text-base md:px-2 lg:rounded-2xl lg:h-11"
            variant="outline"
            onClick={() => setOpen((prev) => !prev)}
          >
            <User2 className="size-4 lg:size-5 stroke-2" />
            Профиль
          </Button>
          {open && (
            <div className="absolute right-0 z-70 mt-1 flex w-full flex-col gap-1 rounded-xl border border-primary bg-white py-1.5 text-[11px] shadow-xl sm:text-xs md:text-sm">
              {options.map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  className="px-2.5 py-1.5 hover:bg-orange-50 hover:text-primary md:px-3"
                >
                  {option.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="cursor-pointer px-2.5 py-1.5 text-start hover:bg-orange-50 hover:text-primary md:px-3"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
