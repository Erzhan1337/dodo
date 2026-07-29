"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  BarChart3,
  Boxes,
  FolderTree,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useSessionStore } from "@/entities/session/model/store";
import { logout } from "@/shared/api";
import { Button, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { handleApiError } from "@/shared/lib/handle-api-error";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/orders", label: "Заказы", icon: ReceiptText },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
  { href: "/admin/ingredients", label: "Ингредиенты", icon: Boxes },
  { href: "/admin/users", label: "Пользователи", icon: Users },
];

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const status = useSessionStore((state) => state.status);
  const accessToken = useSessionStore((state) => state.accessToken);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);

  const isAdmin =
    _hasHydrated &&
    status === "authenticated" &&
    isAuthenticated &&
    Boolean(accessToken) &&
    user?.role === "ADMIN";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!_hasHydrated || status === "bootstrapping" || status === "unavailable") {
    return (
      <div className="min-h-screen bg-background p-4 text-foreground">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-[70vh] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <ShieldCheck className="mx-auto size-9 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold">Доступ запрещён</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Для административной панели нужна роль администратора.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/" prefetch={false}>
                На сайт
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild>
                <Link href="/login" prefetch={false}>
                  Войти
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-background transition-transform lg:translate-x-0",
          isNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" prefetch={false} className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-extrabold">404 Pizza</span>
              <span className="block text-xs text-muted-foreground">Admin</span>
            </span>
          </Link>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="lg:hidden"
            aria-label="Закрыть меню"
            onClick={() => setIsNavOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <nav className="space-y-1 p-3" aria-label="Административная навигация">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setIsNavOpen(false)}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {isNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          aria-label="Закрыть меню"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="lg:hidden"
              aria-label="Открыть меню"
              onClick={() => setIsNavOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/" prefetch={false}>
                <Home className="size-4" />
                Сайт
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-bold">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{user.phone}</span>
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Выйти"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="p-3 md:p-5">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
