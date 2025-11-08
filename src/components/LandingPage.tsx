import {
  Music,
  Search,
  Download,
  Heart,
  Users,
  TrendingUp,
} from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export default function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  const features = [
    {
      icon: Search,
      title: "Search & Discover",
      description: "Find millions of songs, albums, and artists from JioSaavn",
    },
    {
      icon: Heart,
      title: "Create Playlists",
      description:
        "Build your perfect playlist and organize your favorite tracks",
    },
    {
      icon: Download,
      title: "Download Music",
      description:
        "Download songs in multiple quality options from 12kbps to 320kbps",
    },
    {
      icon: Music,
      title: "High Quality Audio",
      description:
        "Stream music in the best quality with our advanced audio player",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 via-background to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 flex items-center justify-center">
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
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
            Welcome to Echofy
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed">
            Stream millions of songs, create playlists, and enjoy high-quality music streaming. All in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignUp}
              className="px-8 py-4 bg-primary text-black rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-neon"
            >
              Get Started Free
            </button>
            <button
              onClick={onSignIn}
              className="px-8 py-4 glass rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
            Start Your Music Journey
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of music lovers on Echofy
          </p>
          <button
            onClick={onSignUp}
            className="px-10 py-5 bg-primary text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-neon"
          >
            Sign Up Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-text-secondary">
          <p>&copy; 2025 Echofy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
