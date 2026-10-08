import { escapeHTML, icon, refreshIcons } from "../utils/helpers.js";
export function showToast(message, type = "success", duration = 3200) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `${icon(type === "error" ? "circle-alert" : type === "warning" ? "triangle-alert" : "circle-check")}<span>${escapeHTML(message)}</span>`;
  document.getElementById("toast-root").append(toast);
  refreshIcons();
  setTimeout(() => toast.remove(), duration);
}
