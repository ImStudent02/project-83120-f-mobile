# Project 83120 - Mobile Client

Secure P2P Chat with End-to-End Encryption.

## Features

- 🔒 PGP + AES encryption
- 🌐 Online mode (WebRTC via Handshaker)
- 📶 Offline mode (Local network discovery)
- 📱 Works on iOS & Android

---

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- Android Studio / Xcode
- EAS CLI: `npm install -g eas-cli`
- Expo account: `eas login`

### Install Dependencies

```bash
npm install
```

### Build for Development

```bash
# Generate native projects
npx expo prebuild

# Build development APK (Android)
eas build --platform android --profile development

# Or run locally
npx expo run:android
```

### Run Metro Bundler

```bash
npx expo start --dev-client
```

---

## Backend Setup

Start the Handshaker server for online mode:

```bash
cd ../project-83120-handshaker
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

Update `src/config.ts` with your server IP:

```typescript
export const API_BASE_URL = "http://YOUR_IP:8000";
```

---

## Project Structure

```
src/
├── config.ts           # API & crypto config
├── types/              # TypeScript types
├── screens/            # UI screens
├── services/
│   ├── api.ts          # HTTP client
│   ├── webrtc.ts       # Online P2P
│   ├── localNetwork.ts # Offline P2P
│   └── crypto/         # PGP + AES
└── stores/             # Zustand state
```

---

## Build for Production

```bash
eas build --platform android --profile production
```
