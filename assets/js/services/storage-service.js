import { createDemoData } from "../data/demo-data.js";
import { STORAGE_KEY } from "../utils/constants.js";
import { clone, now, uid } from "../utils/helpers.js";

let state;
const listeners = new Set();

function persist() {
  const persisted = clone(state);
  persisted.items = (persisted.items || []).filter(item => item.sourceKind !== "wiki");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  listeners.forEach(listener => listener(state));
}

export function initializeStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    state = saved && saved.schemaVersion === 1 ? saved : createDemoData();
  } catch {
    state = createDemoData();
  }
  if (!localStorage.getItem(STORAGE_KEY)) persist();
  return state;
}

export const getState = () => state;
export const snapshot = () => { const exported = clone(state); exported.items = (exported.items || []).filter(item => item.sourceKind !== "wiki"); exported.catalogReference = { source:state.wikiSync?.source, lastSync:state.wikiSync?.lastSync, latestRevisionSeen:state.wikiSync?.latestRevisionSeen }; return exported; };
export function updateState(mutator) { mutator(state); persist(); return state; }
export function replaceState(nextState) { const wikiItems = state?.items?.filter(item => item.sourceKind === "wiki") || []; const wikiSync = state?.wikiSync; const sources = state?.sources; state = clone(nextState); const clanItems = (state.items || []).filter(item => item.sourceKind !== "wiki"); state.items = [...wikiItems, ...clanItems]; if (!state.wikiSync && wikiSync) state.wikiSync = wikiSync; if (!state.sources && sources) state.sources = sources; persist(); return state; }
export function resetDemoData({ keepOnboarding = true } = {}) { const wikiItems = state?.items?.filter(item => item.sourceKind === "wiki") || []; const wikiSync = state?.wikiSync; const sources = state?.sources; const next = createDemoData(); next.onboardingCompleted = keepOnboarding; if (wikiItems.length) next.items = wikiItems; if (wikiSync) next.wikiSync = wikiSync; if (sources) next.sources = sources; state = next; persist(); return state; }
export function completeOnboarding() { updateState(data => { data.onboardingCompleted = true; }); }
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function addActivity({ type, entityType, entityId, message, userId }) {
  state.activities.unshift({ id: uid("act"), clanId: state.clan.id, userId: userId || state.profile.id, type, entityType, entityId, message, createdAt: now() });
  state.activities = state.activities.slice(0, 100);
}
