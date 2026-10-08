import { PRIMARY_WIKI_SOURCE, WIKI_TIMEOUT_MS } from "./wiki-config.js";

export async function queryWiki(params, source = PRIMARY_WIKI_SOURCE) {
  const url = new URL(source.apiUrl);
  Object.entries({ action:"query", format:"json", formatversion:"2", origin:"*", ...params }).forEach(([key,value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, { headers:{ Accept:"application/json" }, signal:AbortSignal.timeout(WIKI_TIMEOUT_MS), cache:"no-store" });
  if (!response.ok) throw new Error(`A fonte respondeu com HTTP ${response.status}.`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.info || "Erro da API da wiki.");
  return data;
}

export async function checkWikiSource(source = PRIMARY_WIKI_SOURCE) {
  const data = await queryWiki({ meta:"siteinfo", siprop:"statistics", list:"recentchanges", rclimit:25, rcnamespace:"0|6", rcprop:"title|timestamp|ids|type" }, source);
  const changes = data.query?.recentchanges || [];
  const stats = data.query?.statistics || {};
  return { ...source, status:"active", lastCheckedAt:new Date().toISOString(), lastRecentChangeAt:changes[0]?.timestamp || null, latestRevisionSeen:Math.max(0,...changes.map(change=>change.revid||0)), articleCount:stats.articles || null, fileCount:stats.images || null, recentChanges:changes };
}
