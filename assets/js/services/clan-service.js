import { updateState } from "./storage-service.js";
import { now, uid } from "../utils/helpers.js";
export function updateClan(values) { updateState(state => { Object.assign(state.clan, values, { updatedAt: now() }); }); }
export function createInviteCode() { let code; updateState(state => { code = `${state.clan.tag || "CLAN"}-${uid().slice(-6).toUpperCase()}`; state.clan.inviteCode = code; }); return code; }
