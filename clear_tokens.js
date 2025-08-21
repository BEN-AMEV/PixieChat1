// Quick script to clear authentication tokens
import * as SecureStore from 'expo-secure-store';

export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.log('Error clearing tokens:', error);
  }
};
