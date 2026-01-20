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
  const { isAuthenticated, logout } = useSessionStore();
  const handleLogout = () => {
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
        <div className="relative" ref={ref as RefObject<HTMLDivElement>}>
          <Button
            className="gap-0.5 px-1 text-xs h-7 md:h-9 md:rounded-xl md:text-sm lg:text-base md:px-2 lg:rounded-2xl lg:h-11"
            variant="outline"
            onClick={() => setOpen((prev) => !prev)}
          >
            <User2 className="size-4 lg:size-5 stroke-2" />
            Профиль
          </Button>
          {open && (
            <div className="absolute z-70 bg-white mt-1 w-full shadow-xl border border-primary flex flex-col gap-1 rounded-xl py-2">
              {options.map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  className="hover:bg-orange-50 px-3 py-1 text-sm hover:text-primary"
                >
                  {option.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="hover:bg-orange-50 px-3 py-1 text-sm hover:text-primary text-start cursor-pointer"
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
