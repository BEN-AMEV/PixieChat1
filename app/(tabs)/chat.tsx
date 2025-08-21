import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Appearance, Dimensions, FlatList, Image, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, StatusBar } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { userApi } from '../api/api';

// Define avatar images with a default fallback
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
};
const defaultAvatar = require('../../assets/avatars/default.png');

// Define the Chat type
interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageType: 'text' | 'media' | 'voice' | null;
  lastMessageTime: string;
  unread: boolean;
  isGroup: boolean;
  hasStory: boolean;
  messages: { id: string; text: string; sent: boolean }[];
}

const { width, height } = Dimensions.get('window');

// Define Story type
type Story = {
  id: string;
  userId: string;
  mediaUri: string;
  type: 'image' | 'video';
  timestamp: number;
  caption?: string;
};

// ChatScreen component
function ChatScreen() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

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

  // Load chats from database users
  const loadChatsFromDatabase = async () => {
    try {
      const apiUsers = await userApi.getAllUsers();
      if (apiUsers.length > 0) {
        const sampleMessages = [
          'Hey, you free tonight?',
          'Sent a photo',
          'Sent a voice note',
          'Cool, see you soon!',
          'Check this out!',
          'Lunch tomorrow?',
          'New update!',
          'Thanks for the help',
          'Shared a video',
          'Call me later'
        ];

        const messageTypes: ('text' | 'media' | 'voice' | null)[] = ['text', 'media', 'voice', 'text', 'media', 'text', 'voice', 'text', 'media', 'text'];
        const timeAgo = ['3m', '2mo', '1w', '1w', '1w', '1w', '2w', '2w', '3w', '3w'];

        const chatUsers = apiUsers.map((user, index) => ({
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          lastMessage: sampleMessages[index % sampleMessages.length],
          lastMessageType: messageTypes[index % messageTypes.length],
          lastMessageTime: timeAgo[index % timeAgo.length],
          unread: Math.random() > 0.5,
          isGroup: Math.random() > 0.8,
          hasStory: Math.random() > 0.6,
          messages: [],
        }));

        setChats(chatUsers);
      } else {
        // Fallback to default chats if no database users
        const defaultChats: Chat[] = [
          { id: '1', name: 'Dennis Johnson', lastMessage: 'Hey, you free tonight?', lastMessageType: 'text', lastMessageTime: '3m', unread: true, isGroup: true, hasStory: false, messages: [] },
          { id: '2', name: 'Melchisedek King', lastMessage: 'Sent a photo', lastMessageType: 'media', lastMessageTime: '2mo', unread: true, isGroup: true, hasStory: false, messages: [] },
          { id: '3', name: 'Sarah Wilson', lastMessage: 'Sent a voice note', lastMessageType: 'voice', lastMessageTime: '1w', unread: true, isGroup: false, hasStory: true, messages: [] },
          { id: '4', name: 'Mike Chen', lastMessage: 'Cool, see you soon!', lastMessageType: 'text', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: false, messages: [] },
          { id: '5', name: 'Emma Davis', lastMessage: 'Check this out!', lastMessageType: 'media', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: true, messages: [] },
          { id: '6', name: 'James Miller', lastMessage: 'Lunch tomorrow?', lastMessageType: 'text', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: false, messages: [] },
          { id: '7', name: 'Lisa Brown', lastMessage: 'New update!', lastMessageType: 'voice', lastMessageTime: '2w', unread: true, isGroup: false, hasStory: true, messages: [] },
          { id: '8', name: 'David Lee', lastMessage: 'Thanks for the help', lastMessageType: 'text', lastMessageTime: '2w', unread: false, isGroup: false, hasStory: false, messages: [] },
        ];
        setChats(defaultChats);
      }
    } catch (error) {
      console.error('Error loading chats from database:', error);
      // Fallback to default chats on error
      const defaultChats: Chat[] = [
        { id: '1', name: 'Dennis Johnson', lastMessage: 'Hey, you free tonight?', lastMessageType: 'text', lastMessageTime: '3m', unread: true, isGroup: true, hasStory: false, messages: [] },
        { id: '2', name: 'Melchisedek King', lastMessage: 'Sent a photo', lastMessageType: 'media', lastMessageTime: '2mo', unread: true, isGroup: true, hasStory: false, messages: [] },
        { id: '3', name: 'Sarah Wilson', lastMessage: 'Sent a voice note', lastMessageType: 'voice', lastMessageTime: '1w', unread: true, isGroup: false, hasStory: true, messages: [] },
        { id: '4', name: 'Mike Chen', lastMessage: 'Cool, see you soon!', lastMessageType: 'text', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: false, messages: [] },
        { id: '5', name: 'Emma Davis', lastMessage: 'Check this out!', lastMessageType: 'media', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: true, messages: [] },
        { id: '6', name: 'James Miller', lastMessage: 'Lunch tomorrow?', lastMessageType: 'text', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: false, messages: [] },
        { id: '7', name: 'Lisa Brown', lastMessage: 'New update!', lastMessageType: 'voice', lastMessageTime: '2w', unread: true, isGroup: false, hasStory: true, messages: [] },
        { id: '8', name: 'David Lee', lastMessage: 'Thanks for the help', lastMessageType: 'text', lastMessageTime: '2w', unread: false, isGroup: false, hasStory: false, messages: [] },
      ];
      setChats(defaultChats);
    }
  };

  // Load chats on component mount - temporarily disabled for testing
  useEffect(() => {
    // Commented out to prevent network errors during login testing
    // loadChatsFromDatabase();
    
    // Use default chats for now
    const defaultChats: Chat[] = [
      { id: '1', name: 'Dennis Johnson', lastMessage: 'Hey, you free tonight?', lastMessageType: 'text', lastMessageTime: '3m', unread: true, isGroup: false, hasStory: false, messages: [] },
      { id: '2', name: 'Melchisedek King', lastMessage: 'Sent a photo', lastMessageType: 'media', lastMessageTime: '2mo', unread: true, isGroup: false, hasStory: false, messages: [] },
      { id: '3', name: 'Mike Chen', lastMessage: 'Cool, see you soon!', lastMessageType: 'text', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: false, messages: [] },
      { id: '4', name: 'Emma Davis', lastMessage: 'Check this out!', lastMessageType: 'media', lastMessageTime: '1w', unread: false, isGroup: false, hasStory: true, messages: [] },
    ];
    setChats(defaultChats);
  }, []);

  const filteredChats = useMemo(() => {
    return chats
      .filter(chat => {
        if (activeTab === 'Unread') return chat.unread;
        if (activeTab === 'Stories') return chat.hasStory && !chat.isGroup;
        if (activeTab === 'Groups') return chat.isGroup;
        return true;
      })
      .filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [activeTab, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulate refresh
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    // Find the last received message (sent: false)
    const lastReceived = [...(item.messages || [])].reverse().find(m => !m.sent);
    const previewText = lastReceived ? lastReceived.text : item.lastMessage;

    return (
      <View style={styles.chatItem}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: item.isGroup
                ? '/ProfileScreen'
                : item.hasStory
                ? '/StoriesScreen'
                : '/ProfileScreen',
              params: { name: item.name, chatId: item.id }
            } as any);
          }}
          accessibilityLabel={
            item.isGroup
              ? `View ${item.name}'s group profile`
              : item.hasStory
              ? `View ${item.name}'s story`
              : `View ${item.name}'s profile`
          }
          accessibilityRole="button"
        >
          <Image
            source={avatarImages[item.id] || defaultAvatar}
            style={[styles.avatar, item.hasStory && !item.isGroup && styles.storyAvatar]}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatInfo}
          onPress={() => router.push({
            pathname: '/ChatDetail',
            params: { name: item.name, chatId: item.id }
          })}
          accessibilityLabel={`Open chat with ${item.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status} numberOfLines={1}>{previewText}</Text>
        </TouchableOpacity>
        {item.unread && <View style={styles.unreadBadge} />}
        <TouchableOpacity style={styles.chatButton} accessibilityLabel={`Chat options for ${item.name}`} accessibilityRole="button">
          <Ionicons name="chatbubble-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    );
  };

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
          
          // 5. Update local state with the uploaded stories
          const newStories: Story[] = assets.map((asset, index) => ({
            id: `${uploadedStory.id}_${index}`,
            userId: uploadedStory.userId,
            mediaUri: uploadedStory.mediaUrls ? uploadedStory.mediaUrls[index] : asset.uri, // Backend returns the stored URLs
            type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
            timestamp: uploadedStory.timestamp,
            caption: uploadedStory.caption,
          }));
          
          setStories(prevStories => [...prevStories, ...newStories]);

          // 6. Show success feedback
          alert(`${assets.length} media item${assets.length > 1 ? 's' : ''} uploaded successfully!`);
        } else {
          throw new Error('Upload failed');
        }
      }
    } catch (error) {
      console.error('Story upload error:', error);
      alert('Failed to upload media. Please try again.');
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

  // Fetch stories from backend
  const fetchStories = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stories`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (response.ok) {
        const fetchedStories = await response.json();
        setStories(fetchedStories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  // Load stories when component mounts
  useEffect(() => {
    fetchStories();
  }, []);

  // Dropdown menu handlers
  const handleSettingsPress = () => {
    setShowDropdown(false);
    router.push('/settings');
  };

  const handleReadAllPress = () => {
    setShowDropdown(false);
    // Mark all chats as read - you can implement this logic
    alert('All messages marked as read');
  };



  // Dropdown menu component
  const renderDropdownMenu = () => (
    <Modal
      visible={showDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDropdown(false)}
    >
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={() => setShowDropdown(false)}
      >
        <View style={[styles.dropdownMenu, { backgroundColor: theme.headerBackground, borderColor: theme.border }]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={handleSettingsPress}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={20} color={theme.text} />
            <Text style={[styles.dropdownText, { color: theme.text }]}>Settings</Text>
          </TouchableOpacity>
          <View style={[styles.dropdownDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={handleReadAllPress}
            accessibilityLabel="Read all messages"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-done-outline" size={20} color={theme.text} />
            <Text style={[styles.dropdownText, { color: theme.text }]}>Read All</Text>
          </TouchableOpacity>
          <View style={[styles.dropdownDivider, { backgroundColor: theme.border }]} />

        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Create styles based on theme
  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    container: { flex: 1 },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      paddingVertical: Platform.OS === 'android' ? 12 : 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1, 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: Platform.OS === 'android' ? 56 : 50,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
    headerIcons: { flexDirection: 'row' },
    searchBar: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 10, 
      borderBottomWidth: 1, 
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
    },
    clearSearch: { marginLeft: 10 },
    tabs: { 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      paddingVertical: 10, 
      borderBottomWidth: 1, 
    },
    tab: { fontSize: 16, paddingVertical: 5 },
    tabActive: { fontWeight: '600', borderBottomWidth: 2, borderBottomColor: '#ff4500' },
    chatItem: { 
      flexDirection: 'row', 
      padding: 12, 
      alignItems: 'center', 
      borderBottomWidth: 1, 
      borderBottomColor: '#eee',
      backgroundColor: theme.headerBackground,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    storyAvatar: { borderWidth: 2, borderColor: '#ff4500' },
    chatInfo: { flex: 1 },
    name: { fontWeight: '600', fontSize: 16, color: theme.text },
    status: { fontSize: 14, marginTop: 2, color: theme.icon },
    chatButton: { padding: 5 },
    unreadBadge: { 
      width: 10, 
      height: 10, 
      backgroundColor: '#ff4500', 
      borderRadius: 5, 
      marginRight: 10,
    },
    // Dropdown menu styles
    dropdownOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    dropdownMenu: {
      position: 'absolute',
      top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 60,
      right: 10,
      width: 140,
      borderRadius: 12,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    dropdownText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    dropdownDivider: {
      height: 0.5,
      marginHorizontal: 8,
      opacity: 0.3,
    },
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle={theme.background === '#1c1c1e' ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBackground} translucent={false} />
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Chat</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            accessibilityLabel="Add new contact" 
            accessibilityRole="button" 
            style={{ marginRight: 15 }}
            onPress={() => router.push('/SearchUsersScreen')}
          >
            <Ionicons name="add-circle" size={28} color={theme.activeTab} />
          </TouchableOpacity>
          <TouchableOpacity 
            accessibilityLabel="More options" 
            accessibilityRole="button"
            onPress={() => setShowDropdown(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.searchBar, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { borderColor: theme.border, backgroundColor: theme.searchBackground, color: theme.text }]}
          placeholder="Search..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search chats"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch} accessibilityLabel="Clear search" accessibilityRole="button">
            <Ionicons name="close" size={20} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.tabs, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => setActiveTab('All')} accessibilityRole="button">
          <Text style={[styles.tab, activeTab === 'All' && styles.tabActive, { color: activeTab === 'All' ? theme.activeTab : theme.tab }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Unread')} accessibilityRole="button">
          <Text style={[styles.tab, activeTab === 'Unread' && styles.tabActive, { color: activeTab === 'Unread' ? theme.activeTab : theme.tab }]}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Stories')} accessibilityRole="button">
          <Text style={[styles.tab, activeTab === 'Stories' && styles.tabActive, { color: activeTab === 'Stories' ? theme.activeTab : theme.tab }]}>Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Groups')} accessibilityRole="button">
          <Text style={[styles.tab, activeTab === 'Groups' && styles.tabActive, { color: activeTab === 'Groups' ? theme.activeTab : theme.tab }]}>Groups</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TouchableOpacity
          onPress={uploadStory}
          disabled={isUploadingStory}
          accessibilityLabel="Add a story (supports multiple files)"
          accessibilityRole="button"
          style={{
            backgroundColor: isUploadingStory ? theme.placeholder : theme.activeTab,
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
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.icon}
          />
        }
      />
      {renderDropdownMenu()}
    </SafeAreaView>
  );
}

export default ChatScreen;
