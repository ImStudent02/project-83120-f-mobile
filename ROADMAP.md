# 🚀 Project 83120 - Roadmap

> **"We Believe in Privacy & Anonymity"**

---

## 🎯 Vision

Create a **super-secure** messaging platform where:

- 🔒 No third party can interfere with your privacy
- 👁️ No one can see what you're communicating
- 🕵️ Complete anonymity - even we can't read your messages
- 🌐 Future: Deep web integration via TOR

---

## 📊 Feature Status

### Legend

- ✅ Completed
- 🔄 In Progress
- 📋 Planned
- 🔮 Future Vision

---

## 🤝 Handshaker (Signaling Server)

| Feature              | Status | Description                |
| -------------------- | ------ | -------------------------- |
| User Registration    | ✅     | Encrypted email storage    |
| JWT Authentication   | ✅     | Secure token-based auth    |
| Password Reset (OTP) | ✅     | Email-based recovery       |
| User Search          | ✅     | Find by @username          |
| PGP Key Exchange     | ✅     | Public key distribution    |
| Connection Requests  | ✅     | Request/Accept/Reject flow |
| WebRTC Signaling     | ✅     | Offer/Answer/ICE relay     |
| STUN/TURN Config     | 🔄     | Server configuration       |
| WebSocket Signaling  | 📋     | Replace polling with WS    |
| Rate Limiting        | 📋     | Prevent abuse              |
| Push Notifications   | 📋     | FCM/APNs integration       |
| TOR Hidden Service   | 🔮     | .onion domain support      |
| No-Log Policy        | 🔮     | Zero message retention     |

---

## 📱 Mobile Client

| Feature               | Status | Description                  |
| --------------------- | ------ | ---------------------------- |
| User Registration     | ✅     | Secure sign-up flow          |
| Login/Logout          | ✅     | JWT token management         |
| Password Reset        | ✅     | In-app OTP flow              |
| User Search           | ✅     | Find connections             |
| Connection Requests   | ✅     | Send/Accept/Reject           |
| Chat UI               | ✅     | Modern dark theme            |
| PGP Key Generation    | ✅     | Client-side keypair          |
| AES Session Keys      | ✅     | Per-session encryption       |
| WebRTC Integration    | 🔄     | P2P connection (TURN needed) |
| End Session Button    | ✅     | Destroy keys on exit         |
| Message Encryption    | 🔄     | E2E with AES-256             |
| Background Service    | 📋     | Daemon mode                  |
| Auto-Connect          | 📋     | Connect on accept            |
| Online/Offline Status | 📋     | User presence                |
| File Transfer         | 📋     | Encrypted P2P files          |
| Voice Messages        | 📋     | Encrypted audio              |
| Local Message Storage | 📋     | Encrypted SQLite             |
| Offline Mode          | 📋     | Local network P2P            |
| TOR Integration       | 🔮     | Route through TOR            |
| Group Chat            | 🔮     | Private group rooms          |
| Discussion Rooms      | 🔮     | Topic-based groups           |

---

## 🛣️ Development Phases

### Phase 1: Foundation ✅

- [x] Backend API setup (FastAPI + MongoDB)
- [x] Mobile app structure (React Native + Expo)
- [x] User authentication system
- [x] Connection request system

### Phase 2: Encryption 🔄

- [x] PGP key generation & exchange
- [x] AES session key generation
- [ ] Full message encryption flow
- [ ] Encrypted local storage

### Phase 3: P2P Connection 🔄

- [x] WebRTC signaling via Handshaker
- [ ] TURN server setup (Cloudflare/Coturn)
- [ ] Reliable P2P data channel
- [ ] Auto-reconnect mechanism

### Phase 4: Background & UX 📋

- [ ] Background service (Android)
- [ ] Push notifications
- [ ] Online/offline indicators
- [ ] Message read receipts

### Phase 5: Advanced Features 📋

- [ ] File transfer (encrypted)
- [ ] Voice messages
- [ ] Media sharing
- [ ] Message history search

### Phase 6: Privacy Maximum 🔮

- [ ] TOR hidden service
- [ ] .onion domain for Handshaker
- [ ] TOR-routed WebRTC
- [ ] No-log server mode

### Phase 7: Community Features 🔮

- [ ] Group chat (private rooms)
- [ ] Discussion rooms
- [ ] Invite links (encrypted)
- [ ] Group admin controls

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT A                              │
├─────────────────────────────────────────────────────────────┤
│  PGP Keypair (private never leaves device)                  │
│  AES Session Key (stored in memory only)                    │
│  Messages encrypted with AES before sending                 │
│  Local storage encrypted with derived key (email+birthday)  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    WebRTC P2P (encrypted)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                        CLIENT B                              │
│  (Same security model)                                       │
└─────────────────────────────────────────────────────────────┘

Handshaker Server:
- Only sees encrypted signaling blobs
- Cannot decrypt PGP payloads
- No message storage
- No private keys
```

---

## 🌐 Future: TOR Integration

```
Client A ──► TOR ──► Handshaker.onion ──► TOR ──► Client B
              │                                    │
              └──── Hidden from everyone ──────────┘
```

---

## 📅 Timeline (Estimated)

| Phase   | Target   | Status         |
| ------- | -------- | -------------- |
| Phase 1 | Dec 2024 | ✅ Done        |
| Phase 2 | Jan 2025 | 🔄 In Progress |
| Phase 3 | Jan 2025 | 🔄 In Progress |
| Phase 4 | Feb 2025 | 📋 Planned     |
| Phase 5 | Mar 2025 | 📋 Planned     |
| Phase 6 | Q2 2025  | 🔮 Vision      |
| Phase 7 | Q3 2025  | 🔮 Vision      |

---

_"Privacy is not about hiding something. Privacy is about being able to control what you reveal about yourself."_
