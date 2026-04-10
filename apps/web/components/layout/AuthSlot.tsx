"use client";

import { Avatar, Button, Spinner } from "@heroui/react";
import NavIcon from "./NavIcon";
import type { AuthSlotProps } from "@/types/auth";

export default function AuthSlot({
  state,
  user,
  onSignInRequest,
  onSignOutRequest,
}: AuthSlotProps) {
  if (state === "loading") {
    return (
      <Button
        isDisabled
        variant="secondary"
        className="border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)]"
      >
        <Spinner size="sm" />
        <span>Đang tải...</span>
      </Button>
    );
  }

  if (state === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          {user?.avatarUrl ? (
            <Avatar.Image alt={user?.name ?? "Người dùng"} src={user.avatarUrl} />
          ) : null}
          <Avatar.Fallback>{user?.name?.slice(0, 1).toUpperCase() ?? "U"}</Avatar.Fallback>
        </Avatar>
        <Button
          variant="secondary"
          className="border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          onPress={onSignOutRequest}
        >
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      className="border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
      onPress={onSignInRequest}
    >
      <NavIcon type="google" className="size-4" />
      <span>Sign in with Google</span>
    </Button>
  );
}
