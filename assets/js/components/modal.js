import { icon, refreshIcons } from "../utils/helpers.js";

let activeModal = null;
let previousFocus = null;

export function closeModal() {
  if (!activeModal) return;
  activeModal.remove();
  activeModal = null;
  document.removeEventListener("keydown", handleKeydown);
  previousFocus?.focus?.();
}

function handleKeydown(event) {
  if (event.key === "Escape") closeModal();
  if (event.key !== "Tab" || !activeModal) return;
  const focusable = [...activeModal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && !el.hidden);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function openModal({ title, content, footer = "", size = "", onReady }) {
  closeModal();
  previousFocus = document.activeElement;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal ${size === "lg" ? "modal-lg" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <header class="modal-header"><h2 class="modal-title" id="modal-title"></h2><button class="icon-button" type="button" data-modal-close aria-label="Fechar">${icon("x")}</button></header>
    <div class="modal-body"></div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}</section>`;
  backdrop.querySelector("#modal-title").textContent = title;
  const body = backdrop.querySelector(".modal-body");
  if (typeof content === "string") body.innerHTML = content;
  else if (content) body.append(content);
  backdrop.addEventListener("click", event => { if (event.target === backdrop || event.target.closest("[data-modal-close]")) closeModal(); });
  document.getElementById("modal-root").append(backdrop);
  activeModal = backdrop;
  document.addEventListener("keydown", handleKeydown);
  refreshIcons();
  requestAnimationFrame(() => backdrop.querySelector("input,select,textarea,button")?.focus());
  onReady?.(backdrop);
  return backdrop;
}
