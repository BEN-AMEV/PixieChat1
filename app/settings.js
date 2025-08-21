import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import meIcon from '@/assets/icons/me.png';

const Settings = () => {
  const { isDarkMode, toggleDarkMode, themePreference } = useTheme();

  const settingsItems = [
    {
      id: 'Name',
      title: 'Name',
      description: 'Dennis Dery',
      icon: 'person-outline',
      onPress: () => console.log('Name Pressed'),
    },
    {
      id: 'Birthday',
      title: 'Birthday',
      description: '8 Jan 1957',
      icon: 'calendar-outline',
      onPress: () => console.log('Birthday Pressed'),
    },
    {
      id: 'Email',
      title: 'Email',
      description: 'pixiechat@pixie.com',
      icon: 'mail-outline',
      onPress: () => console.log('Email Pressed'),
    },
    {
      id: 'DarkMode',
      title: 'Dark/Light',
      icon: isDarkMode ? 'sunny-outline' : 'moon-outline',
      description:
        themePreference === 'light'
          ? 'Light'
          : themePreference === 'dark'
          ? 'Dark'
          : 'System',
      onPress: toggleDarkMode,
    },
    {
      id: 'Logout',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: () => console.log('Logout Pressed'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: '30%',
      backgroundColor: isDarkMode ? '#121212' : '#EFEFF4',
      flexGrow: 1,
    },
    title: {
      fontSize: 20,
      paddingTop: 10,
      fontWeight: '600',
      color: isDarkMode ? 'white' : 'black',
    },
    settingsCard: {
      backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
      marginTop: 30,
      width: '90%',
      borderRadius: 20,
      paddingVertical: 10,
      overflow: 'hidden',
    },
    rowTitle: {
      fontSize: 16,
      color: isDarkMode ? 'white' : '#000',
    },
    rowDescription: {
      fontSize: 12,
      color: isDarkMode ? '#AAA' : '#888',
    },
    avatarCircle: {
      backgroundColor: isDarkMode ? '#333' : 'white',
      width: 100,
      height: 100,
      borderRadius: 50,
      borderColor: 'orange',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomColor: isDarkMode ? '#333' : '#E0E0E0',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: 12,
    },
    logoutText: {
      color: 'red',
      fontWeight: '600',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 10,
          padding: 10,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDarkMode ? 'white' : 'black'}
        />
      </TouchableOpacity>

      {/* Profile Circle */}
      <View style={styles.avatarCircle}>
        <Image
          style={{ width: 100, height: 100, borderRadius: 35 }}
          source={meIcon}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Settings Card */}
      <View style={styles.settingsCard}>
        {settingsItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.row} onPress={item.onPress}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={item.icon}
                size={24}
                color={item.id === 'Logout' ? 'red' : 'orange'}
                style={styles.icon}
              />
              <View>
                <Text
                  style={[
                    styles.rowTitle,
                    item.id === 'Logout' && styles.logoutText,
                  ]}
                >
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={styles.rowDescription}>
                    {String(item.description)}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? '#666' : '#999'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Settings;
