export const normalizeWikiItem = item => ({
  ...item,
  sourceKind: "wiki",
  category: item.category || "Sem categoria",
  type: item.type || null,
  tradeable: typeof item.tradeable === "boolean" ? item.tradeable : null,
  craftable: typeof item.craftable === "boolean" ? item.craftable : null,
  clanNotes: item.clanNotes || ""
});
