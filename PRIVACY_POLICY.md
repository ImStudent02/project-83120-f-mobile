# Privacy Policy

**Project 83120 - Secure P2P Messaging**

_Last Updated: December 2024_

---

## Our Commitment

> **"We Believe in Privacy & Anonymity"**

We built this service because we believe privacy is a fundamental right. This policy explains exactly what data we collect and, more importantly, what we DON'T collect.

---

## 🟢 What We Collect (Minimal)

| Data           | Purpose               | Storage                          |
| -------------- | --------------------- | -------------------------------- |
| Username       | Identity/login        | Server (plaintext)               |
| Email          | Account recovery only | Server (encrypted)               |
| Birthday       | Key derivation        | Device only                      |
| Password       | Authentication        | Server (hashed, never plaintext) |
| PGP Public Key | Key exchange          | Server (public data)             |

---

## 🔴 What We DO NOT Collect

| Data                | Reason                                               |
| ------------------- | ---------------------------------------------------- |
| Messages            | AES-256 encrypted, P2P only, never touch our servers |
| Files               | AES-256 encrypted, P2P transfer only                 |
| Private Keys        | Generated and stored on device only                  |
| Contacts            | Not tracked                                          |
| Location            | Not requested                                        |
| IP Address Logs     | Not stored long-term                                 |
| Usage Analytics     | Not tracked                                          |
| Device Fingerprints | Not collected                                        |

---

## 🔒 Encryption

### End-to-End Encryption

- All messages are encrypted on your device
- Only the recipient can decrypt
- We cannot read your messages (even if compelled)

### Key Management

- **PGP Keys**: Generated on your device
- **Private Key**: Never leaves your device
- **Session Keys**: AES-256, per-session, memory only
- **Storage Key**: Derived from email + birthday (local only)

---

## 🤝 Data Sharing

### We NEVER Share:

- Any user data with third parties
- Message content (we don't have it)
- User activity or patterns

### Exceptions (Legal):

- We may be required to provide:
  - Username existence (yes/no)
  - Encrypted email (still encrypted)
  - Account metadata (creation date)
- We CANNOT provide:
  - Messages (we don't have them)
  - Decryption keys (we don't have them)
  - User communications (P2P, not stored)

---

## 📱 Local Storage

Your device stores:

- Your private PGP key (encrypted)
- Message history (encrypted with your key)
- Connection list
- App settings

**We have no access to your local storage.**

---

## 🗑️ Data Deletion

### Your Rights:

- Delete your account anytime
- Remove connections anytime
- Clear local data anytime

### What Happens on Account Deletion:

- Username released
- Server-side data removed
- Local data remains (you control it)

---

## 🌐 Future: TOR Integration

We plan to offer:

- Onion service (.onion domain)
- TOR-routed connections
- Maximum anonymity

---

## 🛡️ Security Measures

- Passwords hashed with Argon2
- Emails encrypted with Fernet (AES)
- JWT tokens for authentication
- HTTPS only (production)
- No message logging

---

## 👶 Children

This service is not intended for users under 13. We do not knowingly collect data from children.

---

## 📧 Contact

Privacy questions? Open an issue on the project repository.

---

## 📝 Changes

- We may update this policy
- Changes posted in repository
- Major changes announced

---

## 🔓 Open Source Transparency

This project is **open source**. You can:

- Audit our code
- Verify our claims
- Run your own server
- Modify for your needs

---

## Summary

| Question                     | Answer                           |
| ---------------------------- | -------------------------------- |
| Do you read my messages?     | **NO** - End-to-end encrypted    |
| Do you sell my data?         | **NO** - We don't even have it   |
| Can you recover my messages? | **NO** - P2P only                |
| Is my identity protected?    | **YES** - Minimal data collected |
| Can I trust you?             | **VERIFY** - Code is open source |

---

_Your privacy is not our product. It's our promise._

---

**Project 83120**  
_Open Source • Privacy First • User Controlled_
