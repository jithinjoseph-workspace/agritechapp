import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
    setIsNativeAvailable(false);
  }, []);

  const requestPermission = useCallback(async () => {
    return true;
  }, []);

  useEffect(() => {
    if (!intervalSeconds) {
      return;
    }

    let timerId: ReturnType<typeof setInterval> | null = null;
    let isDisposed = false;

    const syncTriggers = async () => {
      if (isDisposed) {
        return;
      }

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
