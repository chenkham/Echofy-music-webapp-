import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Camera,
  Edit2,
  Save,
  X,
  Mail,
  Check,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import {
  updateUserProfile,
  signOutUser,
  linkGoogleAccount,
} from "../services/firebaseAuth";
import { puterSignIn } from "../services/puterAuth";
import toast from "react-hot-toast";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || "");
  const [linkedAccounts, setLinkedAccounts] = useState({
    email: false,
    google: false,
    puter: false,
  });

  // Default avatar options
  const defaultAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  ];

  // Check linked accounts on mount
  useEffect(() => {
    if (user) {
      // Check which accounts are linked
      setLinkedAccounts({
        email: !!user.email,
        google: user.providers?.includes("google.com") || false,
        puter: user.providers?.includes("puter") || false,
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        bio,
        isPublic,
        photoURL: selectedAvatar,
      });

      // Update local user state
      setUser({
        ...user,
        displayName,
        bio,
        isPublic,
        photoURL: selectedAvatar,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await linkGoogleAccount();
      toast.success("Google account linked successfully!");
      setLinkedAccounts((prev) => ({ ...prev, google: true }));
    } catch (error: any) {
      console.error("Failed to link Google:", error);
      toast.error(error.message || "Failed to link Google account");
    }
  };

  const handleLinkPuter = async () => {
    try {
      await puterSignIn();
      toast.success("Puter account linked successfully!");
      setLinkedAccounts((prev) => ({ ...prev, puter: true }));
    } catch (error: any) {
      console.error("Failed to link Puter:", error);
      toast.error(error.message || "Failed to link Puter account");
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      logout();
      toast.success("Logged out successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout");
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel - Responsive */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[90%] md:w-[480px] lg:w-[520px] glass-dark border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto safe-area-inset ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/50">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <User size={40} className="text-text-muted" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Camera size={20} className="text-black" />
                  </button>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-4 text-center">
                {user.displayName}
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                @{user.username}
              </p>
            </div>

            {/* Avatar Selection (when editing) */}
            {isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                  {defaultAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatar === avatar
                          ? "border-primary scale-110"
                          : "border-white/20 hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
                    placeholder="Your display name"
                  />
                ) : (
                  <p className="text-base sm:text-lg">{user.displayName}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <p className="text-base sm:text-lg text-text-secondary break-all">
                  {user.email}
                </p>
              </div>

              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <p className="text-base sm:text-lg text-text-secondary">
                  @{user.username}
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm sm:text-base"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={200}
                  />
                ) : (
                  <p className="text-base sm:text-lg">
                    {user.bio || "No bio yet"}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-text-secondary mt-1">
                    {bio.length}/200 characters
                  </p>
                )}
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl">
                <div className="flex-1 mr-3">
                  <p className="font-medium text-sm sm:text-base">
                    Public Profile
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Allow others to find you
                  </p>
                </div>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0 ${
                      user.isPublic
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {user.isPublic ? "Public" : "Private"}
                  </span>
                )}
              </div>

              {/* Linked Accounts Section */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Linked Accounts
                </label>
                <div className="space-y-3">
                  {/* Email/Password */}
                  <div className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          Email/Password
                        </p>
                        <p className="text-xs text-text-secondary">
                          Sign in with email
                        </p>
                      </div>
                    </div>
                    {linkedAccounts.email ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm ml-2 flex-shrink-0">
                        <Check size={16} />
                        <span className="hidden sm:inline">Linked</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-sm ml-2 flex-shrink-0">
                        <Check size={16} />
                        <span className="hidden sm:inline">Linked</span>
                      </span>
                    )}
                  </div>

                  {/* Google */}
                  <div className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          Google
                        </p>
                        <p className="text-xs text-text-secondary">
                          Sign in with Google
                        </p>
                      </div>
                    </div>
                    {linkedAccounts.google ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Check size={16} />
                        <span className="hidden sm:inline">Linked</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleLinkGoogle}
                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm transition-colors"
                      >
                        Link
                      </button>
                    )}
                  </div>

                  {/* Puter */}
                  <div className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6" />
                          <path
                            d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
                            fill="#60A5FA"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          Puter
                        </p>
                        <p className="text-xs text-text-secondary">
                          Cloud storage sync
                        </p>
                      </div>
                    </div>
                    {linkedAccounts.puter ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Check size={16} />
                        <span className="hidden sm:inline">Linked</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleLinkPuter}
                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm transition-colors"
                      >
                        Link
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Member Since
                </label>
                <p className="text-base sm:text-lg text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 py-2.5 sm:py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName);
                      setBio(user.bio || "");
                      setIsPublic(user.isPublic);
                      setSelectedAvatar(user.photoURL || "");
                    }}
                    className="px-6 py-2.5 sm:py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-2.5 sm:py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="glass rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-text-secondary mt-1 sm:mt-2 text-xs sm:text-sm">
                Playlists
              </p>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-text-secondary mt-1 sm:mt-2 text-xs sm:text-sm">
                Favorites
              </p>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-text-secondary mt-1 sm:mt-2 text-xs sm:text-sm">
                Followers
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
