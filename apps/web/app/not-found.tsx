import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl font-bold text-[var(--color-primary)] mb-2">404</div>
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">
        Không tìm thấy trang
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-[var(--color-primary)] text-white text-sm font-medium
                   hover:bg-[var(--color-primary-hover)]
                   transition-colors duration-[var(--transition-fast)] no-underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Về trang chủ
      </Link>
    </div>
  );
}
