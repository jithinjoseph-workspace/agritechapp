import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import notifee, { TriggerType } from '@notifee/react-native';

type ReminderContextType = {
  intervalSeconds: number | null;
  setIntervalSeconds: (sec: number | null) => void;
  requestPermission: () => Promise<boolean>;
  isNativeAvailable: boolean;
  testSystemNotification: () => Promise<void>;
};

const ReminderContext = createContext<ReminderContextType>({
  intervalSeconds: null,
  setIntervalSeconds: () => {},
  requestPermission: async () => false,
  isNativeAvailable: false,
  testSystemNotification: async () => {},
});

export const ReminderProvider = ({ children }: { children: React.ReactNode }) => {
  const [intervalSeconds, setIntervalSeconds] = useState<number | null>(null);
  const [isNativeAvailable, setIsNativeAvailable] = useState(false);

  useEffect(() => {
    // Keep the provider alive even when native notification bindings are not present.
    // In future versions, this would check if notifee is actually linked.
    setIsNativeAvailable(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const settings = await notifee.requestPermission();
        return settings.authorizationStatus >= 1;
      } catch (e) {
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    if (!intervalSeconds) {
      return;
    }

    let timerId: ReturnType<typeof setInterval> | null = null;
    let isDisposed = false;

    const syncTriggers = async () => {
      if (isDisposed) return;

      // 1. Attempt to use native notifee if available
      if (isNativeAvailable) {
        try {
          await notifee.cancelAllNotifications();
          console.log("🧹 [Reminders] Previous notifications cleared.");

          let trigger: any;
          if (intervalSeconds < 900) {
            trigger = {
              type: TriggerType.TIMESTAMP,
              timestamp: Date.now() + (intervalSeconds * 1000),
              alarmManager: true, 
            };
          } else {
            trigger = { 
              type: TriggerType.INTERVAL, 
              interval: intervalSeconds, 
              timeUnit: 'SECONDS' 
            };
          }

          await notifee.createTriggerNotification(
            {
              id: 'reminder-sensor-entry',
              title: '📍 Field Action Required',
              body: 'Time to record your 6 primary sensor values for the active block.',
              android: { 
                channelId: 'agritech-alerts',
                pressAction: { id: 'default' }, 
                importance: 4,
              },
            },
            trigger
          );
          console.log(`📡 [Reminders] Scheduled for every ${intervalSeconds} seconds.`);
          return; // Native scheduling worked
        } catch (e: any) {
          console.error("❌ [Reminders] Scheduling failed:", e);
        }
      }

      // 2. FALLBACK: In-App Timer (if native fails or is unavailable)
      console.log("⏱️ [Reminders] Using In-App fallback timer.");
      timerId = setInterval(() => {
        Alert.alert(
          'Sensor Logging Reminder',
          'This is an in-app reminder. Native notifications need a rebuilt app to work.',
          [{ text: 'Log Data' }],
        );
      }, intervalSeconds * 1000);
    };

    void syncTriggers();

    return () => {
      isDisposed = true;
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [intervalSeconds, isNativeAvailable]);

  const testSystemNotification = useCallback(async () => {
    Alert.alert(
      'In-App Only',
      'Native notifications are not available in this build yet.',
    );
  }, [isNativeAvailable]);

  return (
    <ReminderContext.Provider
      value={{
        intervalSeconds,
        setIntervalSeconds,
        requestPermission,
        isNativeAvailable,
        testSystemNotification,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => useContext(ReminderContext);
