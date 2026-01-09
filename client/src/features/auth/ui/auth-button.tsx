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
  const { isAuthenticated, user, logout } = useSessionStore();
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Button
          variant="outline"
          size="lg"
          className="hover:bg-primary hover:text-white transition-colors duration-500"
        >
          <Link href="/login" className="flex items-center gap-1">
            <User2 className="size-4 stroke-2" />
            Войти
          </Link>
        </Button>
      ) : (
        <div className="relative" ref={ref as RefObject<HTMLDivElement>}>
          <Button
            className="gap-1"
            size="lg"
            variant="outline"
            onClick={() => setOpen((prev) => !prev)}
          >
            <User2 />
            Профиль
          </Button>
          {open && (
            <div className="absolute z-10 bg-white mt-1 w-full shadow-xl border border-primary flex flex-col gap-2 rounded-xl py-2">
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
