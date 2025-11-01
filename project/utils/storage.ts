import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  UPLOADED_IMAGE_URI: 'uploaded_image_uri',
} as const;

export const storage = {
  // Store JWT token
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get JWT token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Remove JWT token
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Store user data
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Get user data
  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Remove user data
  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Clear all auth data
  async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUserData(),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },

  // Store uploaded image URI (session storage)
  async setUploadedImageUri(uri: string | null): Promise<void> {
    try {
      if (uri) {
        await AsyncStorage.setItem(STORAGE_KEYS.UPLOADED_IMAGE_URI, uri);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.UPLOADED_IMAGE_URI);
      }
    } catch (error) {
      console.error('Error storing uploaded image URI:', error);
    }
  },

  // Get uploaded image URI (session storage)
  async getUploadedImageUri(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.UPLOADED_IMAGE_URI);
    } catch (error) {
      console.error('Error retrieving uploaded image URI:', error);
      return null;
    }
  },

  // Remove uploaded image URI (session storage)
  async removeUploadedImageUri(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.UPLOADED_IMAGE_URI);
    } catch (error) {
      console.error('Error removing uploaded image URI:', error);
    }
  },
};
