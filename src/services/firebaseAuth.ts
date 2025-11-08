import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  linkWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../config/firebase.config";
import { User } from "../types";

// Validate Firebase config
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("XXX")) {
  console.error("❌ Firebase config is not set up properly!");
  console.error(
    "📝 Please update src/config/firebase.config.ts with your actual Firebase credentials"
  );
  console.error("📖 See GET_FIREBASE_CONFIG.md for instructions");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("❌ Failed to set auth persistence:", error);
});

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Create user profile in Firestore
export const createUserProfile = async (
  firebaseUser: FirebaseUser,
  additionalData: { displayName: string; username: string }
): Promise<User> => {
  const userRef = doc(db, "users", firebaseUser.uid);

  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: additionalData.displayName,
    username: additionalData.username,
    photoURL: firebaseUser.photoURL || undefined,
    bio: "",
    createdAt: Date.now(),
    isPublic: true,
  };

  await setDoc(userRef, user);
  return user;
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }

    return null;
  } catch (error: any) {
    console.error("Error reading user profile:", error);

    if (error.code === "permission-denied") {
      console.error("Firestore permission error. Please check database rules.");
    }

    throw error;
  }
};

// Check if username is available
export const isUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<User> => {
  // Check if username is available
  const available = await isUsernameAvailable(username);
  if (!available) {
    throw new Error("Username is already taken");
  }

  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update display name
  await updateProfile(userCredential.user, { displayName });

  // Create user profile in Firestore
  const user = await createUserProfile(userCredential.user, {
    displayName,
    username: username.toLowerCase(),
  });

  return user;
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Get user profile from Firestore
  const user = await getUserProfile(userCredential.user.uid);

  if (!user) {
    throw new Error("User profile not found");
  }

  return user;
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Update user profile
export const updateUserProfile = async (
  uid: string,
  updates: Partial<User>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
};

// Search users by username
export const searchUsers = async (searchQuery: string): Promise<User[]> => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("username", ">=", searchQuery.toLowerCase()),
    where("username", "<=", searchQuery.toLowerCase() + "\uf8ff")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map((doc) => doc.data() as User)
    .filter((user) => user.isPublic);
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    console.log("🔍 Checking if user profile exists for:", firebaseUser.uid);

    // Check if user profile exists
    let user: User | null = null;

    try {
      user = await getUserProfile(firebaseUser.uid);
    } catch (error: any) {
      console.warn(
        "⚠️ Could not read user profile, will create new one:",
        error.code
      );
      user = null;
    }

    if (!user) {
      const emailUsername = firebaseUser.email?.split("@")[0] || "user";
      let username = emailUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");

      let counter = 1;
      try {
        let isAvailable = await isUsernameAvailable(username);
        while (!isAvailable) {
          username = `${emailUsername}${counter}`;
          isAvailable = await isUsernameAvailable(username);
          counter++;
        }
      } catch (error) {
        console.warn("Could not check username availability");
        username = `${emailUsername}_${Date.now()}`;
      }
      try {
        user = await createUserProfile(firebaseUser, {
          displayName: firebaseUser.displayName || emailUsername,
          username,
        });
        console.log("✅ User profile created successfully!");
      } catch (error: any) {
        console.error("❌ Failed to create user profile:", error);

        // If we can't create profile due to permissions, return minimal user object
        if (error.code === "permission-denied") {
          console.warn("⚠️ Using temporary profile due to permission issues");
          user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || emailUsername,
            username: username,
            photoURL: firebaseUser.photoURL || undefined,
            bio: "",
            createdAt: Date.now(),
            isPublic: true,
          };
        } else {
          throw error;
        }
      }
    } else {
      console.log("✅ Existing user profile loaded");
    }

    return user;
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign in cancelled");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Popup blocked. Please allow popups for this site.");
    }
    throw error;
  }
};

// Link Google account to current user
export const linkGoogleAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  try {
    await linkWithPopup(user, googleProvider);
  } catch (error: any) {
    if (error.code === "auth/provider-already-linked") {
      throw new Error("Google account is already linked");
    } else if (error.code === "auth/credential-already-in-use") {
      throw new Error("This Google account is already linked to another user");
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign in cancelled");
    }
    throw error;
  }
};

// Link Email/Password to current user
export const linkEmailAccount = async (
  _email: string,
  _password: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  // Email linking not fully implemented - requires EmailAuthProvider
  throw new Error("Email account linking not available yet");
};
