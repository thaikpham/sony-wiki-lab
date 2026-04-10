export type AuthState = "guest" | "loading" | "authenticated";

export interface AuthUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthSlotProps {
  state: AuthState;
  user?: AuthUser;
  onSignInRequest: () => void;
  onSignOutRequest: () => void;
}
