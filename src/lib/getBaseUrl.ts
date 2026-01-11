// src/lib/getBaseUrl.ts
export function getBaseUrl(): string {
  // Client-side: use window.location.origin
  const origin = "";
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return origin;
}
