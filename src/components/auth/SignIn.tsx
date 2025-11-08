import { useState } from "react";
import { X, Mail, Lock } from "lucide-react";
import {
  signInWithEmail,
  sendPasswordReset,
  signInWithGoogle,
} from "../../services/firebaseAuth";
import { useAuthStore } from "../../store/useAuthStore";
import { initializePuter, puterSignIn } from "../../services/puterAuth";
import { isValidEmail } from "../../services/emailService";
import toast from "react-hot-toast";

interface SignInProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignIn({ onClose, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { setUser } = useAuthStore();

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      // Sign in with Firebase
      const user = await signInWithEmail(email, password);

      // Initialize Puter for cloud sync
      await initializePuter();

      // Set user in auth store
      setUser(user);

      toast.success(`Welcome back, ${user.displayName}! 🎵`);
      onClose();
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message.includes("user-not-found")) {
        toast.error("No account found with this email");
      } else if (error.message.includes("wrong-password")) {
        toast.error("Incorrect password");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isValidEmail(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  // Handle Puter Sign In
  const handlePuterSignIn = async () => {
    setLoading(true);
    try {
      const puterUser = await puterSignIn();

      if (puterUser) {
        // Create a user object from Puter data
        const user = {
          uid: puterUser.uuid,
          email: puterUser.email || "",
          displayName: puterUser.username || "Puter User",
          username:
            puterUser.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
            `puter_${puterUser.uuid.slice(0, 8)}`,
          createdAt: Date.now(),
          isPublic: true,
        };

        setUser(user);
        toast.success(`Welcome back, ${user.displayName}! 🎵`);
        onClose();
      }
    } catch (error: any) {
      console.error("Puter sign in error:", error);
      toast.error(error.message || "Failed to sign in with Puter");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();

      // Initialize Puter for cloud sync
      await initializePuter();

      setUser(user);
      toast.success(`Welcome back, ${user.displayName}! 🎵`);
      onClose();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Echofy" 
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ 
                mixBlendMode: 'screen',
                filter: 'contrast(1.2) saturate(1.3)'
              }}
            />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
            {showForgotPassword ? "Reset Password" : "Welcome to Echofy"}
          </h2>
          <p className="text-text-secondary">
            {showForgotPassword
              ? "Enter your email to receive a reset link"
              : "Sign in to continue to your music"}
          </p>
        </div>

        {/* Sign In Form */}
        {!showForgotPassword ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-dark text-text-secondary">
                  or
                </span>
              </div>
            </div>

            {/* Alternative Sign In Options */}
            <div className="space-y-3">
              <button
                onClick={handlePuterSignIn}
                disabled={loading}
                className="w-full py-3 glass rounded-xl font-semibold hover:bg-white/10 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 256 256"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="256" height="256" rx="60" fill="#3B82F6" />
                  <path
                    d="M128 48L64 80V144C64 186.4 91.2 224 128 232C164.8 224 192 186.4 192 144V80L128 48Z"
                    fill="white"
                  />
                  <path
                    d="M128 96L96 112V160C96 177.6 108.8 193.6 128 200C147.2 193.6 160 177.6 160 160V112L128 96Z"
                    fill="#3B82F6"
                  />
                </svg>
                <span className="font-medium">Sign in with Puter</span>
              </button>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 glass rounded-xl font-semibold hover:bg-white/10 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
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
                <span className="font-medium">Sign in with Google</span>
              </button>
            </div>

            <p className="text-center text-sm text-text-secondary">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignUp}
                className="text-primary hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          // Forgot Password Form
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleForgotPassword()
                  }
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-sm text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
