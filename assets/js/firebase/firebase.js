import { FIREBASE_SDK_VERSION } from "../config.js";
let servicesPromise;
export function initializeFirebase(config) {
  if (!servicesPromise) servicesPromise = Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`)
  ]).then(([appSdk, authSdk, firestoreSdk]) => {
    const app = appSdk.initializeApp(config);
    return { app, auth: authSdk.getAuth(app), db: firestoreSdk.getFirestore(app), authSdk, firestoreSdk };
  });
  return servicesPromise;
}
