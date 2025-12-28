# 📱 Project 83120 - Mobile Client

> **"We Believe in Privacy & Anonymity"**

**Secure P2P Chat with End-to-End Encryption**

A React Native (Expo) mobile app for private peer-to-peer communication with PGP + AES encryption.

[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green)](./LICENSE)
[![Privacy First](https://img.shields.io/badge/Privacy-First-blue)](../PRIVACY_POLICY.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Building](#-building)
- [Architecture](#-architecture)
- [Development Status](#-development-status)
- [Contributing](#-contributing)
- [Legal](#-legal)

---

## ✅ Features

### Security

- 🔐 **PGP Key Exchange** - Secure key exchange on connection
- 🔒 **AES-256 Session Keys** - Per-session message encryption
- 🛡️ **Local Storage Encryption** - Messages encrypted at rest
- 🔑 **Derived Keys** - Keys derived from email + birthday

### Connectivity

- 🌐 **Online Mode** - WebRTC P2P via Handshaker signaling
- 📶 **Offline Mode** - Local network discovery (planned)
- 🔄 **Auto-reconnect** - Automatic connection recovery

### User Experience

- 📱 **Cross-platform** - iOS & Android support
- 🎨 **Modern UI** - Dark theme with smooth animations
- 👤 **User Search** - Find users by @username
- ✉️ **Connection Requests** - Request/Accept flow

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Android Studio (for Android) / Xcode (for iOS)
- Expo account: `npx expo login`

### 1. Clone & Install

```bash
cd project-83120-f-mobile
npm install
```

### 2. Configure Server

Edit `src/config.ts`:

```typescript
export const API_BASE_URL = "http://YOUR_SERVER_IP:8000";
```

### 3. Start Backend

```bash
cd ../project-83120-handshaker
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

### 4. Run App

```bash
# Development (Expo Go - limited features)
npx expo start

# Development Build (full features including WebRTC)
npx expo prebuild
npx expo run:android
```

---

## 🔨 Building

### Development APK (with DevTools)

```bash
# Generate native projects
npx expo prebuild --clean

# Create local.properties (Android)
echo "sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk" > android/local.properties

# Build APK
cd android
gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Build (EAS)

```bash
# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

---

## 🏗 Architecture

### Project Structure

```
src/
├── config.ts              # API & crypto configuration
├── types/                 # TypeScript interfaces
│   └── index.ts
├── screens/
│   ├── AuthScreen.tsx     # Login/Register/Forgot Password
│   ├── HomeScreen.tsx     # Chat list & user search
│   └── ChatScreen.tsx     # P2P chat interface
├── components/
│   └── ConnectionRequestModal.tsx
├── services/
│   ├── api.ts             # HTTP client (Axios)
│   ├── webrtc.ts          # WebRTC connection manager
│   ├── localNetwork.ts    # Offline P2P (planned)
│   └── crypto/
│       ├── pgp.ts         # PGP encryption
│       └── aes.ts         # AES session encryption
└── stores/
    ├── authStore.ts       # Authentication state
    └── appStore.ts        # App state (chats, connections)
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    Mobile Client                     │
├─────────────────────────────────────────────────────┤
│  AuthScreen → authStore → API → Handshaker          │
│                                                      │
│  HomeScreen → api.searchUsers() → Connection List   │
│            → Connection Requests → Accept/Reject    │
│                                                      │
│  ChatScreen → webrtcManager.connect()               │
│            → Signaling via Handshaker               │
│            → Direct P2P (WebRTC DataChannel)        │
│            → AES encrypted messages                 │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Development Status

### ✅ Completed

- [x] User registration & login
- [x] JWT token management
- [x] Password reset with OTP
- [x] User search functionality
- [x] Connection request system
- [x] Chat UI with encryption indicator
- [x] WebRTC signaling (offer/answer/ICE)
- [x] PGP key generation & exchange
- [x] AES session key generation
- [x] End session button
- [x] SafeAreaView for proper layout

### 🔄 In Progress

- [ ] WebRTC P2P connection (ICE/TURN issues)
- [ ] Message encryption/decryption
- [ ] Background service (daemon mode)

### 📋 Planned

- [ ] TURN server setup (Cloudflare/Coturn)
- [ ] Auto-connect on app start
- [ ] Online/offline status
- [ ] File transfer
- [ ] Local storage for messages
- [ ] Push notifications
- [ ] Auto-start on boot
- [ ] Profile screen with exit button

---

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test on device/emulator
5. Submit a pull request

### Code Style

- Use TypeScript with proper types
- Use functional components with hooks
- Follow React Native best practices
- Use Zustand for state management

### Testing

```bash
# Type checking
npx tsc --noEmit

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Common Issues

**WebRTC not found:**

- Use development build, not Expo Go
- Run `npx expo prebuild --clean`

**Build on Windows path issues:**

- Build on a path without spaces (e.g., `E:\project`)
- Create `local.properties` with correct SDK path

**Connection fails:**

- Check if both devices on same network
- TURN server needed for cross-network

### Reporting Issues

Please include:

- Device model & OS version
- Steps to reproduce
- Console logs (shake device → Debug)
- Expected vs actual behavior

---

## 🔧 Environment Setup

### 🪟 Windows Setup

#### 1. Install Node.js

```powershell
# Download from https://nodejs.org/ (LTS version 18+)
# Or use winget:
winget install OpenJS.NodeJS.LTS
```

#### 2. Install Android Studio

1. Download from https://developer.android.com/studio
2. Run installer, select "Android SDK" and "Android SDK Platform"
3. Open Android Studio → SDK Manager → Install:
   - Android 14 (API 34)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools

#### 3. Set Environment Variables

```powershell
# Add to System Environment Variables:
ANDROID_HOME = C:\Users\YOUR_USER\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

#### 4. Install Project

```powershell
cd project-83120-f-mobile
npm install
npx expo prebuild

# Create local.properties (if not exists)
echo sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk > android\local.properties

# Build APK
cd android
gradlew assembleDebug
```

#### 5. Windows-Specific Notes

> ⚠️ **Path Issues**: Build on a path WITHOUT spaces (e.g., `E:\project` not `D:\My Documents\project`)

---

### 🐧 Linux Setup (Ubuntu/Debian)

#### 1. Install Node.js

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # v18.x.x
npm --version
```

#### 2. Install Android Studio

```bash
# Download from https://developer.android.com/studio
# Or use snap:
sudo snap install android-studio --classic

# Open Android Studio → SDK Manager → Install:
# - Android 14 (API 34)
# - Android SDK Build-Tools 34.0.0
# - Android SDK Command-line Tools
```

#### 3. Install Java JDK

```bash
sudo apt install openjdk-17-jdk
java -version
```

#### 4. Set Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Reload
source ~/.bashrc
```

#### 5. Install Project

```bash
cd project-83120-f-mobile
npm install
npx expo prebuild
npx expo run:android
```

#### 6. Linux-Specific Notes

```bash
# If you get permission errors:
sudo chown -R $USER:$USER ~/.android
sudo chown -R $USER:$USER ~/Android

# For USB debugging:
sudo apt install android-tools-adb
adb devices
```

---

### 🍎 macOS Setup

#### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js

```bash
brew install node@18
```

#### 3. Install Android Studio (for Android builds)

```bash
brew install --cask android-studio

# Open Android Studio → SDK Manager → Install:
# - Android 14 (API 34)
# - Android SDK Build-Tools 34.0.0
```

#### 4. Install Xcode (for iOS builds)

```bash
# Install from Mac App Store
# Or:
xcode-select --install

# Accept license
sudo xcodebuild -license accept

# Install CocoaPods
sudo gem install cocoapods
```

#### 5. Set Environment Variables

```bash
# Add to ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload
source ~/.zshrc
```

#### 6. Install Project

```bash
cd project-83120-f-mobile
npm install
npx expo prebuild

# For Android
npx expo run:android

# For iOS
cd ios && pod install && cd ..
npx expo run:ios
```

#### 7. macOS-Specific Notes

```bash
# If CocoaPods fails:
sudo arch -x86_64 gem install ffi
arch -x86_64 pod install

# For M1/M2 Macs, use Rosetta terminal for some commands
```

---

## 📄 License

MIT License - See LICENSE file for details.

---

## ⚖️ Legal

- [Terms of Service](../TERMS_OF_SERVICE.md)
- [Privacy Policy](../PRIVACY_POLICY.md)
- [Roadmap](../ROADMAP.md)

---

## 🔗 Related

- [Handshaker Server](../project-83120-handshaker) - Backend signaling server
- [Roadmap](../ROADMAP.md) - Feature status & vision
- [WebRTC Docs](https://webrtc.org/getting-started/overview) - WebRTC reference
- [Expo Docs](https://docs.expo.dev) - Expo framework documentation

---

_"Your privacy is not our product. It's our promise."_
