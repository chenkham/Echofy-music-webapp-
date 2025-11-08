// Use global puter from CDN
declare const puter: any;

class AuthService {
  private initialized = false;

  async init() {
    if (this.initialized) return;

    try {
      if (typeof puter === "undefined") {
        console.log("Puter not available, skipping auth");
        return;
      }
      // Initialize Puter
      await puter.auth.signIn();
      this.initialized = true;
      console.log("Puter authentication initialized");
    } catch (error) {
      console.error("Failed to initialize Puter auth:", error);
    }
  }

  async getUser() {
    try {
      if (typeof puter === "undefined") return null;
      const user = await puter.auth.getUser();
      return user;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (typeof puter === "undefined") return false;
      const user = await puter.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  async signIn() {
    try {
      if (typeof puter === "undefined") return false;
      await puter.auth.signIn();
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  }

  async signOut() {
    try {
      if (typeof puter === "undefined") return false;
      await puter.auth.signOut();
      return true;
    } catch (error) {
      console.error("Sign out failed:", error);
      return false;
    }
  }

  // Store user preferences
  async saveUserData(key: string, data: any) {
    try {
      if (typeof puter === "undefined") {
        console.log("Puter not available, skipping cloud save");
        return false;
      }
      await puter.kv.set(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save user data:", error);
      return false;
    }
  }

  // Retrieve user preferences
  async getUserData(key: string) {
    try {
      if (typeof puter === "undefined") {
        return null;
      }
      const data = await puter.kv.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }

  // Sync favorites to cloud
  async syncFavorites(favorites: any[]) {
    return this.saveUserData("music_favorites", favorites);
  }

  // Get favorites from cloud
  async getFavorites() {
    return this.getUserData("music_favorites");
  }

  // Sync playlists to cloud
  async syncPlaylists(playlists: any[]) {
    return this.saveUserData("music_playlists", playlists);
  }

  // Get playlists from cloud
  async getPlaylists() {
    return this.getUserData("music_playlists");
  }

  // Sync listening history
  async syncHistory(history: any[]) {
    return this.saveUserData("music_history", history);
  }

  // Get listening history
  async getHistory() {
    return this.getUserData("music_history");
  }
}

export const authService = new AuthService();
