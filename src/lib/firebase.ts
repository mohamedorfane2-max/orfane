import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0974418377",
  appId: "1:175381025066:web:6d1553a3f276b9c9918e53",
  apiKey: "AIzaSyBHQqJgciJcJj-VTPac8VHyqx_g-1lhmSk",
  authDomain: "gen-lang-client-0974418377.firebaseapp.com",
  storageBucket: "gen-lang-client-0974418377.firebasestorage.app",
  messagingSenderId: "175381025066",
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific custom database ID
const databaseId = "ai-studio-mdftableslanding-f699cb71-2622-4e1e-9fac-465843740740";
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

export const auth = getAuth(app);
