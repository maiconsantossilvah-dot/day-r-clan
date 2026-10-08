export function evaluateWikiFreshness(source, syncState = {}) {
  const ageDays = source.lastRecentChangeAt ? Math.floor((Date.now() - new Date(source.lastRecentChangeAt).getTime()) / 86400000) : Infinity;
  const recentChangesScore = ageDays <= 30 ? 40 : ageDays <= 90 ? 28 : ageDays <= 365 ? 15 : 4;
  const coverageScore = Math.min(20, Math.round(Number(syncState.itemCount || 0) / 300 * 20));
  const imageScore = Math.min(20, Math.round(Number(syncState.imageCount || 0) / Math.max(1, Number(syncState.itemCount || 0)) * 20));
  const versionScore = syncState.gameVersionDetected ? 15 : 0;
  return { recentChangesScore, coverageScore, imageScore, versionScore, sourceFreshnessScore:recentChangesScore + coverageScore + imageScore + versionScore, evidence:{ ageDays, lastRecentChangeAt:source.lastRecentChangeAt, itemCount:syncState.itemCount, imageCount:syncState.imageCount, gameVersionDetected:syncState.gameVersionDetected } };
}

export function selectPrimarySource(sources) {
  return [...sources].filter(source=>source.enabled && source.status!=="error").sort((a,b)=>(a.priority-b.priority)||((b.sourceFreshnessScore||0)-(a.sourceFreshnessScore||0)))[0] || null;
}
