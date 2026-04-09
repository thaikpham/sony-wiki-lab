"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@heroui/react";
import NavIcon from "./NavIcon";

const subscribe = () => () => {};

export default function ThemeToggle() {
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [schemeOverride, setSchemeOverride] = useState<"light" | "dark" | null>(null);

  const effectiveScheme =
    schemeOverride ??
    (isHydrated && document.documentElement.getAttribute("color-scheme") === "dark"
      ? "dark"
      : "light");

  useEffect(() => {
    if (schemeOverride === null) return;
    localStorage.setItem("color-scheme", schemeOverride);
    document.documentElement.setAttribute("color-scheme", schemeOverride);
    document.documentElement.classList.toggle("dark", schemeOverride === "dark");
  }, [schemeOverride]);

  const toggle = () => {
    setSchemeOverride(effectiveScheme === "light" ? "dark" : "light");
  };

  return (
    <Button
      id="theme-toggle"
      isIconOnly
      variant="tertiary"
      onPress={toggle}
      className="relative h-9 w-9 border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
      aria-label={
        effectiveScheme === "light"
          ? "Chuyển sang chế độ tối"
          : "Chuyển sang chế độ sáng"
      }
    >
      <NavIcon
        type="sun"
        className={`absolute w-[18px] h-[18px] transition-all duration-300
          ${effectiveScheme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`}
      />
      <NavIcon
        type="moon"
        className={`absolute w-[18px] h-[18px] transition-all duration-300
          ${effectiveScheme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
      />
    </Button>
  );
}
