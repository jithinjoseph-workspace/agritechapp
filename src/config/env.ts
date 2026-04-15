/**
 * Centralized API configuration.
 * Change the API_BASE_URL here to reflect your local server's IP.
 */

// NOTE: On Android emulators, '10.0.2.2' is the magic IP to reach your host machine's localhost.
// If using a physical device, use your machine's local network IP (e.g. 192.168.1.5).
export const API_BASE_URL = 'http://192.168.1.71:8000';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/mobile/auth/login`,
};
