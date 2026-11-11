import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const config = window.YildirimlarConfig;
const auth = getAuth(initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
}));
auth.languageCode = "tr";
setPersistence(auth, browserLocalPersistence).catch(() => {});
getRedirectResult(auth).catch(() => {});

const api = window.DairelerAuth = {
  user: undefined,
  google: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error && /popup-(blocked|closed-by-user)|cancelled-popup/.test(error.code)) {
        if (error.code === "auth/popup-blocked") return signInWithRedirect(auth, provider);
        return;
      }
      throw error;
    }
  },
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  token: () => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.reject(new Error("signed out")))
};

onAuthStateChanged(auth, (u) => {
  api.user = u ? { email: u.email, verified: u.emailVerified } : null;
  window.dispatchEvent(new CustomEvent("daireler-auth", { detail: api.user }));
});
