import { ROUTES } from "./utils/constants.js";
export function parseRoute() { const raw = location.hash.replace(/^#\/?/, ""); const [path = "dashboard", query = ""] = raw.split("?"); const route = ROUTES.includes(path) ? path : "dashboard"; return { route, params: new URLSearchParams(query) }; }
export function navigate(route, params = {}) { const query = new URLSearchParams(params).toString(); location.hash = `#/${route}${query ? `?${query}` : ""}`; }
export function startRouter(onChange) { if (!location.hash) location.replace(`${location.pathname}${location.search}#/dashboard`); window.addEventListener("hashchange", onChange); onChange(); return () => window.removeEventListener("hashchange", onChange); }
