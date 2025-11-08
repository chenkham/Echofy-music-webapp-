// Puter.js Authentication Service
// Puter provides cloud storage and authentication
// Note: Puter.js uses a different auth model - we'll use it primarily for cloud storage
// and sync user data across devices

// Puter is loaded dynamically when needed
// Declare the global puter object
declare const puter: any;

// Initialize Puter
let puterInitialized = false;
let puterLoading = false;

// Load Puter.js script dynamically
const loadPuterScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof puter !== "undefined") {
      resolve();
      return;
    }

    // Check if already loading
    if (puterLoading) {
      const checkInterval = setInterval(() => {
        if (typeof puter !== "undefined") {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    puterLoading = true;

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => {
      puterLoading = false;
      resolve();
    };
    script.onerror = () => {
      puterLoading = false;
      reject(new Error("Failed to load Puter.js"));
    };
    document.head.appendChild(script);
  });
};

export const initializePuter = async () => {
  if (puterInitialized) return true;

  try {
    // Load Puter script if not already loaded
    await loadPuterScript();

    // Check if puter is available
    if (typeof puter === "undefined") {
      console.warn("Puter.js not loaded");
      return false;
    }

    puterInitialized = true;
    console.log("✅ Puter.js loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Puter:", error);
    return false;
  }
};

// Sign in to Puter (opens Puter auth dialog)
export const puterSignIn = async () => {
  try {
    await initializePuter();

    // Puter signIn opens a dialog for the user to authenticate
    const result = await puter.auth.signIn();
    return result;
  } catch (error: any) {
    console.error("Puter sign in error:", error);
    throw new Error(error.message || "Failed to sign in to Puter");
  }
};

// Get current Puter user
export const getPuterUser = async () => {
  try {
    await initializePuter();
    const user = await puter.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
};

// Sign out from Puter
export const puterSignOut = async () => {
  try {
    await puter.auth.signOut();
  } catch (error) {
    console.error("Puter sign out error:", error);
  }
};

// Store user playlists in Puter cloud storage (for sync across devices)
export const syncPlaylistsToPuter = async (
  userId: string,
  playlists: any[]
) => {
  try {
    if (typeof puter === "undefined") {
      console.warn("Puter not available for sync");
      return;
    }
    await puter.kv.set(`playlists:${userId}`, JSON.stringify(playlists));
    console.log("Playlists synced to Puter cloud");
  } catch (error) {
    console.warn("Failed to sync playlists to Puter:", error);
  }
};

// Get user playlists from Puter cloud storage
export const getPlaylistsFromPuter = async (userId: string) => {
  try {
    if (typeof puter === "undefined") {
      return null;
    }
    const data = await puter.kv.get(`playlists:${userId}`);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.warn("Failed to get playlists from Puter:", error);
    return null;
  }
};

// Store user favorites in Puter cloud storage
export const syncFavoritesToPuter = async (
  userId: string,
  favorites: any[]
) => {
  try {
    if (typeof puter === "undefined") {
      console.warn("Puter not available for sync");
      return;
    }
    await puter.kv.set(`favorites:${userId}`, JSON.stringify(favorites));
    console.log("Favorites synced to Puter cloud");
  } catch (error) {
    console.warn("Failed to sync favorites to Puter:", error);
  }
};

// Get user favorites from Puter cloud storage
export const getFavoritesFromPuter = async (userId: string) => {
  try {
    const data = await puter.kv.get(`favorites:${userId}`);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error("Failed to get favorites from Puter:", error);
    return null;
  }
};
