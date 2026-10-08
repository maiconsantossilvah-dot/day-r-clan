import { WIKI_CACHE_KEY, WIKI_STATE_KEY } from "./wiki-config.js";

async function fetchJSON(path) {
  const response = await fetch(path, { cache:"no-cache" });
  if (!response.ok) throw new Error(`Cache indisponível (${response.status}).`);
  return response.json();
}

export async function loadWikiCache() {
  try {
    const [rawItems, syncState, translations] = await Promise.all([
      fetchJSON("./data/wiki-items.json"),
      fetchJSON("./data/wiki-sync-state.json"),
      fetchJSON("./data/item-descriptions-pt-BR.json"),
    ]);
    if (!Array.isArray(rawItems)) throw new Error("Catálogo inválido.");
    const translationEntries = translations?.entries || {};
    const enrichedSyncState = { ...syncState, translationCount:Object.keys(translationEntries).length, translationLocale:translations.locale || "pt-BR", translationGeneratedAt:translations.generatedAt };
    const items = rawItems.map(item => {
      const translation = translationEntries[item.id];
      const revisionMatches = translation && Number(translation.sourceRevisionId || 0) === Number(item.sourceRevisionId || 0);
      return revisionMatches ? {
        ...item,
        descriptionOriginal: item.description,
        description: translation.translatedText,
        descriptionPtBr: translation.translatedText,
        descriptionLocale: translations.locale || "pt-BR",
        descriptionTranslationStatus: "machine",
        descriptionTranslationEngine: translations.engine,
      } : item;
    });
    localStorage.setItem(WIKI_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(WIKI_STATE_KEY, JSON.stringify(enrichedSyncState));
    return { items, syncState:enrichedSyncState, cacheSource:"static" };
  } catch (networkError) {
    try {
      const items = JSON.parse(localStorage.getItem(WIKI_CACHE_KEY) || "[]");
      const syncState = JSON.parse(localStorage.getItem(WIKI_STATE_KEY) || "null");
      if (!items.length || !syncState) throw new Error("Cache local vazio.");
      return { items, syncState:{ ...syncState, status:"cached-offline" }, cacheSource:"localStorage" };
    } catch {
      throw networkError;
    }
  }
}
