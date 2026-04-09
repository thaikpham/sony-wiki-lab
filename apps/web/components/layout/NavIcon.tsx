interface NavIconProps {
  type: "wiki" | "color-lab" | "sun" | "moon" | "google";
  className?: string;
}

export default function NavIcon({ type, className }: NavIconProps) {
  if (type === "wiki") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.466.89 6.064 2.352M12 6.042a8.967 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.352"
        />
      </svg>
    );
  }

  if (type === "color-lab") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
        />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  }

  if (type === "moon") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3.1l3.1 2.4c1.8-1.7 2.9-4.2 2.9-7.2 0-.7-.1-1.5-.2-2.2H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.5-4.1H3.3v2.6A9.9 9.9 0 0012 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.3A9.9 9.9 0 002.1 12c0 1.6.4 3.2 1.2 4.6L6.5 14z"
      />
      <path
        fill="#4285F4"
        d="M12 5.9c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.8 3 14.6 2 12 2A9.9 9.9 0 003.3 7.4l3.2 2.6c.8-2.4 3-4.1 5.5-4.1z"
      />
    </svg>
  );
}
