import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { AppIcon } from '../components/AppIcon';

export const LoginScreen = (_props: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login } = useAuth();
  const { clearFarmData, refreshFarmData } = useFarm();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.clearSession();
      clearFarmData();

      const data = await authService.mobileLogin(email.trim(), password);
      await login(data);

      const nextUserId = data?.user?.id || data?.user?.user_id || data?.id || data?.user_id;
      if (!nextUserId) throw new Error('Login response did not include a valid user ID.');

      await refreshFarmData(nextUserId);
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Unable to reach the server. Please check your connection.'
          : error.message) ||
        'Login failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Brand / Hero ─────────────────────────── */}
          <View style={styles.hero}>
            {/* Logo mark */}
            <View style={styles.logoRing}>
              <View style={styles.logoBox}>
                <AppIcon
                  name="brand"
                  size={28}
                  color={colors.onPrimary}
                  backgroundColor="transparent"
                />
              </View>
            </View>

            <Text style={styles.appName}>AgriTech</Text>
            <Text style={styles.tagline}>Farm Intelligence Platform</Text>
          </View>

          {/* ── Form card ────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.signInTitle}>Welcome back</Text>
            <Text style={styles.signInSub}>Sign in to your account</Text>

            {/* Error banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.fieldBox, emailFocused && styles.fieldBoxFocused]}>
                <AppIcon
                  name="mail"
                  size={15}
                  color={emailFocused ? colors.primary : colors.onSurfaceVariant}
                  backgroundColor="transparent"
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.fieldBox, passwordFocused && styles.fieldBoxFocused]}>
                <AppIcon
                  name="lock"
                  size={15}
                  color={passwordFocused ? colors.primary : colors.onSurfaceVariant}
                  backgroundColor="transparent"
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <AppIcon
                    name={showPassword ? 'hide' : 'show'}
                    size={14}
                    color={colors.onSurfaceVariant}
                    backgroundColor="transparent"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In button */}
            <TouchableOpacity
              style={[styles.signInBtn, isLoading && styles.signInBtnLoading]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signInBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  container: {
    flex: 1,
    backgroundColor: '#f0f4f2',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* ── Hero ── */
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoRing: {
    padding: 6,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    marginBottom: 18,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },

  /* ── Card ── */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  signInSub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },

  /* Error */
  errorBanner: {
    backgroundColor: colors.errorContainer,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#f3c3c0',
  },
  errorText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Fields */
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginLeft: 2,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
    gap: 10,
  },
  fieldBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: Platform.OS === 'android' ? 13 : 0,
  },
  eyeBtn: {
    padding: 4,
  },

  /* Button */
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  signInBtnLoading: {
    opacity: 0.75,
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
