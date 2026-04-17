import axios from 'axios';
import { NativeModules } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from '../config/env';

const TOKEN_KEY = '@agritech_auth_token';
const USER_KEY = '@agritech_auth_user';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type StoredAuthUser = {
  id?: string;
  user_id?: string;
  name?: string | null;
  email?: string;
  role?: string | null;
};

const memoryStorage = new Map<string, string>();

let cachedStorage: StorageAdapter | null | undefined;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function getStorage(): StorageAdapter {
  if (cachedStorage) {
    return cachedStorage;
  }

  const hasNativeAsyncStorage =
    NativeModules.RNCAsyncStorage || NativeModules.PlatformLocalStorage;

  if (hasNativeAsyncStorage) {
    try {
      const loaded = require('@react-native-async-storage/async-storage');
      const asyncStorage = loaded?.default ?? loaded;

      cachedStorage = {
        getItem: (key: string) => asyncStorage.getItem(key),
        setItem: (key: string, value: string) => asyncStorage.setItem(key, value),
        removeItem: (key: string) => asyncStorage.removeItem(key),
      };
      return cachedStorage;
    } catch {
      console.warn('[authService] AsyncStorage package failed to initialize, using memory fallback.');
    }
  } else {
    console.warn('[authService] AsyncStorage native module unavailable, using memory fallback.');
  }

  cachedStorage = {
    async getItem(key: string) {
      return memoryStorage.has(key) ? memoryStorage.get(key)! : null;
    },
    async setItem(key: string, value: string) {
      memoryStorage.set(key, value);
    },
    async removeItem(key: string) {
      memoryStorage.delete(key);
    },
  };

  return cachedStorage;
}

/**
 * Auth Service to handle user authentication via API.
 */
export const authService = {
  /**
   * Attempts to log in a user with email and password.
   */
  async mobileLogin(email: string, password: string) {
    try {
      console.log('[API Request] POST', ENDPOINTS.LOGIN);

      const response = await apiClient.post(ENDPOINTS.LOGIN, {
        email,
        password,
      });

      console.log('[API Success] Status:', response.status);

      const token = response.data.token || response.data.access_token || 'dummy-token-for-test';
      await this.saveToken(token);

      return response.data;
    } catch (error: any) {
      console.error('[API Error]:', {
        message: error.message,
        code: error.code,
        baseUrl: API_BASE_URL,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async saveToken(token: string) {
    try {
      await getStorage().setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Save token error', error);
    }
  },

  async getToken() {
    try {
      return await getStorage().getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async removeToken() {
    try {
      await getStorage().removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Remove token error', error);
    }
  },

  async saveUser(user: StoredAuthUser) {
    try {
      await getStorage().setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Save user error', error);
    }
  },

  async getUser(): Promise<StoredAuthUser | null> {
    try {
      const stored = await getStorage().getItem(USER_KEY);
      if (!stored) {
        return null;
      }

      return JSON.parse(stored) as StoredAuthUser;
    } catch (error) {
      console.error('Get user error', error);
      return null;
    }
  },

  async removeUser() {
    try {
      await getStorage().removeItem(USER_KEY);
    } catch (error) {
      console.error('Remove user error', error);
    }
  },

  async clearSession() {
    await Promise.all([this.removeToken(), this.removeUser()]);
  },

  async getUserDetails(userId: string) {
    try {
      const token = await this.getToken();
      console.log('[API Request] GET', ENDPOINTS.USER_DETAILS(userId));

      const response = await apiClient.get(ENDPOINTS.USER_DETAILS(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[API Success] Farm Details Loaded');
      console.log('[Full Response Data]:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('[API Error - Details Fetch]:', error.message);
      throw error;
    }
  },

  async postSensorSnapshot(blockId: string, data: any) {
    try {
      const token = await this.getToken();
      console.log('[API Request] POST', ENDPOINTS.SUBMIT_SNAPSHOT(blockId));
      console.log('[Payload]:', JSON.stringify(data, null, 2));

      const response = await apiClient.post(ENDPOINTS.SUBMIT_SNAPSHOT(blockId), data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[API Success] Sensor Snapshot Submitted');
      return response.data;
    } catch (error: any) {
      console.error('[API Error - Snapshot Post]:', error.message);
      if (error.response) {
        console.log('[Error Data]:', error.response.data);
      }
      throw error;
    }
  },

  async getLatestSnapshot(blockId: string) {
    try {
      const token = await this.getToken();
      console.log('[API Request] GET', ENDPOINTS.LATEST_SNAPSHOT(blockId));

      const response = await apiClient.get(ENDPOINTS.LATEST_SNAPSHOT(blockId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[API Success] Latest Snapshot Loaded');
      console.log('[Snapshot Data]:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('[API Error - Latest Snapshot]:', error.message);
      throw error;
    }
  },
};
