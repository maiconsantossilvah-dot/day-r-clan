import { PLACEHOLDER_IMAGE } from "./constants.js";

export const uid = (prefix = "id") => `${prefix}-${typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
export const now = () => new Date().toISOString();
export const clone = value => JSON.parse(JSON.stringify(value));
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const slugify = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
export const safeUrl = value => {
  if (!value) return "";
  try { const url = new URL(value, location.href); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
};
export const itemImage = item => safeUrl(item?.thumbnailUrl) || safeUrl(item?.imageUrl) || PLACEHOLDER_IMAGE;
export const itemDescription = item => item?.descriptionPtBr || item?.description || "Descrição indisponível na fonte.";
export const byId = (list, id) => list.find(entry => entry.id === id);
export const itemName = (state, id) => byId(state.items, id)?.name || "Item removido";
export const memberName = (state, id) => byId(state.members, id)?.nickname || "Membro removido";
export const available = inventory => Math.max(0, Number(inventory.quantity || 0) - Number(inventory.reserved || 0));
export const sum = (list, selector = value => value) => list.reduce((total, entry) => total + Number(selector(entry) || 0), 0);
export const sortBy = (list, mode, nameSelector = value => value.name || "") => [...list].sort((a, b) => {
  if (mode === "name-desc") return nameSelector(b).localeCompare(nameSelector(a), "pt-BR");
  if (mode === "oldest") return String(a.createdAt || a.updatedAt).localeCompare(String(b.createdAt || b.updatedAt));
  if (mode === "newest") return String(b.createdAt || b.updatedAt).localeCompare(String(a.createdAt || a.updatedAt));
  if (mode === "quantity-desc") return Number(b.quantity || b.requestedQuantity || 0) - Number(a.quantity || a.requestedQuantity || 0);
  if (mode === "quantity-asc") return Number(a.quantity || a.requestedQuantity || 0) - Number(b.quantity || b.requestedQuantity || 0);
  return nameSelector(a).localeCompare(nameSelector(b), "pt-BR");
});
export const icon = name => `<i data-lucide="${escapeHTML(name)}" aria-hidden="true"></i>`;
export const refreshIcons = () => { if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); };
export const readForm = form => Object.fromEntries(new FormData(form).entries());
export const setBusy = (button, busy, label = "Salvando…") => { if (!button) return; if (busy) { button.dataset.label = button.textContent; button.textContent = label; button.disabled = true; } else { button.textContent = button.dataset.label || button.textContent; button.disabled = false; } };
export const statusClass = status => ({ urgent: "badge-danger", cancelled: "badge-danger", high: "badge-warning", partial: "badge-warning", waiting_delivery: "badge-warning", completed: "badge-success", published: "badge-success", open: "badge-info", reserved: "badge-info", draft: "badge-neutral", normal: "badge-neutral" }[status] || "badge-neutral");
export const permissions = role => ({
  canManageAll: role === "owner",
  canAdmin: ["owner", "admin"].includes(role),
  canContribute: ["owner", "admin", "member"].includes(role),
  canView: true
});
