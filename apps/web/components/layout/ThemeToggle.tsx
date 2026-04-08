"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [scheme, setScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("color-scheme") as "light" | "dark" | null;
    if (stored) setScheme(stored);
  }, []);

  const toggle = () => {
    const next = scheme === "light" ? "dark" : "light";
    setScheme(next);
    localStorage.setItem("color-scheme", next);
    document.documentElement.setAttribute("color-scheme", next);
  };

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      className="relative flex items-center justify-center w-9 h-9 rounded-full
                 bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface-hover)]
                 border border-[var(--color-border-light)]
                 transition-all duration-[var(--transition-fast)]
                 cursor-pointer"
      aria-label={scheme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
    >
      {/* Sun icon */}
      <svg
        className={`absolute w-[18px] h-[18px] transition-all duration-300
          ${scheme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      {/* Moon icon */}
      <svg
        className={`absolute w-[18px] h-[18px] transition-all duration-300
          ${scheme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  );
}
