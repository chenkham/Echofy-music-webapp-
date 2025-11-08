import { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  isValidEmail,
  requestOTP,
  verifyOTP,
} from "../../services/emailService";
import {
  isUsernameAvailable,
  signUpWithEmail,
  signInWithGoogle,
} from "../../services/firebaseAuth";
import { useAuthStore } from "../../store/useAuthStore";
import {
  initializePuter,
  syncPlaylistsToPuter,
  puterSignIn,
} from "../../services/puterAuth";
import toast from "react-hot-toast";

interface SignUpProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

type SignUpStep = "email" | "otp" | "password" | "profile";

export default function SignUp({ onClose, onSwitchToSignIn }: SignUpProps) {
  const [step, setStep] = useState<SignUpStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const { setUser } = useAuthStore();

  // Step 1: Validate and send OTP to email
  const handleEmailSubmit = async () => {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const sent = await requestOTP(email);
      if (sent) {
        toast.success("OTP sent to your email! Check your inbox.");
        setStep("otp");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const isValid = verifyOTP(email, otp);
      if (isValid) {
        toast.success("Email verified successfully!");
        setStep("password");
      } else {
        toast.error("Invalid or expired OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set password
  const handlePasswordSubmit = () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStep("profile");
  };

  // Check username availability
  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);

    if (cleaned.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const available = await isUsernameAvailable(cleaned);
      setUsernameAvailable(available);
    } catch (error) {
      console.error("Failed to check username:", error);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Step 4: Complete profile and create account
  const handleSignUp = async () => {
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!usernameAvailable) {
      toast.error("Username is already taken");
      return;
    }

    if (!displayName || displayName.length < 2) {
      toast.error("Display name must be at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      // Create Firebase account
      const user = await signUpWithEmail(
        email,
        password,
        displayName,
        username
      );

      // Initialize Puter for cloud sync
      await initializePuter();
      await syncPlaylistsToPuter(user.uid, []); // Initialize empty playlists

      // Set user in auth store
      setUser(user);

      toast.success(`Welcome, ${displayName}! 🎉`);
      onClose();
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const sent = await requestOTP(email);
      if (sent) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error("Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Puter Sign Up
  const handlePuterSignUp = async () => {
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
        toast.success(`Welcome, ${user.displayName}! 🎉`);
        onClose();
      }
    } catch (error: any) {
      console.error("Puter sign up error:", error);
      toast.error(error.message || "Failed to sign up with Puter");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();

      // Initialize Puter for cloud sync
      await initializePuter();
      await syncPlaylistsToPuter(user.uid, []);

      setUser(user);
      toast.success(`Welcome, ${user.displayName}! 🎉`);
      onClose();
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast.error(error.message || "Failed to sign up with Google");
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
                mixBlendMode: "screen",
                filter: "contrast(1.2) saturate(1.3)",
              }}
            />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
            Join Echofy
          </h2>
          <p className="text-text-secondary">
            Step{" "}
            {step === "email"
              ? "1"
              : step === "otp"
              ? "2"
              : step === "password"
              ? "3"
              : "4"}{" "}
            of 4
          </p>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
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
                  onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Continue"}
              <ArrowRight size={20} />
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

            {/* Alternative Sign Up Options */}
            <div className="space-y-3">
              <button
                onClick={handlePuterSignUp}
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
                <span className="font-medium">Sign up with Puter</span>
              </button>

              <button
                onClick={handleGoogleSignUp}
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
                <span className="font-medium">Sign up with Google</span>
              </button>
            </div>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <button
                onClick={onSwitchToSignIn}
                className="text-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <p className="text-sm text-text-secondary mb-4">
                We sent a 6-digit code to {email}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyPress={(e) => e.key === "Enter" && handleOTPSubmit()}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 glass rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("email")}
                className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={handleOTPSubmit}
                disabled={loading || otp.length !== 6}
                className="flex-1 py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>

            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-sm text-primary hover:underline"
            >
              Resend Code
            </button>
          </div>
        )}

        {/* Step 3: Password */}
        {step === "password" && (
          <div className="space-y-6">
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
                  placeholder="At least 6 characters"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handlePasswordSubmit()
                  }
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("otp")}
                className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Profile */}
        {step === "profile" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  className="w-full pl-12 pr-12 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {usernameChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
                {!usernameChecking && usernameAvailable !== null && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameAvailable ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <X size={20} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSignUp()}
                  placeholder="Your Name"
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("password")}
                className="px-6 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                onClick={handleSignUp}
                disabled={loading || !usernameAvailable || !displayName}
                className="flex-1 py-3 bg-primary text-black rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <Check size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
