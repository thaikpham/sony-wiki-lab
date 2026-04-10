import Link from "next/link";
import PhotoboothStudioShell from "./PhotoboothStudioShell";

interface PhotoboothHostUnavailableStateProps {
  activePath: string;
  title?: string;
  description?: string;
}

export default function PhotoboothHostUnavailableState({
  activePath,
  title = "Photobooth host is unavailable",
  description = "Booth host local chưa phản hồi, nên surface này chưa thể đọc session/runtime thật. Hãy mở booth host trên máy local rồi tải lại trang.",
}: PhotoboothHostUnavailableStateProps) {
  return (
    <PhotoboothStudioShell activePath={activePath}>
      <section className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff,#f4f4f4)] p-8 shadow-sm lg:p-10">
        <span className="rounded-full bg-black px-3 py-1 font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
          Host Unavailable
        </span>
        <h1 className="mt-6 max-w-3xl font-[var(--font-photobooth-headline)] text-4xl font-semibold tracking-[-0.05em] text-[#111111] lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl font-[var(--font-photobooth-body)] text-base leading-8 text-black/60">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="http://127.0.0.1:3333/status"
            className="rounded-full bg-black px-5 py-3 font-[var(--font-photobooth-headline)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            Check Host Status
          </a>
          <Link
            href="/photobooth"
            className="rounded-full border border-black/8 bg-white px-5 py-3 font-[var(--font-photobooth-headline)] text-[10px] font-semibold uppercase tracking-[0.18em] text-black"
          >
            Back to Overview
          </Link>
        </div>
      </section>
    </PhotoboothStudioShell>
  );
}
