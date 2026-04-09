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

export interface GlobalSearchParams {
  q: string;
  limit?: number;
}

export type SearchResultType = "product" | "category";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
  tookMs: number;
}
