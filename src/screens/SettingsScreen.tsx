import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useReminder } from '../context/ReminderContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';

const INTERVALS = [
  { label: 'Off', value: null },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '4 hours', value: 14400 },
];

export const SettingsScreen = () => {
  const { logout } = useAuth();
  const { intervalSeconds, setIntervalSeconds, requestPermission, isNativeAvailable, testSystemNotification } =
    useReminder();

  const handleIntervalChange = async (value: number | null) => {
    if (value !== null) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission denied',
          'System notifications require permission before they can appear outside the app.',
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
            Manage reminder delivery and review notification availability for this device.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <AppIcon
                name="notifications"
                size={18}
                color={colors.primary}
                backgroundColor={colors.primaryContainer}
              />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <View style={[styles.statusBadge, isNativeAvailable ? styles.statusBadgeReady : styles.statusBadgePending]}>
              <Text style={[styles.statusBadgeText, isNativeAvailable ? styles.statusBadgeTextReady : styles.statusBadgeTextPending]}>
                {isNativeAvailable ? 'Ready' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionDescription}>
            Select how often reminders are delivered. If native notifications are not configured yet, the app will
            fall back to in-app alerts.
          </Text>

          <View style={styles.optionsContainer}>
            {INTERVALS.map(interval => {
              const isActive = intervalSeconds === interval.value;

              return (
                <TouchableOpacity
                  key={interval.label}
                  style={[styles.optionCard, isActive && styles.optionCardActive]}
                  onPress={() => handleIntervalChange(interval.value)}
                  activeOpacity={0.85}
                >
                  <View style={styles.optionLeft}>
                    <AppIcon
                      name="timer"
                      size={16}
                      color={isActive ? colors.primary : colors.onSurfaceVariant}
                      backgroundColor={isActive ? colors.primaryContainer : colors.surfaceContainer}
                    />
                    <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{interval.label}</Text>
                  </View>
                  {isActive ? <AppIcon name="check" size={14} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              if (!isNativeAvailable) {
                Alert.alert(
                  'Notification service unavailable',
                  "Native notifications are not active yet. Run 'npx react-native run-android' and restart Metro.",
                );
                return;
              }

              await testSystemNotification();
            }}
          >
            <Text style={styles.testButtonText}>Send test notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
            }}
          >
            <AppIcon name="logout" size={16} color={colors.error} backgroundColor="#fce7e6" />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>AgriTech App v0.0.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  headerBlock: {
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 8,
  },
  screenDescription: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceVariant,
    marginBottom: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeReady: {
    backgroundColor: '#e7f6ec',
  },
  statusBadgePending: {
    backgroundColor: '#fef3f2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextReady: {
    color: '#1f7a3e',
  },
  statusBadgeTextPending: {
    color: '#b42318',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#f7faf8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  testButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  footerActions: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#f6d0ce',
    paddingVertical: 15,
    borderRadius: 16,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    marginTop: 14,
    color: colors.outline,
    fontSize: 12,
  },
});
