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

function resolveApiHost() {
  if (MANUAL_API_HOST.trim()) {
    return MANUAL_API_HOST.trim();
  }

  const devServerHost = getDevServerHost();

  if (
    devServerHost &&
    devServerHost !== 'localhost' &&
    devServerHost !== '127.0.0.1'
  ) {
    return devServerHost;
  }

  if (Platform.OS === 'android') {
    // For USB debugging or adb reverse we should talk to localhost.
    // If you're using the Android emulator without port forwarding,
    // set MANUAL_API_HOST to 10.0.2.2.
    return '127.0.0.1';
  }

  return '127.0.0.1';
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
