import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livestream — Sony Wiki",
  description: "Workspace placeholder cho module Livestream",
};

export default function LivestreamPage() {
  return (
    <div className="py-8">
      <section className="min-h-[320px] rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="inline-flex items-center rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Coming Soon
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">
          Livestream
        </h1>
      </section>
    </div>
  );
}
