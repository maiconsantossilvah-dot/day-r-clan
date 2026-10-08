import { getState } from "./storage-service.js";
import { checkForWikiUpdates } from "../wiki/wiki-sync.js";
export const listSources = () => getState().sources || [];
export const getWikiSyncState = () => getState().wikiSync || {};
export const verifyPrimarySource = () => checkForWikiUpdates();
