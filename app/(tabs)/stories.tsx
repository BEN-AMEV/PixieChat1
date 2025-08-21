import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { userApi } from '../api/api';
import { gamingSystem } from '@/utils/gamingSystem';
import StoryReactions from '@/components/StoryReactions';

const { width } = Dimensions.get('window');

// Define Story type
type Story = {
  id: string;
  userName: string;
  userAvatar: string;
  storyImage: string;
  timestamp: string;
  isViewed: boolean;
  isMe?: boolean; // Add this to identify user's own story
  mediaItems?: { uri: string; type: 'image' | 'video' }[]; // Support multiple media items
};

// Define avatar images
const avatarImages: { [key: string]: any } = {
  '1': require('../../assets/avatars/1.jpg'),
  '2': require('../../assets/avatars/2.jpg'),
  '3': require('../../assets/avatars/3.jpg'),
  '4': require('../../assets/avatars/4.jpg'),
  '5': require('../../assets/avatars/5.jpg'),
  '6': require('../../assets/avatars/6.jpg'),
  '7': require('../../assets/avatars/7.jpg'),
  '8': require('../../assets/avatars/8.jpg'),
  '9': require('../../assets/avatars/9.jpg'),
  '10': require('../../assets/avatars/10.jpg'),
  '11': require('../../assets/avatars/default.png'),
  '12': require('../../assets/avatars/default.png'),
  '13': require('../../assets/avatars/default.png'),
  '14': require('../../assets/avatars/default.png'),
  '15': require('../../assets/avatars/default.png'),
  '16': require('../../assets/avatars/default.png'),
  '17': require('../../assets/avatars/default.png'),
  '18': require('../../assets/avatars/default.png'),
  '19': require('../../assets/avatars/default.png'),
  '20': require('../../assets/avatars/default.png'),
  '21': require('../../assets/avatars/default.png'),
  '22': require('../../assets/avatars/default.png'),
  '23': require('../../assets/avatars/default.png'),
  '24': require('../../assets/avatars/default.png'),
  '25': require('../../assets/avatars/default.png'),
  'me': require('../../assets/avatars/1.jpg'), // User's avatar
};
const defaultAvatar = require('../../assets/avatars/default.png');

function StoriesScreen() {
  const { isDarkMode } = useTheme();
  const [stories, setStories] = useState<Story[]>([]);
  const [userStory, setUserStory] = useState<Story | null>(null); // User's own story
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [showStoryReactions, setShowStoryReactions] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  // Theme that responds to context
  const theme = isDarkMode ? {
    background: '#1c1c1e',
    headerBackground: '#2c2c2e',
    border: '#3a3a3c',
    text: '#ffffff',
    icon: '#a0a0a0',
    placeholder: '#888888',
    cardBackground: '#2c2c2e',
    accent: '#ff4500',
  } : {
    background: '#f5f5f5',
    headerBackground: '#ffffff',
    border: '#ddd',
    text: '#333',
    icon: '#888',
    placeholder: '#888',
    cardBackground: '#ffffff',
    accent: '#ff4500',
  };

  // Load stories from database users
  const loadStoriesFromDatabase = async () => {
    try {
      const apiUsers = await userApi.getAllUsers();
      if (apiUsers.length > 0) {
        const timestamps = ['2h', '4h', '6h', '8h', '1d', '2d'];
        const storyUsers = apiUsers
          .filter(() => Math.random() > 0.3) // Only some users have stories
          .map((user, index) => ({
            id: user.id.toString(),
            userName: `${user.firstName} ${user.lastName}`,
            userAvatar: user.id.toString(),
            storyImage: `../../assets/avatars/${user.id}.jpg`,
            timestamp: timestamps[index % timestamps.length],
            isViewed: Math.random() > 0.5,
          }));
        
        setStories(storyUsers);
      } else {
        // Fallback to default stories if no database users
        const defaultStories: Story[] = [
          {
            id: '1',
            userName: 'Dennis Johnson',
            userAvatar: '1',
            storyImage: '../../assets/avatars/1.jpg',
            timestamp: '2h',
            isViewed: false,
          },
          {
            id: '2',
            userName: 'Melchisedek King',
            userAvatar: '2',
            storyImage: '../../assets/avatars/2.jpg',
            timestamp: '4h',
            isViewed: false,
          },
          {
            id: '3',
            userName: 'Sarah Wilson',
            userAvatar: '3',
            storyImage: '../../assets/avatars/3.jpg',
            timestamp: '6h',
            isViewed: true,
          },
          {
            id: '4',
            userName: 'Mike Chen',
            userAvatar: '4',
            storyImage: '../../assets/avatars/4.jpg',
            timestamp: '8h',
            isViewed: false,
          },
        ];
        setStories(defaultStories);
      }
    } catch (error) {
      console.error('Error loading stories from database:', error);
      // Fallback to default stories on error
      const defaultStories: Story[] = [
        {
          id: '1',
          userName: 'Dennis Johnson',
          userAvatar: '1',
          storyImage: '../../assets/avatars/1.jpg',
          timestamp: '2h',
          isViewed: false,
        },
        {
          id: '2',
          userName: 'Melchisedek King',
          userAvatar: '2',
          storyImage: '../../assets/avatars/2.jpg',
          timestamp: '4h',
          isViewed: false,
        },
        {
          id: '3',
          userName: 'Sarah Wilson',
          userAvatar: '3',
          storyImage: '../../assets/avatars/3.jpg',
          timestamp: '6h',
          isViewed: true,
        },
        {
          id: '4',
          userName: 'Mike Chen',
          userAvatar: '4',
          storyImage: '../../assets/avatars/4.jpg',
          timestamp: '8h',
          isViewed: false,
        },
      ];
      setStories(defaultStories);
    }
  };

  // Load stories on component mount
  useEffect(() => {
    loadStoriesFromDatabase();
  }, []);

  // Enhanced story upload logic for multiple media support
  const uploadStory = async () => {
    try {
      setIsUploadingStory(true);
      
      // 1. Pick multiple media from user's device
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false, // Disable editing to allow multiple selection
        allowsMultipleSelection: true, // Enable multiple selection
        quality: 0.8, // Reduced for faster upload
        selectionLimit: 10, // Limit to 10 media items for stories
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assets = result.assets;
        const mediaItems = assets.map(asset => ({
          uri: asset.uri,
          type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video'
        }));
        
        // Helper function to create user story with multiple media
        const createUserStory = (mediaList: { uri: string; type: 'image' | 'video' }[]) => ({
          id: `user_${Date.now()}`,
          userName: 'Me',
          userAvatar: 'me',
          storyImage: mediaList[0].uri, // Use first image as main display
          timestamp: 'now',
          isViewed: false,
          isMe: true,
          mediaItems: mediaList, // Store all media items
        });
        
        try {
          // 2. Create FormData for multiple files upload
          const formData = new FormData();
          
          // Add all media files
          assets.forEach((asset, index) => {
            formData.append(`media_${index}`, {
              uri: asset.uri,
              type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
              name: `story_${Date.now()}_${index}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
            } as any);
          });

          // 3. Add metadata
          formData.append('mediaCount', assets.length.toString());
          formData.append('caption', ''); // Add caption input later
          formData.append('timestamp', Date.now().toString());

          // 4. Upload to backend (replace with your API endpoint)
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stories/upload-multiple`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${await getAuthToken()}`, // Get user's auth token
            },
            body: formData,
          });

          if (response.ok) {
            const uploadedStory = await response.json();
            
            // 5. Create user story and add to state
            const newUserStory: Story = createUserStory(mediaItems);
            setUserStory(newUserStory);
            
            // Record story activity for gaming system
            await gamingSystem.recordActivity('story');
            
            // 6. Show success feedback
            alert(`Story with ${assets.length} media item${assets.length > 1 ? 's' : ''} uploaded successfully!`);
          } else {
            throw new Error('Upload failed');
          }
        } catch (uploadError) {
          console.error('Story upload error:', uploadError);
          
          // Fallback: Still create story locally if upload fails
          const newUserStory: Story = createUserStory(mediaItems);
          setUserStory(newUserStory);
          
          // Record story activity for gaming system
          await gamingSystem.recordActivity('story');
          alert(`Story with ${assets.length} media item${assets.length > 1 ? 's' : ''} saved locally (upload failed)`);
        }
      }
    } catch (error) {
      console.error('Story selection error:', error);
      alert('Failed to select media. Please try again.');
    } finally {
      setIsUploadingStory(false);
    }
  };

  // Helper function to get auth token (implement based on your auth system)
  const getAuthToken = async () => {
    // Replace with your actual token retrieval logic
    // For example, from SecureStore, AsyncStorage, or context
    return 'your-auth-token-here';
  };

  // Helper function to create combined data for single FlatList
  const getCombinedData = () => {
    const combinedData: (Story | { isHeader: boolean; title: string } | { isUserStory: boolean })[] = [];
    
    // Add user story if it exists
    if (userStory) {
      combinedData.push({ isHeader: true, title: 'Your Story' });
      combinedData.push({ isUserStory: true });
    }
    
    // Add recent stories header and stories
    if (stories.length > 0) {
      combinedData.push({ isHeader: true, title: 'Recent Stories' });
      combinedData.push(...stories);
    }
    
    return combinedData;
  };

  // Render user's own story with special styling
  const renderUserStory = () => {
    if (!userStory) return null;
    
    return (
      <View style={styles.userStoryContainer}>
        <TouchableOpacity
          style={[styles.userStoryCard, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
          onPress={() => {
            // Navigate to story viewer for user's story with actual story data
            router.push({
              pathname: '/StoriesScreen',
              params: { 
                name: 'Me', 
                storyId: userStory.id,
                storyData: JSON.stringify({
                  mediaItems: userStory.mediaItems || [{ uri: userStory.storyImage, type: 'image' }],
                  userName: userStory.userName,
                  timestamp: userStory.timestamp
                })
              }
            });
          }}
          accessibilityLabel="View your story"
          accessibilityRole="button"
        >
          <View style={styles.userStoryImageContainer}>
            <Image
              source={{ uri: userStory.storyImage }}
              style={[styles.userStoryImage, styles.myStoryBorder]}
            />
            <View style={[styles.storyOverlay, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.timestamp, { color: theme.icon }]}>{userStory.timestamp}</Text>
            </View>
            {/* Multiple media indicator */}
            {userStory.mediaItems && userStory.mediaItems.length > 1 && (
              <View style={[styles.mediaCountBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <Ionicons name="layers" size={12} color="#fff" />
                <Text style={styles.mediaCountText}>{userStory.mediaItems.length}</Text>
              </View>
            )}
            {/* "Me" badge */}
            <View style={[styles.meBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.meBadgeText}>ME</Text>
            </View>
          </View>
          <View style={styles.storyInfo}>
            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
              {userStory.userName}
            </Text>
            <Text style={[styles.storyStatus, { color: theme.accent }]}>
              Your Story
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStoryItem = ({ item }: { item: Story }) => {
    return (
      <TouchableOpacity
        style={[styles.storyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => {
          // Navigate to story viewer
          router.push({
            pathname: '/StoriesScreen',
            params: { name: item.userName, storyId: item.id }
          });
        }}
        accessibilityLabel={`View ${item.userName}'s story`}
        accessibilityRole="button"
      >
        <View style={styles.storyImageContainer}>
          <Image
            source={avatarImages[item.userAvatar] || defaultAvatar}
            style={[
              styles.storyImage,
              item.isViewed ? styles.viewedStory : styles.unviewedStory
            ]}
          />
          <View style={[styles.storyOverlay, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.timestamp, { color: theme.icon }]}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={styles.storyInfo}>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={[styles.storyStatus, { color: theme.icon }]}>
            {item.isViewed ? 'Viewed' : 'New'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Unified render function for FlatList
  const renderCombinedItem = ({ item, index }: { item: any; index: number }) => {
    // Render section header
    if ('isHeader' in item && item.isHeader) {
      return (
        <Text style={[styles.sectionTitle, { marginTop: index === 0 ? 0 : 24, marginBottom: 16 }]}>
          {item.title}
        </Text>
      );
    }
    
    // Render user story
    if ('isUserStory' in item && item.isUserStory) {
      return renderUserStory();
    }
    
    // Render regular story
    return renderStoryItem({ item: item as Story });
  };

  const numColumns = 2;
  const itemSize = (width - 48) / numColumns; // Account for padding and margins

  // Create styles based on theme
  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Platform.OS === 'android' ? 12 : 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.headerBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: Platform.OS === 'android' ? 56 : 50,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    storiesGrid: {
      flex: 1,
    },
    storyCard: {
      width: itemSize,
      marginBottom: 16,
      marginHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    storyImageContainer: {
      position: 'relative',
      width: '100%',
      aspectRatio: 1,
    },
    storyImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    unviewedStory: {
      borderWidth: 3,
      borderColor: '#ff4500',
    },
    viewedStory: {
      borderWidth: 3,
      borderColor: '#888888',
    },
    storyOverlay: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      opacity: 0.9,
    },
    timestamp: {
      fontSize: 10,
      fontWeight: '500',
    },
    storyInfo: {
      padding: 12,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    storyStatus: {
      fontSize: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme.icon,
      textAlign: 'center',
      marginTop: 16,
    },
    // User story styles
    userStoryContainer: {
      paddingHorizontal: 16,
      marginBottom: 20,
      alignItems: 'flex-start', // Align to start instead of stretching
    },
    userStoryCard: {
      width: itemSize, // Same width as regular story cards
      borderRadius: 16,
      borderWidth: 2,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    userStoryImageContainer: {
      position: 'relative',
      width: '100%',
      aspectRatio: 1,
    },
    userStoryImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
    },
    myStoryBorder: {
      borderWidth: 4,
      borderColor: '#ff4500',
    },
    meBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    meBadgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    mediaCountBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    mediaCountText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 3,
    },
  });

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar 
          barStyle={theme.background === '#1c1c1e' ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.headerBackground} 
          translucent={false} 
        />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stories</Text>
        </View>

        {/* Add Story Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TouchableOpacity
            onPress={uploadStory}
            disabled={isUploadingStory}
            accessibilityLabel="Add a story (supports multiple files)"
            accessibilityRole="button"
            style={{
              backgroundColor: isUploadingStory ? theme.placeholder : theme.accent,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginRight: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {isUploadingStory ? (
              <>
                <Ionicons name="hourglass-outline" size={22} color="#fff" />
                <Text style={{ color: '#fff', marginLeft: 6, fontWeight: 'bold' }}>Uploading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={{ color: '#fff', marginLeft: 6, fontWeight: 'bold' }}>Add Story</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {getCombinedData().length > 0 ? (
            <FlatList
              data={getCombinedData()}
              renderItem={renderCombinedItem}
              keyExtractor={(item, index) => {
                if ('isHeader' in item && item.isHeader) return `header-${item.title}`;
                if ('isUserStory' in item && item.isUserStory) return 'user-story';
                return (item as Story).id;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={styles.storiesGrid}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={theme.icon} />
              <Text style={styles.emptyText}>
                No stories available.{'\n'}
                Check back later for new stories from your contacts!
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Story Reactions */}
      <StoryReactions
        storyId={selectedStoryId || 'default'}
        onReactionAdd={(reaction) => {
          console.log('Story reaction added:', reaction);
          gamingSystem.recordActivity('reaction');
        }}
        isVisible={showStoryReactions}
      />
    </>
  );
}

export default StoriesScreen;
