import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import notifee, { TriggerType, AuthorizationStatus } from '@notifee/react-native';

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
  const [isNativeAvailable, setIsNativeAvailable] = useState(true);

  // Initialize Notification Channel for Android
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notifee.createChannel({
          id: 'agritech-alerts',
          name: 'AgriTech Sensor Alerts',
          importance: 4, 
          vibration: true,
        });
        setIsNativeAvailable(true);
      } catch (e: any) {
        setIsNativeAvailable(false);
      }
    };
    initNotifications();
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (e) {
      return true; // Fallback: allow scheduling in-app even if native settings can't be reached
    }
  }, []);

  // Hybrid Background / Foreground Alert Logic
  useEffect(() => {
    let timerId: any = null;

    const syncTriggers = async () => {
      // 1. ALWAYS cancel all existing scheduled triggers first
      if (isNativeAvailable) {
        try {
          await notifee.cancelAllNotifications();
          console.log("🧹 [Reminders] Previous notifications cleared.");
        } catch (e: any) {
          console.error("❌ [Reminders] Failed to clear notifications:", e);
        }
      }

      // 2. If interval is null (OFF), stop here
      if (!intervalSeconds) {
        console.log("🔕 [Reminders] System is now OFF.");
        return;
      }

      // 3. Schedule new trigger if native is available
      if (isNativeAvailable) {
        try {
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
          return; 
        } catch (e: any) {
          console.error("❌ [Reminders] Scheduling failed:", e);
        }
      }

      // 4. FALLBACK: In-App Timer (if native fails)
      console.log("⏱️ [Reminders] Native failed, using In-App fallback timer.");
      timerId = setInterval(() => {
        Alert.alert(
          "Sensor Logging Reminder",
          "This is an in-app reminder (Outside notifications require a native app rebuild).",
          [{ text: "Log Data" }]
        );
      }, intervalSeconds * 1000);
    };

    syncTriggers();

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [intervalSeconds, isNativeAvailable]);

  const testSystemNotification = useCallback(async () => {
    if (!isNativeAvailable) return;
    try {
      await notifee.displayNotification({
        title: '🔔 Connectivity Test',
        body: 'Great! Your system notification connection is working perfectly.',
        android: { channelId: 'agritech-alerts', importance: 4 },
      });
    } catch (e) {
      console.error(e);
    }
  }, [isNativeAvailable]);

  return (
    <ReminderContext.Provider value={{ intervalSeconds, setIntervalSeconds, requestPermission, isNativeAvailable, testSystemNotification }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => useContext(ReminderContext);
