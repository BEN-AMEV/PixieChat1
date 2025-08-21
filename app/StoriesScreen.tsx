import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Appearance, Dimensions, Platform, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

// Define avatar images with a default fallback
const avatarImages: { [key: string]: any } = {
  '1': require('../assets/avatars/1.jpg'),
  '2': require('../assets/avatars/2.jpg'),
  '3': require('../assets/avatars/3.jpg'),
  '4': require('../assets/avatars/4.jpg'),
  '5': require('../assets/avatars/5.jpg'),
  '6': require('../assets/avatars/6.jpg'),
  '7': require('../assets/avatars/7.jpg'),
  '8': require('../assets/avatars/8.jpg'),
  '9': require('../assets/avatars/9.jpg'),
  '10': require('../assets/avatars/10.jpg'),
};
const defaultAvatar = require('../assets/avatars/default.png');

const { width, height } = Dimensions.get('window');

export default function StoriesScreen() {
  const { isDarkMode } = useTheme();
  const { name, chatId, storyId, storyData } = useLocalSearchParams();
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stories, setStories] = useState<any[]>([]);

  // Theme that responds to context
  const theme = isDarkMode ? {
    background: '#1c1c1e',
    headerBackground: '#2c2c2e',
    border: '#3a3a3c',
    text: '#ffffff',
    icon: '#a0a0a0',
    placeholder: '#888888',
    tab: '#a0a0a0',
    activeTab: '#ff4500',
    searchBackground: '#3a3a3c',
  } : {
    background: '#f5f5f5',
    headerBackground: '#ffffff',
    border: '#ddd',
    text: '#333',
    icon: '#888',
    placeholder: '#888',
    tab: '#888',
    activeTab: '#ff4500',
    searchBackground: '#f9f9f9',
  };

  // Initialize stories based on whether it's a user story or contact story
  useEffect(() => {
    const initializeStories = () => {
      if (name === 'Me' && storyData) {
        try {
          // Parse the passed story data
          const parsedStoryData = JSON.parse(storyData as string);
          
          // Create stories from the media items
          if (parsedStoryData.mediaItems && parsedStoryData.mediaItems.length > 0) {
            const userStories = parsedStoryData.mediaItems.map((media: any, index: number) => ({
              id: `user_story_${index}`,
              type: media.type || 'image',
              url: { uri: media.uri },
              isUserStory: true
            }));
            setStories(userStories);
          } else {
            // Fallback for single media - this shouldn't happen but just in case
            console.warn('No media items found in story data');
            setStories([{
              id: 'user_story_fallback',
              type: 'image',
              url: require('../assets/stories/1.jpg'), // Use default as fallback
              isUserStory: true
            }]);
          }
        } catch (error) {
          console.error('Error parsing story data:', error);
          // Fallback to default
          setStories([
            { id: '1', type: 'image', url: require('../assets/stories/1.jpg') },
          ]);
        }
      } else {
        // Default stories for contacts
        setStories([
          { id: '1', type: 'image', url: require('../assets/stories/1.jpg') },
          { id: '2', type: 'image', url: require('../assets/stories/2.jpg') },
        ]);
      }
    };

    initializeStories();
  }, [name, storyData]);

  useEffect(() => {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 1) return prev + 1 / (5 * 10); // 5 seconds per story
        return 1;
      });
    }, 100);

    const timer = setTimeout(() => {
      if (currentStory < stories.length - 1) {
        setCurrentStory(currentStory + 1);
      } else {
        router.back();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentStory]);

  // Progress bar component
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {stories.map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.progressBar,
            {
              backgroundColor: idx < currentStory
                ? theme.activeTab
                : idx === currentStory
                ? '#ffb199'
                : theme.border,
            }
          ]}
        >
          {idx === currentStory && (
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.activeTab,
                  width: `${progress * 100}%`,
                }
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  // Navigation handlers
  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(currentStory + 1);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentStory > 0) {
      setCurrentStory(currentStory - 1);
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: '#000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Story content - Full screen */}
      <View style={styles.storyContainer}>
        {/* Left tap area */}
        <TouchableOpacity
          style={styles.leftTapArea}
          onPress={handlePrev}
          activeOpacity={0.2}
        />
        
        {/* Right tap area */}
        <TouchableOpacity
          style={styles.rightTapArea}
          onPress={handleNext}
          activeOpacity={0.2}
        />
        
        {/* Story content */}
        <Image
          source={stories[currentStory]?.url}
          style={styles.storyImage}
          resizeMode="cover"
        />
      </View>

      {/* Top gradient overlay for better text visibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      
      {/* Header with avatar and name - floating over content */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={name === 'Me' ? avatarImages['1'] || defaultAvatar : avatarImages[chatId as string] || defaultAvatar}
            style={styles.headerAvatar}
          />
          <Text style={styles.userName}>{name}</Text>
        </View>
        <TouchableOpacity accessibilityLabel="More options" accessibilityRole="button">
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      {/* Bottom gradient overlay for better text visibility */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Bottom message input area - floating over content */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.messageInput}
          onPress={() => {
            router.back();
            router.push({
              pathname: '/ChatDetail',
              params: { name, chatId }
            });
          }}
        >
          <Text style={styles.messageInputText}>Send message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 16 : 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // Add subtle gradient overlay for better text readability
    backgroundColor: 'transparent',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ff4500',
    marginRight: 12,
    // Add subtle shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    // Add text shadow for better readability
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 4,
    marginTop: Platform.OS === 'android' ? 80 : 90,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    backgroundColor: 'transparent',
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  storyContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  leftTapArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 2,
  },
  rightTapArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 2,
  },
  storyImage: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  messageInputText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 8,
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 8,
    pointerEvents: 'none',
  },
});
