import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Appearance, Platform, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

export default function ProfileScreen() {
  const { isDarkMode } = useTheme();
  const { name, chatId } = useLocalSearchParams();

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

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
      <StatusBar barStyle={theme.background === '#1c1c1e' ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBackground} translucent={false} />
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Image 
          source={avatarImages[chatId as string] || defaultAvatar} 
          style={styles.profileAvatar} 
        />
        <Text style={[styles.profileName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.profileBio, { color: theme.icon }]}>Active user</Text>
        
        <View style={styles.profileActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.activeTab }]}
            accessibilityLabel="Call user" 
            accessibilityRole="button"
          >
            <Ionicons name="call-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.activeTab }]}
            accessibilityLabel="Video call user" 
            accessibilityRole="button"
          >
            <Ionicons name="videocam-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.activeTab }]}
            accessibilityLabel="Send message" 
            accessibilityRole="button"
            onPress={() => router.push({
              pathname: '/ChatDetail',
              params: { name, chatId }
            })}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between', 
    paddingVertical: Platform.OS === 'android' ? 12 : 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  profileAvatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#ff4500',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    marginBottom: 40,
  },
  profileActions: { 
    flexDirection: 'row', 
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
