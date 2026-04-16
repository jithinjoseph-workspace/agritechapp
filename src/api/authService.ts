import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../config/env';

const TOKEN_KEY = '@agritech_auth_token';

/**
 * Auth Service to handle user authentication via API.
 */
export const authService = {
  /**
   * Attempts to log in a user with email and password.
   */
  async mobileLogin(email, password) {
    try {
      console.log('📡 [API Request] POST', ENDPOINTS.LOGIN);
      
      const response = await axios.post(ENDPOINTS.LOGIN, {
        email,
        password,
      });

      console.log('✅ [API Success] Status:', response.status);
      
      // Auto-save the token if it exists in the response
      // Replace 'token' with the actual field name from your API (e.g., 'access_token', 'token', etc.)
      const token = response.data.token || response.data.access_token || 'dummy-token-for-test';
      await this.saveToken(token);

      return response.data;
    } catch (error: any) {
      console.error('❌ [API Error]:', error.message);
      throw error;
    }
  },

  async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Save token error', e);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Remove token error', e);
    }
  }
};
