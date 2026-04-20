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
      if (!nextUserId) {
        throw new Error('Login response did not include a valid user ID.');
      }

      await refreshFarmData(nextUserId);
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Unable to reach the API server. Make sure the backend is running on port 8000. For a USB-debugged Android phone, run: adb reverse tcp:8000 tcp:8000'
          : error.message) ||
        'Unable to connect to server. Check your internet or API IP.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroPanel}>
            <View style={styles.logoContainer}>
              <AppIcon name="brand" size={28} color={colors.onPrimary} backgroundColor={colors.primary} />
            </View>
            <Text style={styles.eyebrow}>AgriTech Platform</Text>
            <Text style={styles.title}>Farm operations dashboard</Text>
            <Text style={styles.description}>
              Sign in to review block performance, update sensor readings, and manage monitoring activity.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in</Text>
            <Text style={styles.formDescription}>Use your assigned account to continue.</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <AppIcon
                  name="mail"
                  size={16}
                  color={colors.onSurfaceVariant}
                  backgroundColor={colors.surfaceContainer}
                  style={styles.inputIconLeft}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <AppIcon
                  name="lock"
                  size={16}
                  color={colors.onSurfaceVariant}
                  backgroundColor={colors.surfaceContainer}
                  style={styles.inputIconLeft}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.inputIconRight}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <AppIcon
                    name={showPassword ? 'hide' : 'show'}
                    size={14}
                    color={colors.onSurfaceVariant}
                    backgroundColor={colors.surfaceContainer}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPasswordContainer} disabled={isLoading}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <AppIcon name="arrow" size={16} color={colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure access for farm monitoring and sensor data workflows.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroPanel: {
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onSurface,
    lineHeight: 38,
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    maxWidth: 420,
  },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  formDescription: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  errorContainer: {
    backgroundColor: colors.errorContainer,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f3c3c0',
    padding: 14,
    marginBottom: 18,
  },
  errorText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputIconRight: {
    position: 'absolute',
    right: 14,
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 14,
    paddingLeft: 52,
    paddingRight: 52,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.onSurface,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
});
