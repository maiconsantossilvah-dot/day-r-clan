import { updateState } from "../services/storage-service.js";
import { loadWikiCache } from "./wiki-cache.js";
import { normalizeWikiItem } from "./wiki-parser.js";
import { PRIMARY_WIKI_SOURCE } from "./wiki-config.js";
import { evaluateWikiFreshness } from "./wiki-source-manager.js";
import { checkWikiSource } from "./wiki-service.js";

export async function hydrateWikiCatalog() {
  const { items, syncState, cacheSource } = await loadWikiCache();
  updateState(state => {
    const clanItems = (state.items || []).filter(item => item.sourceKind === "clan");
    const clanNotes = new Map((state.items || []).filter(item=>item.sourceKind==="wiki" && item.clanNotes).map(item=>[item.id,item.clanNotes]));
    state.items = [...items.map(item => ({ ...normalizeWikiItem(item), clanNotes:clanNotes.get(item.id)||item.clanNotes||"" })), ...clanItems];
    state.wikiSync = { ...syncState, cacheSource };
    state.sources = [{ ...PRIMARY_WIKI_SOURCE, lastCheckedAt:syncState.lastSync, lastRecentChangeAt:syncState.lastRecentChangeAt, currentVersionDetected:syncState.gameVersionDetected, articleCount:syncState.articleCount, fileCount:syncState.fileCount, ...evaluateWikiFreshness({lastRecentChangeAt:syncState.lastRecentChangeAt},syncState) }, ...(state.sources||[]).filter(source=>source.id!==PRIMARY_WIKI_SOURCE.id)];
  });
  return { items, syncState, cacheSource };
}

export async function checkForWikiUpdates() {
  const live = await checkWikiSource();
  let result;
  updateState(state => {
    const score = evaluateWikiFreshness(live, state.wikiSync);
    const source = { ...live, ...score };
    state.sources = [source, ...(state.sources||[]).filter(item=>item.id!==source.id)];
    const hasUpdate = Number(live.latestRevisionSeen||0) > Number(state.wikiSync?.latestRevisionSeen||0);
    state.wikiSync = { ...state.wikiSync, lastCheckedAt:live.lastCheckedAt, updateAvailable:hasUpdate, liveLatestRevisionSeen:live.latestRevisionSeen };
    result = { source, hasUpdate, cachedRevision:state.wikiSync.latestRevisionSeen, liveRevision:live.latestRevisionSeen, recentChanges:live.recentChanges };
  });
  return result;
}
