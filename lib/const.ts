// Shared constants (migrated from @shared/const)
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/** Generate login URL for OAuth; use NEXT_PUBLIC_* env in Next. */
export function getLoginUrl(): string {
  const oauthPortalUrl = process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL ?? "";
  const appId = process.env.NEXT_PUBLIC_APP_ID ?? "";
  if (typeof window === "undefined") return "";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
}
