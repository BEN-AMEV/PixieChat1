import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, FlatList, Image, Appearance, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { userApi, User as ApiUser } from './api/api';

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
  // Database users will use default avatars
  '11': require('../assets/avatars/default.png'),
  '12': require('../assets/avatars/default.png'),
  '13': require('../assets/avatars/default.png'),
  '14': require('../assets/avatars/default.png'),
  '15': require('../assets/avatars/default.png'),
  '16': require('../assets/avatars/default.png'),
  '17': require('../assets/avatars/default.png'),
  '18': require('../assets/avatars/default.png'),
  '19': require('../assets/avatars/default.png'),
  '20': require('../assets/avatars/default.png'),
  '21': require('../assets/avatars/default.png'),
  '22': require('../assets/avatars/default.png'),
  '23': require('../assets/avatars/default.png'),
  '24': require('../assets/avatars/default.png'),
  '25': require('../assets/avatars/default.png'),
};
const defaultAvatar = require('../assets/avatars/default.png');

// User type definition for UI
interface User {
  id: string;
  name: string;
  username: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export default function SearchUsersScreen() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDiscoverPeople, setShowDiscoverPeople] = useState(true);
  const [discoverUsers, setDiscoverUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Convert API user to UI user format
  const convertApiUserToUiUser = (apiUser: ApiUser): User => {
    return {
      id: apiUser.id.toString(),
      name: `${apiUser.firstName} ${apiUser.lastName}`,
      username: `@${apiUser.username}`,
      bio: `User since ${new Date(apiUser.dateOfBirth).getFullYear()}`,
      isOnline: Math.random() > 0.5, // Random online status for demo
      lastSeen: Math.random() > 0.5 ? undefined : `${Math.floor(Math.random() * 24)} hours ago`,
    };
  };

  // Temporary mock data matching the database users we created
  const mockDatabaseUsers: ApiUser[] = [
    { id: 1, firstName: 'Dennis', lastName: 'Johnson', dateOfBirth: '1995-03-15', email: 'dennis@example.com', username: 'dennis_dev' },
    { id: 2, firstName: 'Melchisedek', lastName: 'King', dateOfBirth: '1990-07-22', email: 'melchisedek@example.com', username: 'melchisedek_king' },
    { id: 3, firstName: 'Sarah', lastName: 'Wilson', dateOfBirth: '1992-11-08', email: 'sarah@example.com', username: 'sarah_wilson' },
    { id: 4, firstName: 'Mike', lastName: 'Chen', dateOfBirth: '1988-05-12', email: 'mike@example.com', username: 'mike_chen' },
    { id: 5, firstName: 'Emma', lastName: 'Davis', dateOfBirth: '1993-09-30', email: 'emma@example.com', username: 'emma_davis' },
    { id: 6, firstName: 'James', lastName: 'Miller', dateOfBirth: '1987-12-03', email: 'james@example.com', username: 'james_miller' },
    { id: 7, firstName: 'Lisa', lastName: 'Brown', dateOfBirth: '1991-04-18', email: 'lisa@example.com', username: 'lisa_brown' },
    { id: 8, firstName: 'David', lastName: 'Lee', dateOfBirth: '1989-08-25', email: 'david@example.com', username: 'david_lee' },
  ];

  // Search function using real database (with fallback to mock data)
  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setShowDiscoverPeople(true);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setShowDiscoverPeople(false);

    try {
      // Try to get users from API first
      const apiUsers = await userApi.searchUsers(query);
      let uiUsers: User[];
      
      if (apiUsers.length > 0) {
        // Use real database users
        uiUsers = apiUsers.map(convertApiUserToUiUser);
      } else {
        // Fallback to mock data
        const filteredMockUsers = mockDatabaseUsers.filter(user =>
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
        );
        uiUsers = filteredMockUsers.map(convertApiUserToUiUser);
      }
      
      setSearchResults(uiUsers);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data on error
      const filteredMockUsers = mockDatabaseUsers.filter(user =>
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      const uiUsers = filteredMockUsers.map(convertApiUserToUiUser);
      setSearchResults(uiUsers);
    } finally {
      setIsSearching(false);
    }
  };

  // Load discover people from database (with fallback to mock data)
  const loadDiscoverUsers = async () => {
    setIsLoading(true);
    try {
      // Try to get users from API first
      const apiUsers = await userApi.getAllUsers();
      let uiUsers: User[];
      
      if (apiUsers.length > 0) {
        // Use real database users
        uiUsers = apiUsers.map(convertApiUserToUiUser);
      } else {
        // Fallback to mock data
        uiUsers = mockDatabaseUsers.map(convertApiUserToUiUser);
      }
      
      // Show random users for discovery
      const shuffled = uiUsers.sort(() => 0.5 - Math.random());
      setDiscoverUsers(shuffled.slice(0, 8)); // Show 8 random users
    } catch (error) {
      console.error('Error loading discover users:', error);
      // Fallback to mock data on error
      const uiUsers = mockDatabaseUsers.map(convertApiUserToUiUser);
      const shuffled = uiUsers.sort(() => 0.5 - Math.random());
      setDiscoverUsers(shuffled.slice(0, 8));
    } finally {
      setIsLoading(false);
    }
  };

  // Load discover people on mount
  useEffect(() => {
    loadDiscoverUsers();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        // Navigate to user profile or start chat
        router.push({
          pathname: '/ProfileScreen',
          params: { name: item.name, chatId: item.id, isNewContact: 'true' }
        });
      }}
      accessibilityLabel={`View ${item.name}'s profile`}
      accessibilityRole="button"
    >
      <View style={styles.userAvatar}>
        <Image
          source={avatarImages[item.id] || defaultAvatar}
          style={styles.avatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.userUsername, { color: theme.icon }]}>{item.username}</Text>
        {item.bio && (
          <Text style={[styles.userBio, { color: theme.icon }]} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        {!item.isOnline && item.lastSeen && (
          <Text style={[styles.lastSeen, { color: theme.icon }]}>
            Last seen {item.lastSeen}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.messageButton, { backgroundColor: theme.activeTab }]}
        onPress={() => {
          // Navigate to user's inbox/chat
          router.push({
            pathname: '/ChatDetail',
            params: { 
              userId: item.id, 
              userName: item.name, 
              userUsername: item.username,
              isNewChat: 'true'
            }
          });
        }}
        accessibilityLabel={`Message ${item.name}`}
        accessibilityRole="button"
      >
        <Ionicons name="mail" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isSearching || isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.activeTab} />
          <Text style={[styles.emptyText, { color: theme.icon }]}>
            {isSearching ? 'Searching users...' : 'Loading users...'}
          </Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={60} color={theme.icon} />
          <Text style={[styles.emptyText, { color: theme.icon }]}>
            No users found for "{searchQuery}"
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.placeholder }]}>
            Try searching with a different name or username
          </Text>
        </View>
      );
    }

    if (showDiscoverPeople) {
      return (
        <View style={styles.discoverContainer}>
          <View style={styles.discoverHeader}>
            <Ionicons name="compass" size={24} color={theme.activeTab} />
            <Text style={[styles.discoverTitle, { color: theme.text }]}>Discover People</Text>
          </View>
          <Text style={[styles.discoverSubtitle, { color: theme.icon }]}>
            People you might know
          </Text>
          {discoverUsers.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={40} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>
                No users found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.placeholder }]}>
                Try refreshing or check your connection
              </Text>
            </View>
          ) : (
            discoverUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userItem}
              onPress={() => {
                router.push({
                  pathname: '/ProfileScreen',
                  params: { name: user.name, chatId: user.id, isNewContact: 'true' }
                });
              }}
            >
              <View style={styles.userAvatar}>
                <Image
                  source={avatarImages[user.id] || defaultAvatar}
                  style={styles.avatar}
                />
                {user.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                <Text style={[styles.userUsername, { color: theme.icon }]}>{user.username}</Text>
                {user.bio && (
                  <Text style={[styles.userBio, { color: theme.icon }]} numberOfLines={1}>
                    {user.bio}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.messageButton, { backgroundColor: theme.activeTab }]}
                onPress={() => {
                  // Navigate to user's inbox/chat
                  router.push({
                    pathname: '/ChatDetail',
                    params: { 
                      userId: user.id, 
                      userName: user.name, 
                      userUsername: user.username,
                      isNewChat: 'true'
                    }
                  });
                }}
              >
                <Ionicons name="mail" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
          )}
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="people" size={60} color={theme.icon} />
        <Text style={[styles.emptyText, { color: theme.icon }]}>
          Search for users
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.placeholder }]}>
          Type a name or username to find people
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
      <StatusBar barStyle={theme.background === '#1c1c1e' ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBackground} translucent={false} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Message Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.searchBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name or username..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            accessibilityLabel="Search for users"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 10 : 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'android' ? 8 : 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 45,
  },
  clearButton: {
    marginLeft: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    minHeight: Platform.OS === 'android' ? 80 : 75,
  },
  userAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 12,
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 11,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'android' ? 60 : 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  discoverContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  discoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  discoverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  discoverSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 32,
  },
});
