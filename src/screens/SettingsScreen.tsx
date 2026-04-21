import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useReminder } from '../context/ReminderContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from '../components/AppIcon';

const INTERVALS = [
  { label: 'Off',         value: null  },
  { label: '15 minutes',  value: 900   },
  { label: '30 minutes',  value: 1800  },
  { label: '1 hour',      value: 3600  },
  { label: '4 hours',     value: 14400 },
];

export const SettingsScreen = () => {
  const { intervalSeconds, setIntervalSeconds, requestPermission, isNativeAvailable, testSystemNotification } =
    useReminder();
  const { logout } = useAuth();

  const handleIntervalChange = async (value: number | null) => {
    if (value !== null) {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert('Permission Required', 'Enable notification permission to receive reminders.');
        return;
      }
    }
    setIntervalSeconds(value);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Page label */}
        <Text style={styles.pageLabel}>Settings</Text>

        {/* Notifications section */}
        <Text style={styles.sectionLabel}>Reminders</Text>
        <View style={styles.card}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <AppIcon
                name="notifications"
                size={16}
                color={colors.primary}
                backgroundColor={colors.primaryContainer}
              />
              <Text style={styles.cardTitle}>Sensor Reminders</Text>
            </View>
            <View style={[
              styles.statusPill,
              isNativeAvailable ? styles.statusPillReady : styles.statusPillPending,
            ]}>
              <Text style={[
                styles.statusPillText,
                isNativeAvailable ? styles.statusPillTextReady : styles.statusPillTextPending,
              ]}>
                {isNativeAvailable ? '● Active' : '○ Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Interval options */}
          <View style={styles.intervalList}>
            {INTERVALS.map(interval => {
              const active = intervalSeconds === interval.value;
              return (
                <TouchableOpacity
                  key={interval.label}
                  style={[styles.intervalRow, active && styles.intervalRowActive]}
                  onPress={() => handleIntervalChange(interval.value)}
                  activeOpacity={0.78}
                >
                  <View style={styles.intervalLeft}>
                    <View style={[styles.radioRing, active && styles.radioRingActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.intervalLabel, active && styles.intervalLabelActive]}>
                      {interval.label}
                    </Text>
                  </View>
                  {active && (
                    <AppIcon name="check" size={12} color={colors.primary} backgroundColor={colors.primaryContainer} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.cardDivider} />

          {/* Test button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={async () => {
              if (!isNativeAvailable) {
                Alert.alert('Unavailable', 'Restart the app after running it from Android Studio or CLI.');
                return;
              }
              await testSystemNotification();
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="notifications" size={14} color={colors.primary} backgroundColor="transparent" />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* About section */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.aboutLeft}>
              <View style={styles.aboutLogoBox}>
                <AppIcon name="brand" size={16} color={colors.onPrimary} backgroundColor="transparent" />
              </View>
              <View>
                <Text style={styles.aboutAppName}>AgriTech</Text>
                <Text style={styles.aboutVersion}>Version 0.1.0-alpha</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardDivider} />
          
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="brand" size={14} color={colors.error} backgroundColor="transparent" />
            <Text style={styles.logoutBtnText}>Disconnect & Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f2' },
  scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 120 },

  pageLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 24,
    letterSpacing: 0.2,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 10,
    marginLeft: 2,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  /* Card header */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f4f2',
    marginHorizontal: 0,
  },

  /* Status pill */
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillReady:   { backgroundColor: '#e6f4ec' },
  statusPillPending: { backgroundColor: '#fef3f2' },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  statusPillTextReady:   { color: '#1f7a3e' },
  statusPillTextPending: { color: '#b42318' },

  /* Interval list */
  intervalList: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 2,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  intervalRowActive: {
    backgroundColor: '#f0f4f2',
  },
  intervalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioRingActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  intervalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  intervalLabelActive: {
    color: colors.primary,
  },

  /* Test button */
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  /* About section */
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  aboutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutAppName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 2,
  },
  aboutVersion: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#fef3f2',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
});
