// utils/auth.ts
export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isAdmin") === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("isAdmin", value ? "true" : "false");
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("isAdmin");
}
