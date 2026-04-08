"use client";

import ThemeToggle from "./ThemeToggle";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between
                 h-[var(--spacing-header)] px-4 lg:px-6
                 bg-[var(--color-surface)]/80 backdrop-blur-md
                 border-b border-[var(--color-border-light)]"
    >
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 rounded-lg
                     hover:bg-[var(--color-surface-hover)]
                     transition-colors duration-[var(--transition-fast)]
                     lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <h1 className="text-sm font-medium text-[var(--color-text-secondary)] hidden sm:block">
          Sony Wiki
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
