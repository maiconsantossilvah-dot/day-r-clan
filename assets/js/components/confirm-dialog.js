import { openModal, closeModal } from "./modal.js";
import { escapeHTML } from "../utils/helpers.js";
export function confirmDialog({ title = "Confirmar ação", message, confirmLabel = "Confirmar", danger = false }) {
  return new Promise(resolve => {
    openModal({
      title,
      content: `<p>${escapeHTML(message)}</p>`,
      footer: `<button class="button button-secondary" type="button" data-modal-close>Cancelar</button><button class="button ${danger ? "button-danger" : "button-primary"}" id="confirm-dialog-button" type="button">${escapeHTML(confirmLabel)}</button>`,
      onReady(modal) { modal.querySelector("#confirm-dialog-button").addEventListener("click", () => { closeModal(); resolve(true); }); modal.querySelectorAll("[data-modal-close]").forEach(btn => btn.addEventListener("click", () => resolve(false), { once: true })); }
    });
  });
}
