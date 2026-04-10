"use client";

import Link from "next/link";
import { Button, Popover } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "./navigation-config";
import { photoboothNavigationItems } from "@/lib/photobooth/presentation";
import AuthSlot from "./AuthSlot";
import GlobalSearch from "./GlobalSearch";
import NavIcon from "./NavIcon";
import ThemeToggle from "./ThemeToggle";
import type { AuthState } from "@/types/auth";

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const authState: AuthState = "guest";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 backdrop-blur sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);

            if (item.href === "/photobooth") {
              return (
                <Popover key={item.href}>
                  <Popover.Trigger>
                    <Button
                      size="sm"
                      variant={isActive ? "primary" : "secondary"}
                      className={
                        isActive
                          ? "border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                          : "border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                      }
                    >
                      <NavIcon type={item.icon} className="size-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Popover.Trigger>

                  <Popover.Content
                    className="min-w-56 border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl"
                    offset={10}
                    placement="bottom start"
                  >
                    <Popover.Dialog className="space-y-1">
                      {photoboothNavigationItems.map((subItem) => {
                        const isSubActive =
                          subItem.href === "/photobooth"
                            ? pathname === subItem.href
                            : pathname?.startsWith(subItem.href);

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                              isSubActive
                                ? "bg-[var(--foreground)] text-[var(--background)]"
                                : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                            }`}
                          >
                            <span>{subItem.label}</span>
                            <span className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] opacity-60">
                              {subItem.label === "Overview"
                                ? "01"
                                : subItem.label === "Capture"
                                  ? "02"
                                  : "03"}
                            </span>
                          </Link>
                        );
                      })}
                    </Popover.Dialog>
                  </Popover.Content>
                </Popover>
              );
            }

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
