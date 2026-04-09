"use client";

import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "./navigation-config";
import AuthSlot from "./AuthSlot";
import GlobalSearch from "./GlobalSearch";
import NavIcon from "./NavIcon";
import ThemeToggle from "./ThemeToggle";
import { AuthState } from "@/types/navigation";

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const authState: AuthState = "guest";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 backdrop-blur sm:px-4 lg:px-6">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Button
                key={item.href}
                size="sm"
                variant={isActive ? "primary" : "secondary"}
                className={
                  isActive
                    ? "border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }
                onPress={() => router.push(item.href)}
              >
                <NavIcon type={item.icon} className="size-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        <GlobalSearch className="w-full" />

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <AuthSlot
              state={authState}
              onSignInRequest={() => {}}
              onSignOutRequest={() => {}}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 sm:hidden">
        <AuthSlot
          state={authState}
          onSignInRequest={() => {}}
          onSignOutRequest={() => {}}
        />
      </div>
    </header>
  );
}
