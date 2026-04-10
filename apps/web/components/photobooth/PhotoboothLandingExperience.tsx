import type {
  PhotoboothDownloadRelease,
  PhotoboothStatus,
} from "@/lib/photobooth/contracts";
import PhotoboothStudioShell from "./PhotoboothStudioShell";

interface PhotoboothLandingExperienceProps {
  release: PhotoboothDownloadRelease;
  status: PhotoboothStatus | null;
  hostUnavailable?: boolean;
}

export default function PhotoboothLandingExperience({
  release,
  status,
  hostUnavailable = false,
}: PhotoboothLandingExperienceProps) {
  return (
    <PhotoboothStudioShell activePath="/photobooth">
      {hostUnavailable ? (
        <section className="rounded-[1.6rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          <p className="font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.2em]">
            Booth Host Unavailable
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-amber-900/72">
            Runtime local hiện chưa phản hồi, nên overview chỉ hiển thị release manifest và trạng thái host unavailable thay vì dữ liệu camera/session giả.
          </p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.1),transparent_28%),linear-gradient(180deg,#ffffff,#f1f1f1)] p-8 lg:p-12">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <article className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-black px-3 py-1 font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                Windows Installer
              </span>
              <span className="rounded-full bg-black/6 px-3 py-1 font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.2em] text-black/55">
                Sony SDK {status?.camera.sdkVersion ?? "Unavailable"}
              </span>
            </div>

            <h2 className="mt-8 font-[var(--font-photobooth-headline)] text-4xl font-semibold tracking-[-0.05em] text-[#111111] lg:text-7xl">
              Tải app Photobooth để chạy booth runtime local trên Windows.
            </h2>
            <p className="mt-6 max-w-2xl font-[var(--font-photobooth-body)] text-base leading-8 text-black/60">
              Kết nối Sony camera qua USB-C, mở booth host local và phát ảnh ngay cho
              khách bằng QR. Landing này chỉ giữ một việc duy nhất: tải đúng bản booth
              app để vận hành tại sự kiện.
            </p>

            <div className="mt-10">
              <a
                href={release.downloadUrl}
                className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,#000000,#1b1b1d)] px-7 py-4 font-[var(--font-photobooth-headline)] text-sm font-semibold uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5"
              >
                Download {release.windowsPackage}
              </a>
            </div>
          </article>

          <article className="rounded-[2rem] bg-[#111111] p-6 text-white lg:p-8">
            <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-white/52">
              Release
            </p>
            <p className="mt-4 font-[var(--font-photobooth-headline)] text-3xl font-semibold tracking-[-0.04em]">
              {release.version}
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] bg-white/6 p-4">
                <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-white/48">
                  Camera
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  {status?.camera.model ?? "Booth host unavailable"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/6 p-4">
                <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-white/48">
                  Transport
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  {status?.camera.transport ?? "Unavailable"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/6 p-4">
                <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-white/48">
                  Runtime
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  {status?.runtime ?? "host-unavailable"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/6 p-4">
                <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-white/48">
                  Package
                </p>
                <p className="mt-2 break-all text-sm leading-7 text-white/72">
                  {release.windowsPackage}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PhotoboothStudioShell>
  );
}
