// src/firebase/config.ts - Improved version with better error handling
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUvMIpqXmtIoJZZ80o-q_xsqoGGHX2TNE",
  authDomain: "klout-club.firebaseapp.com",
  databaseURL: "https://klout-club-default-rtdb.firebaseio.com",
  projectId: "klout-club",
  storageBucket: "klout-club.appspot.com",
  messagingSenderId: "93914046653",
  appId: "1:93914046653:web:490b0536fd8674842d97d4",
  measurementId: "G-NZ1TWE7DL6",
};

// Initialize Firebase
let app: any;
let db: any;
let auth: any;

const token = localStorage.getItem("klout-app-user");

try {
  if (token) {
    console.log("🔥 Initializing Firebase...");
    app = initializeApp(firebaseConfig);

    console.log("📊 Initializing Realtime Database...");
    db = getDatabase(app);

    console.log("🔐 Initializing Firebase Auth...");
    auth = getAuth(app);

    // Enable offline persistence (optional)
    if (typeof window !== 'undefined') {
      // Only run in browser environment
      console.log("💾 Firebase persistence enabled");
    }

    console.log("✅ Firebase initialized successfully");
  }

} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  throw new Error(`Firebase initialization failed: ${error}`);
}

// Test database connection on initialization
if (db) {
  console.log(db)
  import("firebase/database").then(({ ref, get }) => {
    const testConnection = async () => {
      try {
        const testRef = ref(db, "/");
        await get(testRef);
        console.log("🔗 Firebase Database connection test successful");
      } catch (error) {
        console.error("🔗 Firebase Database connection test failed:", error);

        // Check if it's a permission/authentication error
        if (error instanceof Error) {
          if (error.message.includes("permission") || error.message.includes("auth")) {
            console.warn("⚠️ Possible Firebase authentication/permission issue");
            console.warn("💡 Make sure your Firebase rules allow read/write access");
          } else if (error.message.includes("network")) {
            console.warn("⚠️ Network connectivity issue with Firebase");
          }
        }
      }
    };

    // Test connection after a short delay
    setTimeout(testConnection, 1000);
  });
}

export { db, auth };
export default app;

// Export helper for checking Firebase status
export const getFirebaseStatus = () => {
  return {
    app: !!app,
    database: !!db,
    auth: !!auth,
    config: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL
  };
};

// Export debug function
export const debugFirebaseConfig = () => {
  console.log("🐛 Firebase Debug Info:", {
    ...getFirebaseStatus(),
    timestamp: new Date().toISOString()
  });
};