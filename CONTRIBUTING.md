# Contributing to Project 83120 - Mobile Client

Thank you for your interest in contributing! This document provides guidelines for contributing to the mobile client.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Android Studio / Xcode
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-username/project-83120-f-mobile.git
cd project-83120-f-mobile

# Install dependencies
npm install

# Generate native projects
npx expo prebuild

# Run on Android
npx expo run:android

# Run on iOS (Mac only)
npx expo run:ios
```

## 📝 Code Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Define types for all props and state
- Prefer interfaces over type aliases
- Use functional components with hooks

### Example Component

```typescript
import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const CustomButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4a9eff",
    padding: 12,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    textAlign: "center",
  },
});
```

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Full-page screens
├── services/       # API, WebRTC, crypto
├── stores/         # Zustand state stores
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

### Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `style:` UI/styling changes

Example: `feat: add end session button to chat`

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Run on device
npx expo run:android

# Build APK for testing
cd android && gradlew assembleDebug
```

## 📬 Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test on physical device
4. Submit PR with screenshots/recordings if UI change

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] UI/UX improvement
- [ ] Performance improvement

## Testing

- [ ] Tested on Android device/emulator
- [ ] Tested on iOS device/simulator

## Screenshots

(Add screenshots for UI changes)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] No new TypeScript errors
```

## 🔍 Areas for Contribution

### Good First Issues

- Add loading spinners
- Improve error messages
- Add haptic feedback
- UI polish

### Intermediate

- Message storage (AsyncStorage)
- Push notifications
- File transfer UI

### Advanced

- Background service
- TURN server integration
- Offline mode (local network)

## 🐛 Common Issues

### "WebRTC not found"

Use development build, not Expo Go:

```bash
npx expo prebuild --clean
npx expo run:android
```

### Build fails on Windows

Build on path without spaces:

```bash
# Good: E:\project-83120
# Bad: D:\My Documents\project
```

## ❓ Questions?

Open an issue with the `question` label.

Thank you for contributing! 🎉
