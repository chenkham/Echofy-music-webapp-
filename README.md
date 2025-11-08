# Echofy 🎵

A modern music streaming application with multi-provider authentication, built with React, TypeScript, and Tailwind CSS. Powered by Saavn API.

## Features

### 🎵 Music Streaming

- Search songs, albums, artists, and playlists
- High-quality audio streaming (96/160/320 kbps)
- Play queue management with shuffle & repeat
- Create and manage custom playlists
- Download songs with quality selection
- Lyrics display support
- Sleep timer functionality

### 🔐 Authentication

- **Google Sign-In** - Quick OAuth authentication
- **Email/Password** - Traditional signup with unique usernames
- **Puter.js** - Privacy-focused cloud authentication
- Persistent sessions across browser restarts
- User profiles with avatars and bios

### 🎨 UI/UX

- Spotify-inspired dark theme
- Responsive mobile & desktop design
- Smooth animations and transitions
- Customizable accent colors (6 themes)
- Glass morphism effects
- Real-time notifications

### 📱 Discovery

- Trending songs and artists
- Curated categories (Bollywood, English, Romantic, Party, Classic, Workout, Chill, Indie)
- Album and artist browse
- User favorites and listening history

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication & Firestore enabled
- (Optional) Puter.js account

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd react-song-app

# Install dependencies
npm install

# Add Firebase config
# Create serviceAccountKey.json in root with your Firebase credentials

# Start development server
npm run dev
```

### Firebase Setup

1. **Create Firebase Project**: [Firebase Console](https://console.firebase.google.com)

2. **Enable Authentication**:

   - Go to Authentication → Sign-in method
   - Enable Google and Email/Password providers
   - Add `localhost` to authorized domains

3. **Create Firestore Database**:

   - Go to Firestore Database → Create database
   - Start in production mode
   - Add these rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if true;
         allow create, update, delete: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Get Config**:

   - Project Settings → General → Your apps → Web app
   - Copy the config and create `src/config/firebase.config.ts`:

   ```typescript
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id",
     measurementId: "your-measurement-id",
   };
   ```

5. **Service Account** (Optional for backend):
   - Project Settings → Service Accounts → Generate new private key
   - Save as `serviceAccountKey.json` in root

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom Glass Morphism
- **State**: Zustand (global state management)
- **Auth**: Firebase Auth, Puter.js
- **Database**: Firebase Firestore
- **API**: Saavn Music API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── components/         # React components
│   ├── auth/          # Auth components (SignIn, SignUp)
│   ├── modals/        # Modal dialogs (Settings, Download)
│   └── ...            # Main UI components
├── services/          # API & Auth services
├── store/             # Zustand state stores
├── types/             # TypeScript type definitions
└── config/            # Configuration files
```

## Available Scripts

```bash
npm run dev          # Start development server (port 3001)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Settings

### Playback

- **Streaming Quality**: Low (96kbps) / Medium (160kbps) / High (320kbps)
- **Auto Play**: Automatically play next song
- **Crossfade**: 0-12 seconds transition
- **Normalize Audio**: Consistent volume across tracks
- **Show Lyrics**: Display lyrics when available
- **Download Quality**: Up to Lossless (FLAC)

### Appearance

- **Theme**: Dark / Light / Auto
- **Accent Color**: 6 color options
- **Animations**: Toggle UI transitions

## Environment Variables

Create `.env` file (optional):

```env
VITE_API_BASE_URL=https://saavn.dev
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This is a personal project. Feel free to fork and modify for your own use.

## License

MIT License - Feel free to use this project for learning or personal projects.

## Developer

**Chenkham Chowlu**

Built with ❤️ using modern web technologies.

---

**Note**: This app uses Saavn API for music streaming. Ensure you comply with their terms of service.
