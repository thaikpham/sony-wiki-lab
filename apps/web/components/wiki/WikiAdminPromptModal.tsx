"use client";

interface WikiAdminPromptModalProps {
  errorMessage?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  password: string;
  onClose: () => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export default function WikiAdminPromptModal({
  errorMessage,
  isOpen,
  isSubmitting,
  password,
  onClose,
  onPasswordChange,
  onSubmit,
}: WikiAdminPromptModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-admin-prompt-title"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Wiki Admin
        </p>
        <h2
          id="wiki-admin-prompt-title"
          className="mt-2 text-2xl font-semibold text-[var(--foreground)]"
        >
          Admin Access
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Nhập mật khẩu quản trị để mở các action chỉnh sửa trực tiếp trong runtime
          `/wiki`.
        </p>

        <label className="mt-5 block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSubmit();
              }
            }}
            autoFocus
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
            placeholder="WIKI_ADMIN_PASSWORD"
          />
        </label>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
