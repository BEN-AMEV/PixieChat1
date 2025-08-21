import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import api from '../api/api';

const { width, height } = Dimensions.get('window');

// Define avatar images
const avatarImages = {
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

// Default avatar fallback
const defaultAvatar = require('../../assets/avatars/default.png');

// Helper function to get avatar source
const getAvatarSource = (avatarId) => {
  if (!avatarId || avatarId === '11' || avatarId === 'default') {
    return defaultAvatar;
  }
  return avatarImages[avatarId] || defaultAvatar;
};

// Dark map style for Snapchat-like appearance
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }]
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }]
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  }
];

export default function SnapMap() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const mapRef = useRef(null);
  
  // Theme configuration
  const theme = isDarkMode ? {
    background: '#1a1a1a',
    cardBackground: '#2a2a2a',
    text: '#ffffff',
    secondaryText: '#b0b0b0',
    border: '#404040',
    accent: '#0095f6',
    snapYellow: '#fffc00',
    surface: '#303030',
  } : {
    background: '#ffffff',
    cardBackground: '#f8f9fa',
    text: '#000000',
    secondaryText: '#6c757d',
    border: '#e9ecef',
    accent: '#0095f6',
    snapYellow: '#fffc00',
    surface: '#ffffff',
  };

  // State management
  const [location, setLocation] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [ghostMode, setGhostMode] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [isSharingLocation, setIsSharingLocation] = useState(true);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null);
  
  // Animation refs for pulsing effects
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const friendPulseAnims = useRef({}).current;
  

  
  // Get user's location for map center - using static coordinates for testing
  const [userLocation, setUserLocation] = useState({
    latitude: 5.6037, // Accra, Ghana coordinates for testing
    longitude: -0.187,
  });

  // Enhanced friends data with real-time location capabilities
  const [friends, setFriends] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sarahj_snap',
      latitude: 5.6047,
      longitude: -0.186,
      avatarId: '11', // Using default.png
      lastSeen: Date.now() - 300000,
      status: 'active',
      hasStory: true,
      isBestFriend: true,
      shareLocation: true,
      mood: '😎',
      activity: 'at Starbucks',
      speed: 0,
      isOnline: true,
      lastLocationUpdate: Date.now(),
    },
    {
      id: '2', 
      name: 'Mike Chen',
      username: 'mike_adventures',
      latitude: 5.6027,
      longitude: -0.188,
      avatarId: '11', // Using default.png
      lastSeen: Date.now() - 1800000,
      status: 'idle',
      hasStory: false,
      isBestFriend: false,
      shareLocation: true,
      mood: '🎵',
      activity: 'listening to music',
      speed: 25,
      isOnline: true,
      lastLocationUpdate: Date.now(),
    },
    {
      id: '3',
      name: 'Emma Wilson',
      username: 'emma_explorer',
      latitude: 5.6057,
      longitude: -0.185,
      avatarId: '11', // Using default.png
      lastSeen: Date.now() - 600000,
      status: 'active',
      hasStory: true,
      isBestFriend: true,
      shareLocation: true,
      mood: '🏃‍♀️',
      activity: 'running',
      speed: 12,
      isOnline: true,
      lastLocationUpdate: Date.now(),
    },
    {
      id: '4',
      name: 'Jake Miller',
      username: 'jake_photos',
      latitude: 5.6017,
      longitude: -0.189,
      avatarId: '11', // Using default.png
      lastSeen: Date.now() - 7200000,
      status: 'sleeping',
      hasStory: false,
      isBestFriend: false,
      shareLocation: true,
      mood: '📸',
      activity: 'taking photos',
      speed: 0,
      isOnline: false,
      lastLocationUpdate: Date.now(),
    },
    {
      id: '5',
      name: 'Lisa Brown',
      username: 'lisa_brown',
      latitude: 5.6045,
      longitude: -0.1860,
      avatarId: '11', // Using default.png
      lastSeen: Date.now() - 60000,
      status: 'active',
      hasStory: true,
      isBestFriend: true,
      shareLocation: true,
      mood: '☕',
      activity: 'at coffee shop',
      speed: 0,
      isOnline: true,
      lastLocationUpdate: Date.now(),
    }
  ]);

  // Initialize pulse animations for each friend
  useEffect(() => {
    friends.forEach(friend => {
      if (!friendPulseAnims[friend.id]) {
        friendPulseAnims[friend.id] = new Animated.Value(1);
      }
    });
  }, [friends]);

  // Start pulse animations for active friends
  useEffect(() => {
    friends.forEach(friend => {
      if (friend.isOnline && friend.shareLocation && friendPulseAnims[friend.id]) {
        try {
          Animated.loop(
            Animated.sequence([
              Animated.timing(friendPulseAnims[friend.id], {
                toValue: 1.2,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(friendPulseAnims[friend.id], {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ).start();
        } catch (error) {
          console.log('Animation error for friend:', friend.id, error);
        }
      }
    });
  }, [friends, friendPulseAnims]);

  // Location tracking and sharing
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location access is required for the map');
        setLocation(userLocation);
        return;
      }

      let userLocationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = userLocationData.coords;
      setLocation(coords);
      
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      // Center map on user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      // Share location with friends if enabled
      if (isSharingLocation) {
        await shareLocationWithFriends(coords);
      }

      console.log('User location obtained:', coords.latitude, coords.longitude);
    })();
  }, []);

  // Set up periodic location updates
  useEffect(() => {
    if (isSharingLocation) {
      const interval = setInterval(async () => {
        try {
          const userLocationData = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const coords = userLocationData.coords;
          setLocation(coords);
          setUserLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          // Share updated location
          await shareLocationWithFriends(coords);
        } catch (error) {
          console.log('Error updating location:', error);
        }
      }, 30000); // Update every 30 seconds

      setLocationUpdateInterval(interval);
    }

    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [isSharingLocation]);

  // Fetch friends' locations periodically
  useEffect(() => {
    const fetchFriendsLocations = async () => {
      try {
        const response = await api.get('/friends/locations');
        if (response.data && response.data.friends) {
          setFriends(prevFriends => 
            prevFriends.map(friend => {
              const updatedFriend = response.data.friends.find(f => f.id === friend.id);
              if (updatedFriend && updatedFriend.shareLocation) {
                return {
                  ...friend,
                  latitude: updatedFriend.latitude,
                  longitude: updatedFriend.longitude,
                  lastLocationUpdate: Date.now(),
                  status: updatedFriend.status,
                  activity: updatedFriend.activity,
                  speed: updatedFriend.speed,
                  isOnline: updatedFriend.isOnline,
                };
              }
              return friend;
            })
          );
        }
      } catch (error) {
        console.log('Error fetching friends locations:', error);
      }
    };

    const interval = setInterval(fetchFriendsLocations, 15000); // Fetch every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Share location with friends API call
  const shareLocationWithFriends = async (coords) => {
    try {
      await api.post('/location/share', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: Date.now(),
        activity: 'using app',
        speed: 0,
      });
    } catch (error) {
      console.log('Error sharing location:', error);
    }
  };

  // Pulse animation for current user
  useEffect(() => {
    if (pulseAnim) {
      try {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } catch (error) {
        console.log('Main pulse animation error:', error);
      }
    }
  }, [pulseAnim]);

  // Helper functions
  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getStatusColor = (status, lastSeen) => {
    const isRecent = Date.now() - lastSeen < 300000; // 5 minutes
    
    if (!isRecent) return '#6c757d';
    
    switch (status) {
      case 'active': return '#00ff00';
      case 'idle': return '#fffc00';
      case 'sleeping': return '#ff6b6b';
      default: return '#6c757d';
    }
  };

  const getActivityIcon = (activity, speed) => {
    if (speed > 50) return '🚗';
    if (speed > 20) return '🚴‍♂️';
    if (speed > 5) return '🏃‍♂️';
    if (activity?.includes('music')) return '🎵';
    if (activity?.includes('coffee') || activity?.includes('Starbucks')) return '☕';
    if (activity?.includes('photo')) return '📸';
    return '📍';
  };

  // Event handlers
  const handleFriendPress = (friend) => {
    setSelectedFriend(friend);
    Vibration.vibrate(50);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowActionSheet(false);
      setSelectedFriend(null);
    });
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      // Add haptic feedback
      Vibration.vibrate(50);
      
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
      
      // Show feedback
      Alert.alert('Location', 'Centered on your location', [{ text: 'OK' }], { cancelable: true });
    } else {
      Alert.alert('Location', 'Unable to get your location. Please check location permissions.', [{ text: 'OK' }]);
    }
  };

  const centerOnFriends = () => {
    const activeFriends = friends.filter(f => f.shareLocation && f.isOnline);
    const allSharingFriends = friends.filter(f => f.shareLocation);
    
    if (allSharingFriends.length === 0) {
      Alert.alert('Friends', 'No friends are currently sharing their location', [{ text: 'OK' }]);
      return;
    }

    const coordinates = allSharingFriends.map(f => ({ latitude: f.latitude, longitude: f.longitude }));
    
    if (coordinates.length > 0 && mapRef.current) {
      // Add haptic feedback
      Vibration.vibrate(50);
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
      
      // Show feedback with more details
      const onlineCount = activeFriends.length;
      const totalCount = allSharingFriends.length;
      Alert.alert(
        'Friends Found', 
        `${totalCount} friend${totalCount > 1 ? 's' : ''} sharing location\n${onlineCount} currently online`, 
        [{ text: 'OK' }], 
        { cancelable: true }
      );
    }
  };

  const toggleGhostMode = () => {
    setGhostMode(!ghostMode);
    Vibration.vibrate(100);
  };

  const toggleLocationSharing = async () => {
    const newSharingState = !isSharingLocation;
    setIsSharingLocation(newSharingState);
    
    if (newSharingState && location) {
      await shareLocationWithFriends(location);
    }
    
    Vibration.vibrate(100);
  };

  const openChat = (friend) => {
    try {
      closeActionSheet();
      router.push({
        pathname: '/ChatDetail',
        params: { 
          name: friend.name, 
          chatId: friend.id 
        }
      });
    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  // Render friend marker with enhanced pulsing animation
  const renderFriendMarker = (friend) => {
    if (!friend.shareLocation) return null;

    const isRecent = Date.now() - friend.lastSeen < 1800000; // 30 minutes
    const isActive = friend.isOnline && Date.now() - friend.lastLocationUpdate < 60000; // 1 minute
    const opacity = isRecent ? 1 : 0.6;
    const pulseAnim = friendPulseAnims[friend.id];



    return (
      <Marker
        key={friend.id}
        coordinate={{ latitude: friend.latitude, longitude: friend.longitude }}
        onPress={() => handleFriendPress(friend)}
        tracksViewChanges={false}
      >
        <Animated.View style={[
          styles.friendMarker,
          { 
            opacity,
            transform: isActive && pulseAnim ? [{ scale: pulseAnim }] : [{ scale: 1 }]
          }
        ]}>
          {/* Pulsing ring for active friends */}
          {isActive && pulseAnim && (
            <Animated.View 
              style={[
                styles.activePulseRing,
                { 
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.3, 0],
                  })
                }
              ]} 
            />
          )}
          
          {/* Story ring */}
          {friend.hasStory && (
            <View style={[styles.storyRing, { borderColor: theme.snapYellow }]} />
          )}
          
          {/* Best friend ring */}
          {friend.isBestFriend && (
            <View style={[styles.bestFriendRing, { borderColor: '#FFD700' }]} />
          )}
          
          {/* Avatar */}
          <Image 
            source={getAvatarSource(friend.avatarId)} 
            style={styles.friendAvatar}
            onError={(error) => {
              console.log(`Failed to load avatar for ${friend.name} (ID: ${friend.avatarId}):`, error);
            }}
            onLoad={() => {
              console.log(`Successfully loaded avatar for ${friend.name} (ID: ${friend.avatarId})`);
            }}
            defaultSource={defaultAvatar}
          />
          
          {/* Status dot */}
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(friend.status, friend.lastSeen) }
          ]} />
          
          {/* Activity icon */}
          <View style={styles.activityIcon}>
            <Text style={styles.activityEmoji}>
              {getActivityIcon(friend.activity, friend.speed)}
            </Text>
          </View>
          
          {/* Live indicator for active friends */}
          {isActive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
          )}
        </Animated.View>
      </Marker>
    );
  };

  // Render current user marker with enhanced pulsing
  const renderUserMarker = () => {
    if (!location || ghostMode) return null;

    return (
      <Marker
        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
        tracksViewChanges={false}
      >
        <Animated.View style={[
          styles.userMarker,
          { transform: pulseAnim ? [{ scale: pulseAnim }] : [{ scale: 1 }] }
        ]}>
          {/* Multiple pulsing rings for user */}
          {pulseAnim && (
            <>
              <Animated.View 
                style={[
                  styles.userPulseRing1,
                  { 
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.4, 0],
                    })
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.userPulseRing2,
                  { 
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.2, 0],
                    })
                  }
                ]} 
              />
            </>
          )}
          
          <LinearGradient
            colors={['#00d4ff', '#0095f6']}
            style={styles.userMarkerGradient}
          >
            <Image 
              source={getAvatarSource('11')} 
              style={styles.userAvatar}
              defaultSource={defaultAvatar}
              onError={(error) => {
                console.log('Failed to load user avatar:', error);
              }}
              onLoad={() => {
                console.log('Successfully loaded user avatar');
              }}
            />
          </LinearGradient>
          
          {/* Location sharing indicator */}
          {isSharingLocation && (
            <View style={styles.sharingIndicator}>
              <Ionicons name="location" size={36} color="#00ff00" />
            </View>
          )}
        </Animated.View>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        customMapStyle={isDarkMode ? darkMapStyle : []}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={() => {
          if (showActionSheet) closeActionSheet();
          if (showSearch) setShowSearch(false);
        }}
      >
        {renderUserMarker()}
        {friends.map(renderFriendMarker)}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={toggleGhostMode} style={styles.headerButton}>
          <Ionicons 
            name={ghostMode ? "eye-off" : "eye"} 
            size={24} 
            color={ghostMode ? theme.accent : theme.text} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Snap Map</Text>
        
        <TouchableOpacity 
          onPress={() => setShowSearch(true)} 
          style={styles.headerButton}
        >
          <Ionicons name="search" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: theme.surface }]}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Ionicons name="layers" size={20} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: theme.surface }]}
          onPress={centerOnUser}
        >
          <Ionicons name="navigate-circle" size={20} color={theme.accent} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: theme.surface }]}
          onPress={centerOnFriends}
        >
          <Ionicons name="people-circle" size={20} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { 
              backgroundColor: isSharingLocation ? theme.accent : theme.surface,
              borderWidth: isSharingLocation ? 0 : 2,
              borderColor: isSharingLocation ? 'transparent' : theme.accent,
            }
          ]}
          onPress={toggleLocationSharing}
        >
          <Ionicons 
            name="location" 
            size={20} 
            color={isSharingLocation ? 'white' : theme.accent} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.searchModalOverlay}>
          <View style={[styles.searchModal, { backgroundColor: theme.surface }]}>
            <View style={styles.searchHeader}>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: theme.border,
                }]}
                placeholder="Search friends or places..."
                placeholderTextColor={theme.secondaryText}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
              <TouchableOpacity 
                onPress={() => setShowSearch(false)}
                style={styles.searchCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {/* Search results */}
            <ScrollView style={styles.searchResults}>
              {friends
                .filter(f => 
                  f.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  f.username.toLowerCase().includes(searchText.toLowerCase())
                )
                .map(friend => (
                  <TouchableOpacity 
                    key={friend.id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setShowSearch(false);
                      handleFriendPress(friend);
                    }}
                  >
                    <Image source={friend.avatar} style={styles.searchResultAvatar} />
                    <View style={styles.searchResultInfo}>
                      <Text style={[styles.searchResultName, { color: theme.text }]}>
                        {friend.name}
                      </Text>
                      <Text style={[styles.searchResultUsername, { color: theme.secondaryText }]}>
                        @{friend.username} • {getTimeAgo(friend.lastSeen)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Friend Action Sheet */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="none"
        onRequestClose={closeActionSheet}
      >
        <View style={styles.actionSheetOverlay}>
          <TouchableOpacity 
            style={styles.actionSheetBackdrop}
            onPress={closeActionSheet}
          />
          
          <Animated.View 
            style={[
              styles.actionSheet,
              { 
                backgroundColor: theme.surface,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {selectedFriend && (
              <>
                {/* Friend info header */}
                <View style={styles.actionSheetHeader}>
                  <Image source={selectedFriend.avatar} style={styles.actionSheetAvatar} />
                  <View style={styles.actionSheetInfo}>
                    <Text style={[styles.actionSheetName, { color: theme.text }]}>
                      {selectedFriend.name}
                    </Text>
                    <Text style={[styles.actionSheetDetails, { color: theme.secondaryText }]}>
                      @{selectedFriend.username} • {getTimeAgo(selectedFriend.lastSeen)}
                    </Text>
                    <Text style={[styles.actionSheetActivity, { color: theme.secondaryText }]}>
                      {selectedFriend.activity} {getActivityIcon(selectedFriend.activity, selectedFriend.speed)}
                    </Text>
                  </View>
                  {selectedFriend.isBestFriend && (
                    <View style={styles.bestFriendBadge}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                    </View>
                  )}
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.accent }]}
                    onPress={() => openChat(selectedFriend)}
                  >
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Chat</Text>
                  </TouchableOpacity>
                  
                  {selectedFriend.hasStory && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.snapYellow }]}
                      onPress={() => {
                        try {
                          closeActionSheet();
                          router.push({
                            pathname: '/StoriesScreen',
                            params: { 
                              name: selectedFriend.name,
                              chatId: selectedFriend.id 
                            }
                          });
                        } catch (error) {
                          console.error('Error opening story:', error);
                          Alert.alert('Error', 'Failed to open story');
                        }
                      }}
                    >
                      <Ionicons name="play-circle" size={20} color="black" />
                      <Text style={[styles.actionButtonText, { color: 'black' }]}>Story</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderWidth: 1, borderColor: theme.border }]}
                    onPress={() => {
                      // Navigate to friend's location
                      if (mapRef.current) {
                        mapRef.current.animateToRegion({
                          latitude: selectedFriend.latitude,
                          longitude: selectedFriend.longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        }, 1000);
                      }
                      closeActionSheet();
                    }}
                  >
                    <Ionicons name="navigate" size={20} color={theme.text} />
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Ghost mode indicator */}
      {ghostMode && (
        <View style={[styles.ghostModeIndicator, { backgroundColor: theme.surface }]}>
          <Ionicons name="eye-off" size={16} color={theme.accent} />
          <Text style={[styles.ghostModeText, { color: theme.text }]}>
            Ghost Mode: You're invisible
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  
  // Header styles
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
    borderRadius: 25,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Map controls
  mapControls: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 120 : 160,
    right: 20,
    zIndex: 10,
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Friend marker styles
  friendMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  storyRing: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 6,
    top: -9,
    left: -9,
  },
  bestFriendRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    top: -15,
    left: -15,
  },
  friendAvatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  statusDot: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  activityIcon: {
    position: 'absolute',
    top: -30,
    right: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 24,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  activityEmoji: {
    fontSize: 36,
  },
  
  // User marker styles
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  userMarkerGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  userAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  userPulseRing1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 212, 255, 0.4)',
    top: -30,
    left: -30,
  },
  userPulseRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 149, 246, 0.3)',
    top: -30,
    left: -30,
  },
  userPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
    top: -10,
    left: -10,
  },
  
  // Search modal styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 60 : 100,
  },
  searchModal: {
    margin: 20,
    borderRadius: 20,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  searchCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
  },
  searchResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultUsername: {
    fontSize: 14,
  },
  
  // Action sheet styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetBackdrop: {
    flex: 1,
  },
  actionSheet: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 15,
  },
  actionSheetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionSheetInfo: {
    flex: 1,
  },
  actionSheetName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSheetDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  actionSheetActivity: {
    fontSize: 14,
  },
  bestFriendBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 15,
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Ghost mode indicator
  ghostModeIndicator: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 120 : 160,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ghostModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // New styles for pulsing rings
  activePulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    top: -15,
    left: -15,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 255, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  liveDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
  },
  sharingIndicator: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(0, 255, 0, 0.9)',
    borderRadius: 24,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
});
