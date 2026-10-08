import { escapeHTML, itemImage } from "../utils/helpers.js";
import { itemSearchText, normalizeSearchText } from "../utils/search.js";

export function itemOptions(items, selected = "") {
  return `<option value="">Selecione um item</option>${items
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((item) => {
      const category = item.category || "Sem categoria";
      const type = item.type || "Tipo não informado";
      const search = itemSearchText(item);
      return `<option value="${escapeHTML(item.id)}" data-item-option data-search="${escapeHTML(search)}" data-name="${escapeHTML(item.name)}" data-category="${escapeHTML(category)}" data-type="${escapeHTML(type)}" data-image="${escapeHTML(itemImage(item))}" ${item.id === selected ? "selected" : ""}>${escapeHTML(item.name)} — ${escapeHTML(category)}${item.type ? ` · ${escapeHTML(item.type)}` : ""}</option>`;
    })
    .join("")}`;
}

export function itemPicker({ items, name = "itemId", selected = "", required = true, label = "Item" }) {
  return `<div class="field"><label for="picker-${escapeHTML(name)}">${escapeHTML(label)}</label><select class="select" id="picker-${escapeHTML(name)}" name="${escapeHTML(name)}" ${required ? "required" : ""}>${itemOptions(items, selected)}</select></div>`;
}

export function pickerPreview(item) {
  return item ? `<div class="item-identity"><img class="item-thumb" src="${escapeHTML(itemImage(item))}" alt="${escapeHTML(item.name)}" loading="lazy" data-image-fallback><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.category || "Sem categoria")}${item.type ? ` · ${escapeHTML(item.type)}` : ""}</small></div></div>` : "";
}

function enhanceSelect(select) {
  if (select.dataset.itemPickerEnhanced || !select.closest("form") || !select.querySelector("option[data-item-option]")) return;
  select.dataset.itemPickerEnhanced = "true";
  const search = document.createElement("input");
  search.className = "input item-picker-search";
  search.type = "search";
  search.autocomplete = "off";
  search.placeholder = "Pesquisar em português ou inglês…";
  search.setAttribute("aria-label", "Pesquisar item em português ou inglês");
  const preview = document.createElement("div");
  preview.className = "item-picker-preview";
  select.before(search);
  select.after(preview);

  const renderPreview = () => {
    const option = select.selectedOptions[0];
    if (!option?.value) {
      preview.innerHTML = '<small class="muted">Pesquise e selecione um item do catálogo.</small>';
      return;
    }
    preview.innerHTML = `<div class="item-identity"><img class="item-thumb" src="${escapeHTML(option.dataset.image || "")}" alt="${escapeHTML(option.dataset.name || option.textContent)}" loading="lazy" data-image-fallback><div><strong>${escapeHTML(option.dataset.name || option.textContent)}</strong><small>${escapeHTML(option.dataset.category || "Sem categoria")} · ${escapeHTML(option.dataset.type || "Tipo não informado")}</small></div></div>`;
  };

  search.addEventListener("input", () => {
    const query = normalizeSearchText(search.value);
    let matches = 0;
    [...select.options].forEach((option) => {
      if (!option.value) return;
      const visible = !query || (option.dataset.search || "").includes(query);
      option.hidden = !visible;
      if (visible) matches += 1;
    });
    search.setAttribute("aria-description", `${matches} item(ns) encontrado(s)`);
  });
  select.addEventListener("change", renderPreview);
  renderPreview();
}

function installEnhancer() {
  const enhanceAll = (root = document) => root.querySelectorAll?.("select").forEach(enhanceSelect);
  enhanceAll();
  if (window.__dayrItemPickerObserver) return;
  window.__dayrItemPickerObserver = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("select")) enhanceSelect(node);
      enhanceAll(node);
    }));
  });
  window.__dayrItemPickerObserver.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installEnhancer, { once: true });
else installEnhancer();
