import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';

// Replaced placeholder with real MaterialIcons

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('👆 Login button pressed');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await authService.mobileLogin(email, password);
      console.log('Login successful:', data);
      
      // Update global auth state
      await login(data);
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || error.message || 'Unable to connect to server. Check your internet or API IP.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Decorative Layer (Asymmetric Design - approximated with absolute positioning) */}
      <View style={styles.decorativeCircleTopRight} />
      <View style={styles.decorativeCircleBottomLeft} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Identity */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="eco" color={colors.secondaryFixed} size={32} />
            </View>
            <Text style={styles.subtitle}>AGRONOMIST</Text>
            <Text style={styles.title}>Cultivating Success</Text>
            <Text style={styles.description}>Enter your credentials to access the farm intelligence suite.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            
            {/* Error Message Display */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <Icon name="mail" color={colors.outlineVariant} size={18} />
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="name@example.com"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <Icon name="lock" color={colors.outlineVariant} size={18} />
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.outlineVariant}
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
                  <Icon name={showPassword ? 'visibility-off' : 'visibility'} color={colors.outlineVariant} size={18} />
                </TouchableOpacity>
              </View>
            </View>


            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer} disabled={isLoading}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Action */}
            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign In to Dashboard</Text>
                  <Icon name="arrow-forward" color={colors.onPrimary} size={18} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>AUTHORIZED ENTRY ONLY</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* Footer Visual Hint */}
          <View style={styles.footer}>
            <View style={styles.nodeActiveContainer}>
              <View style={styles.pulsingDot} />
              <Text style={styles.nodeActiveText}>CENTRAL NODE ACTIVE</Text>
            </View>
            <Text style={styles.footerDisclaimer}>
              SECURE ENTERPRISE ACCESS FOR PROFESSIONAL AGRICULTURAL MONITORING AND SOIL ANALYSIS.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    position: 'relative'
  },
  decorativeCircleTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '60%',
    height: '40%',
    borderRadius: 200,
    backgroundColor: colors.secondaryFixed,
    opacity: 0.1,
  },
  decorativeCircleBottomLeft: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '50%',
    height: '50%',
    borderRadius: 200,
    backgroundColor: colors.primaryContainer,
    opacity: 0.05,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.primaryContainer,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginTop: 12,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onTertiaryFixedVariant,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputIconRight: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(193, 200, 194, 0.3)', // outlineVariant with opacity
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    paddingVertical: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurface,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    letterSpacing: -0.2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(193, 200, 194, 0.3)',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.outlineVariant,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(193, 200, 194, 0.2)',
    borderRadius: 12,
  },
  googleIconWrapper: {
    fontSize: 18,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  footer: {
    marginTop: 64,
    alignItems: 'center',
  },
  nodeActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  nodeActiveText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
  },
  footerDisclaimer: {
    marginTop: 32,
    color: colors.outlineVariant,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0,
    maxWidth: 200,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
