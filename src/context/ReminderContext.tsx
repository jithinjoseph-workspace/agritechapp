import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
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
    if (!intervalSeconds) return;

    let timerId: any = null;

    const syncTriggers = async () => {
      if (isNativeAvailable) {
        try {
          await notifee.cancelAllNotifications();
          
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
          return; 
        } catch (e: any) {
          // Fall back gracefully
        }
      }

      // FALLBACK: In-App Timer (if build is not finished or native fails)
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
