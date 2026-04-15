import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Simple placeholder for Material Icons since react-native-vector-icons isn't installed.
// In a real device you'd use <Icon name="eco" /> from react-native-vector-icons/MaterialIcons
const IconPlaceholder = ({ name, color, size }: { name: string, color: string, size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'eco' ? '🌱' : name === 'mail' ? '✉️' : name === 'lock' ? '🔒' : name === 'terminal' ? '💻' : name === 'visibility' ? '👁️' : name === 'arrow_forward' ? '➡️' : ''}
  </Text>
);

export const LoginScreen = ({ navigation }: any) => {
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
              <IconPlaceholder name="eco" color={colors.secondaryFixed} size={32} />
            </View>
            <Text style={styles.subtitle}>AGRONOMIST</Text>
            <Text style={styles.title}>Cultivating Success</Text>
            <Text style={styles.description}>Enter your credentials to access the farm intelligence suite.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <IconPlaceholder name="mail" color={colors.outlineVariant} size={18} />
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="name@example.com"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconLeft}>
                  <IconPlaceholder name="lock" color={colors.outlineVariant} size={18} />
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.outlineVariant}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.inputIconRight}>
                  <IconPlaceholder name="visibility" color={colors.outlineVariant} size={18} />
                </TouchableOpacity>
              </View>
            </View>


            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Action */}
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.primaryButtonText}>Sign In to Dashboard</Text>
              <IconPlaceholder name="arrow_forward" color={colors.onPrimary} size={18} />
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
    wight: '100%',
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
  }
});
