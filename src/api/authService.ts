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
  },

  async getUserDetails(userId: string) {
    try {
      const token = await this.getToken();
      console.log('📡 [API Request] GET', ENDPOINTS.USER_DETAILS(userId));
      
      const response = await axios.get(ENDPOINTS.USER_DETAILS(userId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ [API Success] Farm Details Loaded');
      console.log('📦 [Full Response Data]:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ [API Error - Details Fetch]:', error.message);
      throw error;
    }
  },

  async postSensorSnapshot(blockId: string, data: any) {
    try {
      const token = await this.getToken();
      console.log('📡 [API Request] POST', ENDPOINTS.SUBMIT_SNAPSHOT(blockId));
      console.log('📦 [Payload]:', JSON.stringify(data, null, 2));
      
      const response = await axios.post(ENDPOINTS.SUBMIT_SNAPSHOT(blockId), data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ [API Success] Sensor Snapshot Submitted');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API Error - Snapshot Post]:', error.message);
      if (error.response) console.log('📁 [Error Data]:', error.response.data);
      throw error;
    }
  },

  async getLatestSnapshot(blockId: string) {
    try {
      const token = await this.getToken();
      console.log('📡 [API Request] GET', ENDPOINTS.LATEST_SNAPSHOT(blockId));
      
      const response = await axios.get(ENDPOINTS.LATEST_SNAPSHOT(blockId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ [API Success] Latest Snapshot Loaded');
      console.log('📦 [Snapshot Data]:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ [API Error - Latest Snapshot]:', error.message);
      throw error;
    }
  }
};
