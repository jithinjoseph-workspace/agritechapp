import React from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useReminder } from '../context/ReminderContext';

const IconPlaceholder = ({ name, color, size }: { name: string, color: string, size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'notifications_active' ? '🔔' : 
     name === 'timer' ? '⏱️' : 
     name === 'logout' ? '🚪' :
     name === 'check_circle' ? '✅' : ''}
  </Text>
);

const INTERVALS = [
  { label: 'Off (Do not disturb)', value: null },
  { label: '15 Minutes', value: 900 },
  { label: '30 Minutes', value: 1800 },
  { label: '1 Hour', value: 3600 },
  { label: '4 Hours', value: 14400 },
];

import { useAuth } from '../context/AuthContext';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { 
    intervalSeconds, 
    setIntervalSeconds, 
    requestPermission, 
    isNativeAvailable, 
    testSystemNotification 
  } = useReminder();

  const handleIntervalChange = async (value: number | null) => {
    if (value !== null) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          "System notifications require your permission to show up outside the app.",
        );
        return;
      }
    }
    setIntervalSeconds(value);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Settings</Text>
          <Text style={styles.screenDescription}>
            Configure your application preferences and automated reminders.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconPlaceholder name="notifications_active" color={colors.primary} size={20} />
              <Text style={styles.sectionTitle}>System Notifications</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isNativeAvailable ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.statusBadgeText, { color: isNativeAvailable ? '#166534' : '#991b1b' }]}>
                {isNativeAvailable ? 'SYSTEM READY' : 'IN-APP ONLY'}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionDescription}>
            These reminders appear in your phone's notification tray. In-app alerts are used if native setup is pending.
          </Text>

          <View style={styles.optionsContainer}>
            {INTERVALS.map((interval, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.optionCard,
                  intervalSeconds === interval.value && styles.optionCardActive
                ]}
                onPress={() => handleIntervalChange(interval.value)}
              >
                <View style={styles.optionLeft}>
                  <IconPlaceholder name="timer" color={intervalSeconds === interval.value ? colors.primary : colors.outlineVariant} size={18} />
                  <Text style={[
                    styles.optionLabel,
                    intervalSeconds === interval.value && styles.optionLabelActive
                  ]}>
                    {interval.label}
                  </Text>
                </View>
                {intervalSeconds === interval.value && (
                  <IconPlaceholder name="check_circle" color={colors.primary} size={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={async () => {
              if (!isNativeAvailable) {
                Alert.alert(
                  'Cannot Test System Notification',
                  "Native module is still missing. Please ensure you ran 'npx react-native run-android' and restarted the Metro bundler.",
                );
              } else {
                await testSystemNotification();
              }
            }}
          >
            <Text style={styles.testButtonText}>Test System Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 24 }}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
            }}
          >
            <IconPlaceholder name="logout" color="#991b1b" size={18} />
            <Text style={styles.logoutButtonText}>Disconnect & Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>AgriTech App v0.1.0-alpha</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 120 },
  headerBlock: { marginBottom: 32 },
  screenTitle: { fontSize: 28, fontWeight: '900', color: colors.onSurface, letterSpacing: -0.5, marginBottom: 8 },
  screenDescription: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 22 },
  
  section: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  sectionDescription: { fontSize: 13, color: colors.outlineVariant, marginBottom: 24 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },

  optionsContainer: { gap: 12 },
  optionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceContainerHighest },
  optionCardActive: { backgroundColor: 'rgba(1, 45, 29, 0.05)', borderColor: colors.primary },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: colors.onSurfaceVariant },
  optionLabelActive: { color: colors.primary, fontWeight: '800' },

  testButton: { marginTop: 24, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  testButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    backgroundColor: '#fee2e2', 
    paddingVertical: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  logoutButtonText: { color: '#991b1b', fontSize: 15, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: colors.outlineVariant, fontSize: 12, marginTop: 16, fontWeight: '500' },
});
