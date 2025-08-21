import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for shared media
export interface SharedMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  message?: string;
  timestamp: number;
  fromUserId: string;
  toContactIds: string[];
  chatId?: string;
}

// Storage keys
const SHARED_MEDIA_KEY = 'sharedMedia';
const CHAT_MESSAGES_KEY = 'chatMessages';

// Save shared media to storage
export const saveSharedMedia = async (media: SharedMedia): Promise<void> => {
  try {
    const existingMedia = await getSharedMedia();
    const updatedMedia = [media, ...existingMedia];
    await AsyncStorage.setItem(SHARED_MEDIA_KEY, JSON.stringify(updatedMedia));
  } catch (error) {
    console.error('Error saving shared media:', error);
    throw error;
  }
};

// Get all shared media
export const getSharedMedia = async (): Promise<SharedMedia[]> => {
  try {
    const mediaData = await AsyncStorage.getItem(SHARED_MEDIA_KEY);
    return mediaData ? JSON.parse(mediaData) : [];
  } catch (error) {
    console.error('Error getting shared media:', error);
    return [];
  }
};

// Add shared media to specific chat messages
export const addMediaToChat = async (chatId: string, media: SharedMedia): Promise<void> => {
  try {
    const chatMessage = {
      id: media.id,
      text: media.message || `Shared ${media.type}`,
      sent: true,
      timestamp: media.timestamp,
      mediaUri: media.uri,
      mediaType: media.type,
    };

    // Get existing chat messages
    const existingMessages = await AsyncStorage.getItem(`${CHAT_MESSAGES_KEY}_${chatId}`);
    const messages = existingMessages ? JSON.parse(existingMessages) : [];
    
    // Add new message
    messages.push(chatMessage);
    
    // Save updated messages
    await AsyncStorage.setItem(`${CHAT_MESSAGES_KEY}_${chatId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Error adding media to chat:', error);
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (chatId: string): Promise<any[]> => {
  try {
    const messagesData = await AsyncStorage.getItem(`${CHAT_MESSAGES_KEY}_${chatId}`);
    return messagesData ? JSON.parse(messagesData) : [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

// Clear old shared media (cleanup function)
export const clearOldSharedMedia = async (olderThanDays: number = 7): Promise<void> => {
  try {
    const allMedia = await getSharedMedia();
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const recentMedia = allMedia.filter(media => media.timestamp > cutoffTime);
    
    await AsyncStorage.setItem(SHARED_MEDIA_KEY, JSON.stringify(recentMedia));
  } catch (error) {
    console.error('Error clearing old shared media:', error);
  }
};

// API integration functions (replace with your actual backend endpoints)
export const uploadMediaToServer = async (mediaUri: string, type: 'image' | 'video'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('media', {
      uri: mediaUri,
      type: type === 'video' ? 'video/mp4' : 'image/jpeg',
      name: `media_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`,
    } as any);

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.mediaUrl; // Return the server URL of the uploaded media
  } catch (error) {
    console.error('Error uploading media to server:', error);
    // Return local URI as fallback
    return mediaUri;
  }
};

export const sendMediaMessage = async (contactIds: string[], mediaUrl: string, mediaType: 'image' | 'video', message?: string): Promise<void> => {
  try {
    const messageData = {
      contactIds,
      mediaUrl,
      mediaType,
      message: message || '',
      timestamp: Date.now(),
    };

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/messages/send-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Failed to send media message');
    }
  } catch (error) {
    console.error('Error sending media message:', error);
    throw error;
  }
};

// Helper function to get auth token (implement based on your auth system)
const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
};

// Notification functions for received media
export const notifyContactsOfSharedMedia = async (contactIds: string[], mediaType: 'image' | 'video'): Promise<void> => {
  // This would typically integrate with your push notification service
  // For now, we'll just log the notification
  console.log(`Notifying ${contactIds.length} contacts about shared ${mediaType}`);
  
  // You can integrate with services like Firebase Cloud Messaging, OneSignal, etc.
  // Example:
  // await sendPushNotification(contactIds, {
  //   title: 'New Media Shared',
  //   body: `Someone shared a ${mediaType} with you`,
  //   data: { type: 'shared_media', mediaType }
  // });
};
