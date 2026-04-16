import { Platform } from 'react-native';

/**
 * Centralized API configuration.
 *
 * `MANUAL_API_HOST` can be set to your machine's LAN IP when testing on a
 * physical device. When left empty, we use emulator/simulator-friendly defaults.
 */
const MANUAL_API_HOST = '';
const API_PORT = 8000;

function resolveApiHost() {
  if (MANUAL_API_HOST.trim()) {
    return MANUAL_API_HOST.trim();
  }

  if (Platform.OS === 'android') {
    // Android emulator -> host machine localhost
    return '10.0.2.2';
  }

  return '127.0.0.1';
}

export const API_BASE_URL = `http://${resolveApiHost()}:${API_PORT}`;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/mobile/auth/login`,
  USER_DETAILS: (userId: string) => `${API_BASE_URL}/api/mobile/users/${userId}/details`,
  SUBMIT_SNAPSHOT: (blockId: string) => `${API_BASE_URL}/api/mobile/blocks/${blockId}/sensor-snapshots`,
  LATEST_SNAPSHOT: (blockId: string) => `${API_BASE_URL}/api/mobile/blocks/${blockId}/sensor-snapshots/latest`,
};
