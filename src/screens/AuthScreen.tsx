import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  
  const { login, register, isLoading, error, clearError } = useAuthStore();

  // Format date as DD/MM/YYYY for key derivation
  const formatDateForKey = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Derive encryption key from email + birthday
  const derivePassphrase = (email: string, date: Date | null): string => {
    if (!date) return '';
    const bday = formatDateForKey(date);
    return `${email.toLowerCase().trim()}:${bday}`;
  };

  const handleSubmit = async () => {
    try {
      const passphrase = derivePassphrase(email, birthday);
      const birthdayStr = birthday ? formatDateForKey(birthday) : '';
      if (mode === 'login') {
        // email field contains either email or username for login
        await login({ username: email, password, passphrase });
      } else {
        await register({ username, email, birthday: birthdayStr, password, passphrase });
      }
    } catch (err) {
      // Error is handled by store
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  // Forgot password handlers
  const handleRequestOTP = async () => {
    if (!forgotUsername.trim()) {
      setForgotError('Please enter your username');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const result = await api.forgotPassword(forgotUsername);
      setEmailHint(result.email_hint);
      setForgotStep('verify');
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || 'Failed to request OTP');
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setForgotError('Please enter OTP and new password');
      return;
    }
    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.resetPassword(forgotUsername, otp, newPassword);
      Alert.alert('Success', 'Password reset! You can now login.');
      closeForgotModal();
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || 'Failed to reset password');
    }
    setForgotLoading(false);
  };

  const closeForgotModal = () => {
    setShowForgotPassword(false);
    setForgotUsername('');
    setOtp('');
    setNewPassword('');
    setEmailHint('');
    setForgotStep('request');
    setForgotError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Project 83120</Text>
          <Text style={styles.subtitle}>Secure P2P Chat</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>

          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Choose a username (@handle)"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder={mode === 'login' ? "Email or Username" : "Email"}
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={birthday ? styles.inputText : styles.placeholderText}>
              {birthday ? formatDateForKey(birthday) : 'Tap to select birthday'}
            </Text>
          </TouchableOpacity>

          {/* Simple Date Picker Modal */}
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerModal}>
                <Text style={styles.modalTitle}>Select Birthday</Text>
                
                <View style={styles.dateInputRow}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={2}
                    onChangeText={(d) => {
                      const current = birthday || new Date(2000, 0, 1);
                      const day = parseInt(d) || 1;
                      setBirthday(new Date(current.getFullYear(), current.getMonth(), day));
                    }}
                  />
                  <Text style={styles.dateSeparator}>/</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="MM"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={2}
                    onChangeText={(m) => {
                      const current = birthday || new Date(2000, 0, 1);
                      const month = (parseInt(m) || 1) - 1;
                      setBirthday(new Date(current.getFullYear(), month, current.getDate()));
                    }}
                  />
                  <Text style={styles.dateSeparator}>/</Text>
                  <TextInput
                    style={[styles.dateInput, { width: 80 }]}
                    placeholder="YYYY"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={4}
                    onChangeText={(y) => {
                      const current = birthday || new Date(2000, 0, 1);
                      const year = parseInt(y) || 2000;
                      setBirthday(new Date(year, current.getMonth(), current.getDate()));
                    }}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <Text style={styles.hint}>
            Your email + birthday creates your secret key
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>

          {mode === 'login' && (
            <TouchableOpacity 
              style={styles.forgotButton} 
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Forgot Password Modal */}
        <Modal visible={showForgotPassword} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {forgotStep === 'request' ? 'Reset Password' : 'Enter OTP'}
              </Text>

              {forgotStep === 'request' ? (
                <>
                  <Text style={styles.modalSubtitle}>
                    Enter your username to receive an OTP
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Username (@handle)"
                    placeholderTextColor="#888"
                    value={forgotUsername}
                    onChangeText={setForgotUsername}
                    autoCapitalize="none"
                  />
                  {forgotError ? <Text style={styles.error}>{forgotError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.button, forgotLoading && styles.buttonDisabled]}
                    onPress={handleRequestOTP}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalSubtitle}>
                    OTP sent to {emailHint}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#888"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password (min 8 chars)"
                    placeholderTextColor="#888"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  {forgotError ? <Text style={styles.error}>{forgotError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.button, forgotLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.modalCancel} onPress={closeForgotModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  inputText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    width: 60,
  },
  dateSeparator: {
    color: '#fff',
    fontSize: 24,
    marginHorizontal: 8,
  },
  modalButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 8,
    padding: 14,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCancel: {
    marginTop: 16,
    padding: 8,
  },
  modalCancelText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});
