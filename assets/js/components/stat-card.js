import { escapeHTML, icon } from "../utils/helpers.js";
export const statCard = ({ label, value, iconName, note = "" }) => `<article class="card stat-card"><span class="stat-icon">${icon(iconName)}</span><div class="stat-value">${escapeHTML(value)}</div><div class="stat-label">${escapeHTML(label)}</div>${note ? `<small class="muted">${escapeHTML(note)}</small>` : ""}</article>`;
