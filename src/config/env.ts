import { NativeModules, Platform } from 'react-native';

/**
 * Centralized API configuration.
 *
 * `MANUAL_API_HOST` can be set to your machine's LAN IP when testing on a
 * physical device. When left empty, we try to infer the correct dev host first
 * and then fall back to sensible emulator/simulator defaults.
 */
const MANUAL_API_HOST = '';
const API_PORT = 8000;

function getDevServerHost() {
  if (!__DEV__) {
    return null;
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL;

  if (typeof scriptURL !== 'string' || !scriptURL) {
    return null;
  }

  try {
    const { hostname } = new URL(scriptURL);
    return hostname || null;
  } catch {
    return null;
  }
}

function isAndroidEmulator() {
  if (Platform.OS !== 'android') return false;

  const constants = Platform.constants as any;
  if (!constants) return false;

  const fingerprint = (constants.Fingerprint || '').toLowerCase();
  const model = (constants.Model || '').toLowerCase();
  const brand = (constants.Brand || '').toLowerCase();

  return (
    fingerprint.includes('vbox') ||
    fingerprint.includes('generic') ||
    fingerprint.includes('emulator') ||
    model.includes('sdk') ||
    model.includes('emulator') ||
    (brand.includes('google') && fingerprint.includes('sdk')) ||
    brand === 'generic'
  );
}

function resolveApiHost() {
  if (MANUAL_API_HOST.trim()) {
    return MANUAL_API_HOST.trim();
  }

  const devServerHost = getDevServerHost();

  if (
    devServerHost &&
    devServerHost !== 'localhost' &&
    devServerHost !== '192.168.1.71'
  ) {
    return devServerHost;
  }

  if (Platform.OS === 'android') {
    // Automatically detect emulator vs physical device
    if (isAndroidEmulator()) {
      return '10.0.2.2'; // Standard loopback for Android emulator
    }

    // For USB debugging on physical devices:
    // If you haven't already, please run: adb reverse tcp:8000 tcp:8000 
    // to map localhost on device to localhost on this machine.
    return '192.168.1.71';
  }

  return '192.168.1.71';
}

export const API_BASE_URL = `http://${resolveApiHost()}:${API_PORT}`;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/mobile/auth/login`,
  USER_DETAILS: (userId: string) =>
    `${API_BASE_URL}/api/mobile/users/${userId}/details`,
  SUBMIT_SNAPSHOT: (blockId: string) =>
    `${API_BASE_URL}/api/mobile/blocks/${blockId}/sensor-snapshots`,
  SNAPSHOT_HISTORY: (blockId: string) =>
    `${API_BASE_URL}/api/mobile/blocks/${blockId}/sensor-snapshots/history`,
  LATEST_SNAPSHOT: (blockId: string) =>
    `${API_BASE_URL}/api/mobile/blocks/${blockId}/sensor-snapshots/latest`,
};
