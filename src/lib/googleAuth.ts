import { GoogleChatSpace, GoogleContact } from "../types";

// Keep access token in-memory only as instructed by guidelines
let cachedAccessToken: string | null = null;
let googleUser: { name: string; email: string; picture?: string } | null = null;

export function getCachedToken(): string | null {
  return cachedAccessToken;
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
}

export function getGoogleUser() {
  return googleUser;
}

export function setGoogleUser(user: typeof googleUser) {
  googleUser = user;
}

// Redirects to Google's OAuth 2.0 endpoint for implicit flow
export function initiateGoogleLogin(clientId: string, scopes: string[]) {
  const redirectUri = window.location.origin + window.location.pathname;
  const state = Math.random().toString(36).substring(2);
  sessionStorage.setItem("oauth_state", state);
  
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId || "960642349167-placeholder.apps.googleusercontent.com");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "token");
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("prompt", "select_account");

  window.location.href = authUrl.toString();
}

// Check if page load was a redirect from Google OAuth and parse token
export function handleOAuthRedirect(): { token: string; state: string } | null {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get("access_token");
  const state = params.get("state");

  if (token && state) {
    // Clear hash
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return { token, state };
  }
  return null;
}

// Real Fetchers
export async function fetchGoogleProfile(token: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google Profile");
  return res.json();
}

export async function fetchGoogleChatSpaces(token: string): Promise<GoogleChatSpace[]> {
  const res = await fetch("https://chat.googleapis.com/v1/spaces", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Failed to fetch Chat Spaces");
  }
  const data = await res.json();
  return (data.spaces || []).map((s: any) => ({
    name: s.name,
    displayName: s.displayName || s.name.split("/").pop() || "Chat Space",
    type: s.spaceType || "SPACE",
  }));
}

export async function sendGoogleChatMessage(token: string, spaceName: string, text: string): Promise<any> {
  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Failed to send message to Chat");
  }
  return res.json();
}

export async function fetchGoogleContacts(token: string): Promise<GoogleContact[]> {
  const res = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Failed to fetch Google Contacts");
  }
  const data = await res.json();
  return (data.connections || []).map((c: any) => {
    const name = c.names?.[0]?.displayName || "Unknown Contact";
    const email = c.emailAddresses?.[0]?.value || "";
    const photoUrl = c.photos?.[0]?.url || "";
    return {
      id: c.resourceName || Math.random().toString(),
      name,
      email,
      photoUrl,
    };
  });
}
