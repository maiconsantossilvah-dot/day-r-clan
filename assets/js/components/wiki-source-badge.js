import { escapeHTML, icon } from "../utils/helpers.js";
export const wikiSourceBadge = (item, { compact=false } = {}) => item?.sourceKind === "wiki" ? `<span class="badge badge-info" title="Dado sincronizado da fonte">${icon("database")} ${compact?"Wiki":escapeHTML(item.sourceName||"Day R Wiki")}</span>` : `<span class="badge badge-neutral">${icon("users")} Dados do clã</span>`;
