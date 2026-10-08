export const FIREBASE_SDK_VERSION = "12.19.0";
export async function loadFirebaseConfig() {
  try {
    const module = await import("./firebase/firebase-config.js");
    const config = module.firebaseConfig || module.default;
    const configured = config && config.apiKey && !String(config.apiKey).includes("SUA_");
    return configured ? config : null;
  } catch { return null; }
}
