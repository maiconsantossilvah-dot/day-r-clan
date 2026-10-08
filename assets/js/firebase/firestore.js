import { initializeFirebase } from "./firebase.js";
import { now, uid } from "../utils/helpers.js";
const CLAN_COLLECTIONS = ["items","inventories","requests","requestContributions","trades","exchangeRates","tutorials","activities","notifications"];

export async function loadFirebaseWorkspace(config, user) {
  const { db, firestoreSdk: fs } = await initializeFirebase(config);
  const profileSnap = await fs.getDoc(fs.doc(db, "users", user.uid));
  const profile = profileSnap.exists() ? { id: user.uid, ...profileSnap.data() } : { id: user.uid, nickname: user.displayName || user.email?.split("@")[0] || "Sobrevivente", email: user.email, role: "member", clanId: "" };
  if (!profileSnap.exists()) await fs.setDoc(fs.doc(db, "users", user.uid), profile);
  if (!profile.clanId) return { profile, needsClan: true };
  const clanSnap = await fs.getDoc(fs.doc(db, "clans", profile.clanId));
  const data = { schemaVersion: 1, mode: "firebase", onboardingCompleted: true, profile, clan: { id: clanSnap.id, ...clanSnap.data() }, members: [], settings: { theme: localStorage.getItem("day-r-theme") || "dark" } };
  const memberQuery = fs.query(fs.collection(db, "clanMembers"), fs.where("clanId", "==", profile.clanId));
  data.members = (await fs.getDocs(memberQuery)).docs.map(doc => ({ id: doc.data().userId || doc.id, ...doc.data() }));
  const selfMember = data.members.find(member => member.id === user.uid);
  if (selfMember) profile.role = selfMember.role;
  await Promise.all(CLAN_COLLECTIONS.map(async key => { const constraints = [fs.where("clanId", "==", profile.clanId)]; if (key === "notifications") constraints.push(fs.where("userId", "==", user.uid)); const query = fs.query(fs.collection(db, key), ...constraints); data[key] = (await fs.getDocs(query)).docs.map(doc => ({ id: doc.id, ...doc.data() })); }));
  return data;
}

export async function syncFirebaseWorkspace(config, state) {
  if (state.mode !== "firebase" || !state.profile?.id || !state.clan?.id) return;
  const { db, firestoreSdk: fs } = await initializeFirebase(config);
  await fs.setDoc(fs.doc(db, "users", state.profile.id), { nickname: state.profile.nickname, email: state.profile.email || "", clanId: state.clan.id, role: state.profile.role }, { merge: true });
  const { id: clanId, ...clan } = state.clan;
  const isAdmin = ["owner","admin"].includes(state.profile.role);
  if (isAdmin) {
    await fs.setDoc(fs.doc(db, "clans", clanId), clan, { merge: true });
    if (state.clan.inviteCode) await fs.setDoc(fs.doc(db, "clanInvites", state.clan.inviteCode), { clanId, active: true, createdBy: state.clan.ownerId, createdAt: state.clan.updatedAt || now() }, { merge: true });
    await Promise.all(state.members.map(member => { const { id: userId, ...values } = member; return fs.setDoc(fs.doc(db, "clanMembers", `${clanId}_${userId}`), { ...values, clanId, userId }, { merge: true }); }));
  } else {
    const selfMember = state.members.find(member => member.id === state.profile.id);
    if (selfMember) { const { id:userId, ...values } = selfMember; await fs.setDoc(fs.doc(db, "clanMembers", `${clanId}_${userId}`), { ...values, clanId, userId }, { merge:true }); }
  }
  const canWrite = (key, entry) => isAdmin || ({ inventories:"userId", requests:"creatorId", requestContributions:"userId", tutorials:"authorId", activities:"userId", notifications:"userId" }[key] ? entry[{ inventories:"userId", requests:"creatorId", requestContributions:"userId", tutorials:"authorId", activities:"userId", notifications:"userId" }[key]] === state.profile.id : key === "trades" && [entry.creatorId,entry.accepterId].includes(state.profile.id));
  for (const key of CLAN_COLLECTIONS) {
    const base = key === "items" ? (state[key] || []).filter(item => item.sourceKind !== "wiki") : (state[key] || []);
    const current = base.filter(entry => canWrite(key, entry));
    const query = fs.query(fs.collection(db, key), fs.where("clanId", "==", clanId));
    const remote = await fs.getDocs(query);
    const currentIds = new Set(current.map(entry => entry.id));
    if (key !== "activities") await Promise.all(remote.docs.filter(doc => canWrite(key, doc.data()) && !currentIds.has(doc.id)).map(doc => fs.deleteDoc(doc.ref)));
    await Promise.all(current.map(entry => { const { id, ...values } = entry; return fs.setDoc(fs.doc(db, key, id), { ...values, clanId }, { merge: true }); }));
  }
}

export async function createFirebaseClan(config, user, values) {
  const { db, firestoreSdk: fs } = await initializeFirebase(config);
  const clanId = uid("clan"); const memberId = `${clanId}_${user.uid}`;
  const clan = { name: values.name, tag: values.tag.toUpperCase(), description: values.description || "", ownerId: user.uid, inviteCode: `${values.tag.toUpperCase()}-${uid().slice(-6).toUpperCase()}`, createdAt: now(), updatedAt: now() };
  await fs.setDoc(fs.doc(db, "clans", clanId), clan);
  await fs.setDoc(fs.doc(db, "clanInvites", clan.inviteCode), { clanId, active: true, createdBy: user.uid, createdAt: now() });
  await fs.setDoc(fs.doc(db, "clanMembers", memberId), { clanId, userId: user.uid, nickname: user.displayName || "Sobrevivente", role: "owner", joinedAt: now(), lastActiveAt: now() });
  await fs.setDoc(fs.doc(db, "users", user.uid), { nickname: user.displayName || "Sobrevivente", email: user.email, clanId, role: "owner" }, { merge: true });
  return clanId;
}

export async function joinFirebaseClan(config, user, inviteCode) {
  const { db, firestoreSdk: fs } = await initializeFirebase(config);
  const code = inviteCode.trim().toUpperCase();
  const invite = await fs.getDoc(fs.doc(db, "clanInvites", code));
  if (!invite.exists() || !invite.data().active) throw new Error("Código de convite não encontrado.");
  const clanId = invite.data().clanId; const memberId = `${clanId}_${user.uid}`;
  await fs.setDoc(fs.doc(db, "clanMembers", memberId), { clanId, userId: user.uid, nickname: user.displayName || "Sobrevivente", role: "member", inviteCode: code, joinedAt: now(), lastActiveAt: now() });
  await fs.setDoc(fs.doc(db, "users", user.uid), { nickname: user.displayName || "Sobrevivente", email: user.email, clanId, role: "member" }, { merge: true });
  return clanId;
}
